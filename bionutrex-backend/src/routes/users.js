import express from "express";
import { PrismaClient } from "@prisma/client";
import { userAuthMiddleware } from "../middleware/userAuth.js";
import { sendWelcomeEmail } from "../services/email.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /api/users/me
 * Devuelve el perfil del cliente autenticado.
 * El middleware hace upsert si es la primera vez que el usuario llega post-verificación.
 */
router.get("/me", userAuthMiddleware, async (req, res) => {
  try {
    // Incluir órdenes recientes y conteo
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/users/sync
 * Sincroniza el User en la BD después del primer login post-verificación de email.
 * También envía el email de bienvenida la primera vez.
 */
router.post("/sync", userAuthMiddleware, async (req, res) => {
  try {
    const isNew = !req.user.emailVerified;

    // Marcar email como verificado si aún no lo estaba
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        emailVerified: req.user.emailVerified ?? new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Enviar email de bienvenida solo la primera vez
    if (isNew) {
      sendWelcomeEmail(user.email, user.name);
    }

    res.json({ user, isNew });
  } catch (err) {
    console.error("POST /users/sync error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/users/me
 * Actualiza nombre, teléfono e imagen del perfil.
 */
router.put("/me", userAuthMiddleware, async (req, res) => {
  try {
    const { name, phone, image } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /users/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/users/me/orders
 * Devuelve los pedidos del cliente autenticado.
 */
router.get("/me/orders", userAuthMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    res.json(orders);
  } catch (err) {
    console.error("GET /users/me/orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
