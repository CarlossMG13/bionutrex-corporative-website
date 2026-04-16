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

// ─── Direcciones ──────────────────────────────────────────────────────────────

/**
 * GET /api/users/me/addresses
 */
router.get("/me/addresses", userAuthMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    res.json(addresses);
  } catch (err) {
    console.error("GET /users/me/addresses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/users/me/addresses
 * Crea una nueva dirección. Máximo 3 por usuario.
 */
router.post("/me/addresses", userAuthMiddleware, async (req, res) => {
  try {
    const count = await prisma.userAddress.count({ where: { userId: req.user.id } });
    if (count >= 3) {
      return res.status(400).json({ error: "Máximo 3 direcciones permitidas" });
    }

    const { label, address, city, state, zip, isDefault } = req.body;
    if (!address || !city || !state || !zip) {
      return res.status(400).json({ error: "Campos requeridos: address, city, state, zip" });
    }

    // Si se marca como default, quitar default de las demás
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const created = await prisma.userAddress.create({
      data: {
        userId: req.user.id,
        label: label || "Casa",
        address,
        city,
        state,
        zip,
        isDefault: isDefault ?? count === 0, // Primera dirección = default
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("POST /users/me/addresses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/users/me/addresses/:id
 */
router.put("/me/addresses/:id", userAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Dirección no encontrada" });

    const { label, address, city, state, zip, isDefault } = req.body;

    if (isDefault && !existing.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.userAddress.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /users/me/addresses/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/users/me/addresses/:id/default
 * Establece una dirección como predeterminada.
 */
router.patch("/me/addresses/:id/default", userAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Dirección no encontrada" });

    await prisma.userAddress.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false },
    });

    const updated = await prisma.userAddress.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json(updated);
  } catch (err) {
    console.error("PATCH /users/me/addresses/:id/default error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/users/me/addresses/:id
 */
router.delete("/me/addresses/:id", userAuthMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.userAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Dirección no encontrada" });

    await prisma.userAddress.delete({ where: { id } });

    // Si era la default y quedan otras, asignar la más antigua como default
    if (existing.isDefault) {
      const next = await prisma.userAddress.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await prisma.userAddress.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /users/me/addresses/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
