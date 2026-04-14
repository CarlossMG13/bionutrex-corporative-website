import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendOrderConfirmationEmail } from "../services/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
const router = express.Router();

/**
 * POST /api/checkout/payment-intent
 * Solo crea el PaymentIntent en Stripe — NO guarda nada en la BD todavía.
 * La orden se crea únicamente cuando el pago se confirma.
 */
router.post("/payment-intent", async (req, res) => {
  try {
    const { items, email, fullName, phone, address, city, state, zip } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No hay productos en el carrito" });
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalCents = Math.round(total * 100);

    if (totalCents < 50) {
      return res.status(400).json({ error: "El monto mínimo es $0.50" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "mxn",
      receipt_email: email || undefined,
      // Guardamos los datos del pedido en metadata para poder crear la orden al confirmar
      metadata: {
        fullName: fullName || "",
        email: email || "",
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        zip: zip || "",
        items: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          }))
        ),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment intent error:", error);
    res.status(500).json({ error: "Error al crear el pago" });
  }
});

/**
 * POST /api/checkout/confirm
 * Verifica el pago con Stripe y crea la orden en la BD.
 * Solo se llama cuando el pago fue exitoso — evita registros abandonados.
 */
router.post("/confirm", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Verificar con Stripe que el pago fue exitoso
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "El pago no fue confirmado" });
    }

    // Verificar que no existe ya una orden para este paymentIntent (idempotencia)
    const existing = await prisma.order.findFirst({
      where: { paymentIntentId },
    });
    if (existing) {
      return res.json({ success: true, order: existing });
    }

    // Recuperar datos del metadata
    const meta = paymentIntent.metadata;
    const items = JSON.parse(meta.items || "[]");

    const order = await prisma.order.create({
      data: {
        fullName: meta.fullName || "Sin nombre",
        email: meta.email || "",
        phone: meta.phone || null,
        address: meta.address || "",
        city: meta.city || null,
        state: meta.state || null,
        zip: meta.zip || null,
        total: paymentIntent.amount / 100,
        paymentIntentId,
        status: "paid",
        paid: true,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Enviar email de confirmación (fire-and-forget, no bloquea la respuesta)
    sendOrderConfirmationEmail(order);

    res.json({ success: true, order });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: "Error al confirmar el pago" });
  }
});

export default router;
