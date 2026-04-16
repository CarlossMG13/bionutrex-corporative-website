import express from "express";
import multer from "multer";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadFile, deleteFile, BUCKETS } from "../lib/storage.js";

const router = express.Router();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain", "application/zip",
    "image/jpeg", "image/png", "image/webp",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido"), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// GET /api/technical-resources — public
router.get("/", async (req, res) => {
  try {
    const resources = await prisma.technicalResource.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json(resources);
  } catch (error) {
    console.error("Get technical resources error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/technical-resources/admin/all — admin
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const resources = await prisma.technicalResource.findMany({ orderBy: { order: "asc" } });
    res.json(resources);
  } catch (error) {
    console.error("Get all technical resources error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/technical-resources — create (admin)
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { title, reference, category, productLine, description, icon, iconColor, active, order } = req.body;
    if (!title || !category) return res.status(400).json({ error: "title and category are required" });

    let fileUrl = null;
    if (req.file) {
      fileUrl = await uploadFile(
        req.file.buffer, BUCKETS.CMS, "resources",
        req.file.originalname, req.file.mimetype,
      );
    }

    const resource = await prisma.technicalResource.create({
      data: {
        title,
        reference: reference || null,
        category,
        productLine: productLine || null,
        description: description || null,
        fileUrl,
        icon: icon || "description",
        iconColor: iconColor || "blue",
        active: active === "false" ? false : true,
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error("Create technical resource error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/technical-resources/:id — update (admin)
router.put("/:id", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.technicalResource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Resource not found" });

    const { title, reference, category, productLine, description, icon, iconColor, active, order } = req.body;

    let fileUrl = existing.fileUrl;
    if (req.file) {
      if (existing.fileUrl) await deleteFile(existing.fileUrl);
      fileUrl = await uploadFile(
        req.file.buffer, BUCKETS.CMS, "resources",
        req.file.originalname, req.file.mimetype,
      );
    }

    const resource = await prisma.technicalResource.update({
      where: { id },
      data: {
        title: title || existing.title,
        reference: reference !== undefined ? reference || null : existing.reference,
        category: category || existing.category,
        productLine: productLine !== undefined ? productLine || null : existing.productLine,
        description: description !== undefined ? description || null : existing.description,
        fileUrl,
        icon: icon || existing.icon,
        iconColor: iconColor || existing.iconColor,
        active: active !== undefined ? active === "true" || active === true : existing.active,
        order: order !== undefined ? parseInt(order) : existing.order,
      },
    });

    res.json(resource);
  } catch (error) {
    console.error("Update technical resource error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/technical-resources/:id — delete (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.technicalResource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Resource not found" });

    if (existing.fileUrl) await deleteFile(existing.fileUrl);
    await prisma.technicalResource.delete({ where: { id } });
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete technical resource error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
