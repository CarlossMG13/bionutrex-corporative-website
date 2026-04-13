import express from "express";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { uploadFile, deleteFile, BUCKETS } from "../lib/storage.js";

const router = express.Router();

// GET /api/products/featured — activos + featured (público)
router.get("/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true, variants: true },
      orderBy: { featuredOrder: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Get featured error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/admin/all — todos (admin)
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: [{ featured: "desc" }, { featuredOrder: "asc" }, { name: "asc" }],
    });
    res.json(products);
  } catch (error) {
    console.error("Get admin all error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products — activos (público)
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { category: true, variants: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id — público
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products — crear (admin)
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "imageFile", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        name, description, categoryId, badge, badgeColor,
        rating, reviewCount, featured, featuredOrder, active,
        imageUrl, variants, images, ingredients, longDescription, features,
      } = req.body;

      if (!name) return res.status(400).json({ error: "Name is required" });
      if (!categoryId) return res.status(400).json({ error: "CategoryId is required" });

      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return res.status(400).json({ error: `Category not found: ${categoryId}` });

      const uploadedFile = req.files?.imageFile?.[0] ?? req.files?.image?.[0];
      let finalImageUrl = imageUrl || "";
      if (uploadedFile) {
        finalImageUrl = await uploadFile(
          uploadedFile.buffer, BUCKETS.PRODUCTS, "covers",
          uploadedFile.originalname, uploadedFile.mimetype,
        );
      }
      if (!finalImageUrl) return res.status(400).json({ error: "Image is required" });

      let parsedVariants = [];
      if (variants) {
        try {
          parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        } catch { parsedVariants = []; }
      }
      if (parsedVariants.length === 0) {
        parsedVariants = [{ name, price: 0, stock: 0 }];
      }

      const product = await prisma.product.create({
        data: {
          name,
          description: description || null,
          imageUrl: finalImageUrl,
          badge: badge || null,
          badgeColor: badgeColor || "#0d40a5",
          rating: rating ? parseFloat(rating) : 5.0,
          reviewCount: reviewCount ? parseInt(reviewCount) : 0,
          featured: featured === "true" || featured === true,
          featuredOrder: featuredOrder ? parseInt(featuredOrder) : 0,
          active: active !== "false" && active !== false,
          categoryId,
          images: images || null,
          ingredients: ingredients || null,
          longDescription: longDescription || null,
          features: features || null,
          variants: {
            create: parsedVariants.map((v) => ({
              name: v.name || name,
              price: parseFloat(v.price) || 0,
              stock: parseInt(v.stock) || 0,
              sku: v.sku || null,
              pieces: v.pieces ? parseInt(v.pieces) : null,
              grams: v.grams ? parseFloat(v.grams) : null,
            })),
          },
        },
        include: { category: true, variants: true },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  },
);

// PUT /api/products/:id — actualizar (admin)
router.put(
  "/:id",
  authMiddleware,
  upload.fields([{ name: "imageFile", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name, description, categoryId, badge, badgeColor,
        rating, reviewCount, featured, featuredOrder, active,
        imageUrl, variants, images, ingredients, longDescription, features,
      } = req.body;

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Product not found" });

      const uploadedFile = req.files?.imageFile?.[0] ?? req.files?.image?.[0];
      let finalImageUrl = existing.imageUrl;
      if (uploadedFile) {
        if (existing.imageUrl) await deleteFile(existing.imageUrl);
        finalImageUrl = await uploadFile(
          uploadedFile.buffer, BUCKETS.PRODUCTS, "covers",
          uploadedFile.originalname, uploadedFile.mimetype,
        );
      } else if (imageUrl) {
        finalImageUrl = imageUrl;
      }

      let parsedVariants = [];
      if (variants) {
        try {
          parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        } catch { parsedVariants = []; }
      }

      const updateData = {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        imageUrl: finalImageUrl,
        categoryId: categoryId || existing.categoryId,
        badge: badge !== undefined ? badge || null : existing.badge,
        badgeColor: badgeColor || existing.badgeColor,
        rating: rating !== undefined ? parseFloat(rating) : existing.rating,
        reviewCount: reviewCount !== undefined ? parseInt(reviewCount) : existing.reviewCount,
        featured: featured !== undefined ? (featured === "true" || featured === true) : existing.featured,
        featuredOrder: featuredOrder !== undefined ? parseInt(featuredOrder) : existing.featuredOrder,
        active: active !== undefined ? (active !== "false" && active !== false) : existing.active,
        images: images !== undefined ? images || null : existing.images,
        ingredients: ingredients !== undefined ? ingredients || null : existing.ingredients,
        longDescription: longDescription !== undefined ? longDescription || null : existing.longDescription,
        features: features !== undefined ? features || null : existing.features,
      };

      if (parsedVariants.length > 0) {
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        updateData.variants = {
          create: parsedVariants.map((v) => ({
            name: v.name || name,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            pieces: v.pieces ? parseInt(v.pieces) : null,
            grams: v.grams ? parseFloat(v.grams) : null,
          })),
        };
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true, variants: true },
      });

      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  },
);

// DELETE /api/products/:id — eliminar (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    if (existing.imageUrl) await deleteFile(existing.imageUrl);

    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;
