const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

/**
 * 1. BUY NOW: Añade producto y redirige a creación de orden
 */
router.get('/buy-now/:productId', async (req, res) => {
    const { productId } = req.params;
    let cartId = req.session.cartId;

    // Obtener o crear carrito
    let cart = cartId ? await prisma.cart.findUnique({ where: { id: cartId } }) : null;
    if (!cart) {
        cart = await prisma.cart.create({ data: {} });
        req.session.cartId = cart.id;
    }

    // Upsert del producto en el carrito (get_or_create)
    const cartItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: productId }
    });

    if (cartItem) {
        await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: cartItem.quantity + 1 }
        });
    } else {
        await prisma.cartItem.create({
            data: { cartId: cart.id, productId: productId, quantity: 1 }
        });
    }

    res.redirect('/orders/create');
});

/**
 * 2. ORDER CREATE: Procesa el formulario de datos de envío
 */
router.post('/create', async (req, res) => {
    const cartId = req.session.cartId;
    if (!cartId) return res.redirect('/cart/detail');

    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } }
    });

    if (!cart || cart.items.length === 0) return res.redirect('/cart/detail');

    // En Node, extraemos los datos del formulario de req.body
    const { fullName, email, address } = req.body;

    try {
        // Transacción para crear orden e items
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    fullName,
                    email,
                    address,
                    paid: false,
                    userId: req.session.userId || null, // Si tienes login
                }
            });

            // Mapear items del carrito a la orden
            const orderItemsData = cart.items.map(item => ({
                orderId: newOrder.id,
                productId: item.productId,
                price: item.product.price, // Suponiendo que price existe en Product
                quantity: item.quantity
            }));

            await tx.orderItem.createMany({ data: orderItemsData });
            return newOrder;
        });

        req.session.orderId = order.id;
        res.redirect('/orders/payment-process');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear la orden");
    }
});

/**
 * 3. PAYMENT PROCESS: Genera la sesión de Checkout de Stripe
 */
router.get('/payment-process', async (req, res) => {
    const { orderId } = req.session;
    if (!orderId) return res.redirect('/cart/detail');

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
    });

    const line_items = order.items.map(item => ({
        price_data: {
            currency: 'mxn',
            product_data: { name: item.product.name },
            unit_amount: Math.round(Number(item.price) * 100), // Centavos
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/orders/payment-success`,
        cancel_url: `${req.protocol}://${req.get('host')}/orders/payment-cancelled`,
        metadata: { order_id: order.id.toString() }
    });

    res.redirect(303, session.url);
});

/**
 * 4. WEBHOOK: Confirmación segura de Stripe
 * IMPORTANTE: Esta ruta requiere el middleware express.raw()
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = parseInt(session.metadata.order_id);

        await prisma.order.update({
            where: { id: orderId },
            data: { paid: true }
        });
        
        console.log(`Orden ${orderId} pagada exitosamente.`);
    }

    res.json({ received: true });
});

module.exports = router;