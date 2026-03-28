import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const VALID_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

/**
 * GET /api/admin/orders — Todos los pedidos con items y productos
 */
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    res.json({ orders, stats });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

/**
 * GET /api/admin/orders/:id — Detalle de un pedido
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, badge: true },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedido" });
  }
});

/**
 * PATCH /api/admin/orders/:id/status — Actualiza el status del pedido
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status,
        paid: status === "paid" || status === "processing" || status === "shipped" || status === "delivered",
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar status" });
  }
});

export default router;
