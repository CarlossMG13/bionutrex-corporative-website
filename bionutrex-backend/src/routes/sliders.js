import express from "express";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadFile, deleteFile, BUCKETS } from "../lib/storage.js";

const router = express.Router();

// GET /api/sliders - Obtener sliders activos (público)
router.get("/", async (req, res) => {
  try {
    const sliders = await prisma.slider.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json(sliders);
  } catch (error) {
    console.error("Get sliders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sliders/admin/all - Obtener todos los sliders (admin)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const sliders = await prisma.slider.findMany({ orderBy: { order: "asc" } });
    res.json(sliders);
  } catch (error) {
    console.error("Get all sliders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sliders/:id - Obtener slider por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await prisma.slider.findUnique({ where: { id } });
    if (!slider) return res.status(404).json({ error: "Slider not found" });
    res.json(slider);
  } catch (error) {
    console.error("Get slider error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sliders - Crear slider (admin)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      title, titleSegments, subtitle, description, label,
      mediaType, videoUrl, videoMuted, accentColor,
      buttonText, buttonLink, button2Text, button2Link,
      stats, order, active,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!req.file) return res.status(400).json({ error: "Image is required" });

    const imageUrl = await uploadFile(
      req.file.buffer, BUCKETS.CMS, "sliders",
      req.file.originalname, req.file.mimetype,
    );

    const slider = await prisma.slider.create({
      data: {
        title,
        titleSegments: titleSegments || null,
        subtitle: subtitle || null,
        description: description || null,
        label: label || null,
        mediaType: mediaType || "image",
        imageUrl,
        videoUrl: videoUrl || null,
        videoMuted: videoMuted === "false" ? false : true,
        accentColor: accentColor || "#00e5ff",
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        button2Text: button2Text || null,
        button2Link: button2Link || null,
        stats: stats || null,
        order: order ? parseInt(order) : 0,
        active: active === "true" || active === true,
      },
    });

    res.status(201).json(slider);
  } catch (error) {
    console.error("Create slider error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/sliders/:id - Actualizar slider (admin)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, titleSegments, subtitle, description, label,
      mediaType, videoUrl, videoMuted, accentColor,
      buttonText, buttonLink, button2Text, button2Link,
      stats, order, active,
    } = req.body;

    const existing = await prisma.slider.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Slider not found" });

    const updateData = {
      title: title || existing.title,
      titleSegments: titleSegments !== undefined ? titleSegments : existing.titleSegments,
      subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
      description: description !== undefined ? description : existing.description,
      label: label !== undefined ? label : existing.label,
      mediaType: mediaType || existing.mediaType,
      videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
      videoMuted: videoMuted !== undefined ? videoMuted === "false" ? false : true : existing.videoMuted,
      accentColor: accentColor || existing.accentColor,
      buttonText: buttonText !== undefined ? buttonText : existing.buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : existing.buttonLink,
      button2Text: button2Text !== undefined ? button2Text : existing.button2Text,
      button2Link: button2Link !== undefined ? button2Link : existing.button2Link,
      stats: stats !== undefined ? stats : existing.stats,
      order: order !== undefined ? parseInt(order) : existing.order,
      active: active !== undefined ? active === "true" || active === true : existing.active,
    };

    if (req.file) {
      // Eliminar imagen anterior de Supabase
      if (existing.imageUrl) await deleteFile(existing.imageUrl);
      updateData.imageUrl = await uploadFile(
        req.file.buffer, BUCKETS.CMS, "sliders",
        req.file.originalname, req.file.mimetype,
      );
    }

    const slider = await prisma.slider.update({ where: { id }, data: updateData });
    res.json(slider);
  } catch (error) {
    console.error("Update slider error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/sliders/:id - Eliminar slider (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.slider.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Slider not found" });

    if (existing.active) {
      const activeCount = await prisma.slider.count({ where: { active: true } });
      if (activeCount <= 2) {
        return res.status(400).json({ error: "El Hero Section debe tener al menos 2 slides activos." });
      }
    }

    if (existing.imageUrl) await deleteFile(existing.imageUrl);
    await prisma.slider.delete({ where: { id } });
    res.json({ message: "Slider deleted successfully" });
  } catch (error) {
    console.error("Delete slider error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
