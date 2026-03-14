import express from "express";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/categories — obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories — crear categoría (admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    const category = await prisma.category.create({
      data: { name, slug },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
