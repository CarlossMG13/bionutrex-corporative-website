import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

async function getOrCreateCart(req) {
  let cartId = req.session.cartId;
  let cart;

  if (cartId) {
    cart = await prisma.cart.findUnique({ where: { id: cartId } });
  }

  if (!cart) {
    cart = await prisma.cart.create({ data: {} });
    req.session.cartId = cart.id;
  }

  return cart;
}

/**
 * GET /api/cart — Detalle del carrito
 */
router.get("/", async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.json({ items: [], total: 0, cartCount: 0 });

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: { variants: true },
          },
        },
      },
    },
  });

  if (!cart) return res.json({ items: [], total: 0, cartCount: 0 });

  const items = cart.items.map((item) => ({
    ...item,
    price: item.product.variants?.[0]?.price ?? 0,
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  res.json({ ...cart, items, total, cartCount });
});

/**
 * POST /api/cart/add/:productId — Añade o incrementa un producto
 */
router.post("/add/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + 1 },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: 1 },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });

    const cartCount = updated.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ success: true, cartCount });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Error al agregar al carrito" });
  }
});

/**
 * POST /api/cart/remove/:productId — Decrementa o elimina un item
 */
router.post("/remove/:productId", async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.status(404).json({ error: "No cart found" });

  const { productId } = req.params;
  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId, productId },
  });

  if (!cartItem) return res.status(404).json({ error: "Item not found" });

  if (cartItem.quantity > 1) {
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity - 1 },
    });
    res.json({ quantity: updated.quantity });
  } else {
    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    res.json({ quantity: 0, removed: true });
  }
});

/**
 * DELETE /api/cart/item/:productId — Elimina un producto completo del carrito
 */
router.delete("/item/:productId", async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.status(404).json({ error: "No cart found" });

  const { productId } = req.params;
  await prisma.cartItem.deleteMany({ where: { cartId, productId } });
  res.json({ success: true });
});

/**
 * DELETE /api/cart — Vacía el carrito
 */
router.delete("/", async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.json({ success: true });

  await prisma.cartItem.deleteMany({ where: { cartId } });
  res.json({ success: true });
});

export default router;
