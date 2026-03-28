import express from "express";
import prisma from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// GET /api/products/featured — activos + featured (público)
router.get("/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: {
        category: true,
        variants: true,
      },
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
      include: {
        category: true,
        variants: true,
      },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { name: "asc" },
      ],
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
      include: {
        category: true,
        variants: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/products — crear (admin)
router.post("/", authMiddleware, upload.single("imageFile"), async (req, res) => {
  try {
    console.log("POST /products - Request body:", req.body);
    console.log("POST /products - File:", req.file);
    
    const {
      name,
      description,
      categoryId,
      badge,
      badgeColor,
      rating,
      reviewCount,
      featured,
      featuredOrder,
      active,
      imageUrl,
      variants,
    } = req.body;

    // Validaciones
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!categoryId) return res.status(400).json({ error: "CategoryId is required" });

    // Verificar que la categoría existe
    console.log("Checking if category exists:", categoryId);
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      console.error("Category not found:", categoryId);
      return res.status(400).json({ error: `Category not found with id: ${categoryId}` });
    }
    console.log("Category found:", category.name);

    // Determinar la URL de imagen
    let finalImageUrl = imageUrl || "";
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }
    if (!finalImageUrl) return res.status(400).json({ error: "Image is required" });

    console.log("Final image URL:", finalImageUrl);

    // Parsear variantes si viene como string
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        console.log("Parsed variants:", parsedVariants);
      } catch (e) {
        console.error("Error parsing variants:", e);
        parsedVariants = [];
      }
    }

    // Si no hay variantes, crear una variante por defecto
    if (parsedVariants.length === 0) {
      console.warn("No variants provided, but variants are required. Adding default variant.");
      parsedVariants = [{
        name: name,
        price: 0,
        stock: 0,
      }];
    }

    console.log("Creating product with data:", {
      name,
      categoryId,
      description,
      badge,
      badgeColor,
      rating,
      reviewCount,
      featured,
      featuredOrder,
      active,
      imageUrl: finalImageUrl,
      variantsCount: parsedVariants.length,
    });

    // Crear producto
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
        // Crear variantes
        variants: {
          create: parsedVariants.map(v => ({
            name: v.name || name,
            price: parseFloat(v.price) || 0,
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            pieces: v.pieces ? parseInt(v.pieces) : null,
            grams: v.grams ? parseFloat(v.grams) : null,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    });

    console.log("Product created successfully:", product.id);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// PUT /api/products/:id — actualizar (admin)
router.put("/:id", authMiddleware, upload.single("imageFile"), async (req, res) => {
  try {
    console.log("PUT /products/:id - Request body:", req.body);
    console.log("PUT /products/:id - File:", req.file);
    
    const { id } = req.params;
    const {
      name,
      description,
      categoryId,
      badge,
      badgeColor,
      rating,
      reviewCount,
      featured,
      featuredOrder,
      active,
      imageUrl,
      variants,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Product not found" });

    // Determinar la URL de imagen
    let finalImageUrl = existing.imageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    // Parsear variantes si viene como string
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        console.log("Parsed variants:", parsedVariants);
      } catch (e) {
        console.error("Error parsing variants:", e);
        parsedVariants = [];
      }
    }

    // Preparar datos de actualización
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
    };

    // Eliminar variantes antiguas y crear nuevas
    if (parsedVariants && parsedVariants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      updateData.variants = {
        create: parsedVariants.map(v => ({
          name: v.name || name,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          sku: v.sku || null,
          pieces: v.pieces ? parseInt(v.pieces) : null,
          grams: v.grams ? parseFloat(v.grams) : null,
        })),
      };
    }

    console.log("Updating product:", id, "with data:", updateData);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        variants: true,
      },
    });

    console.log("Product updated successfully:", product.id);
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// DELETE /api/products/:id — eliminar (admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("DELETE /products/:id - Request ID:", req.params.id);
    
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      console.warn("Product not found:", id);
      return res.status(404).json({ error: "Product not found" });
    }

    // Eliminar archivo del almacenamiento
    if (existing.imageUrl) {
      const filePath = path.join(process.cwd(), existing.imageUrl);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", filePath, err.message);
        } else {
          console.log("File deleted successfully:", filePath);
        }
      });
    }

    // Eliminar variantes
    console.log("Deleting variants for product:", id);
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    // Eliminar producto
    console.log("Deleting product:", id);
    await prisma.product.delete({ where: { id } });

    console.log("Product deleted successfully:", id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default router;
