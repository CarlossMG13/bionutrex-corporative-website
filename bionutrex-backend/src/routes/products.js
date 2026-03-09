import express from "express";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// GET /api/products/featured — activos + featured (público)
router.get("/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { featuredOrder: "asc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/admin/all — todos (admin)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { name: "asc" },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products — activos (público)
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products — crear (admin)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      badge,
      badgeColor,
      rating,
      reviewCount,
      featured,
      featuredOrder,
      active,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!price) return res.status(400).json({ error: "Price is required" });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    if (!imageUrl) return res.status(400).json({ error: "Image is required" });

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        imageUrl,
        badge: badge || null,
        badgeColor: badgeColor || "#0d40a5",
        rating: rating ? parseFloat(rating) : 5.0,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
        featured: featured === "true",
        featuredOrder: featuredOrder ? parseInt(featuredOrder) : 0,
        active: active !== "false",
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/products/:id — actualizar (admin)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      badge,
      badgeColor,
      rating,
      reviewCount,
      featured,
      featuredOrder,
      active,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const updateData = {
      name: name || existing.name,
      price: price !== undefined ? parseFloat(price) : existing.price,
      badge: badge !== undefined ? badge || null : existing.badge,
      badgeColor: badgeColor || existing.badgeColor,
      rating: rating !== undefined ? parseFloat(rating) : existing.rating,
      reviewCount:
        reviewCount !== undefined
          ? parseInt(reviewCount)
          : existing.reviewCount,
      featured:
        featured !== undefined ? featured === "true" : existing.featured,
      featuredOrder:
        featuredOrder !== undefined
          ? parseInt(featuredOrder)
          : existing.featuredOrder,
      active: active !== undefined ? active === "true" : existing.active,
    };

    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/products/:id — eliminar (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
