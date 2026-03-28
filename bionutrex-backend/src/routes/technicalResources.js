import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config for PDF/doc uploads
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resource-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

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
    const resources = await prisma.technicalResource.findMany({
      orderBy: { order: "asc" },
    });
    res.json(resources);
  } catch (error) {
    console.error("Get all technical resources error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/technical-resources — create (admin)
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { title, reference, category, productLine, description, icon, iconColor, active, order } =
      req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "title and category are required" });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

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

    const { title, reference, category, productLine, description, icon, iconColor, active, order } =
      req.body;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : existing.fileUrl;

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
        active:
          active !== undefined
            ? active === "true" || active === true
            : existing.active,
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

    await prisma.technicalResource.delete({ where: { id } });
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete technical resource error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
