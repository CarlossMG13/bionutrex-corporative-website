const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

/**
 * Helper para obtener o crear el carrito basado en la sesión
 */
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
 * 1. Añade un producto al carrito (Redirect style)
 */
router.get('/add/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req);

    // Buscamos si el item ya existe en el carrito
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
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: 1
        }
      });
    }

    // En Express, los mensajes flash requieren un middleware extra (como connect-flash)
    // Aquí simplemente redireccionamos al detalle del producto
    res.redirect(`/products/${productId}`);
  } catch (error) {
    res.status(500).send("Error al añadir al carrito");
  }
});

/**
 * 2. Detalle del carrito
 */
router.get('/detail', async (req, res) => {
  const cartId = req.session.cartId;
  
  if (!cartId) {
    return res.json({ cart: null }); // O render('cart/detail', { cart: null })
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  res.json(cart);
});

/**
 * 3. Elimina un producto por completo del carrito
 */
router.get('/remove/:productId', async (req, res) => {
  const cartId = req.session.cartId;
  const { productId } = req.params;

  if (cartId) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cartId, productId: productId }
    });
  }
  res.redirect('/cart/detail');
});

/**
 * 4. Incrementa cantidad (AJAX / JSON)
 */
router.post('/item/add/:productId', async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.status(404).json({ error: 'No cart found' });

  const { productId } = req.params;

  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId, productId }
  });

  if (cartItem) {
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + 1 },
      include: { product: true }
    });

    // Nota: El cálculo del total se hace en JS ya que Prisma no guarda métodos
    res.json({ 
      quantity: updated.quantity,
      // Suponiendo que el precio está en el modelo Product
      item_total: updated.quantity * Number(updated.product.price) 
    });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

/**
 * 5. Decrementa cantidad o elimina (AJAX / JSON)
 */
router.post('/item/remove/:productId', async (req, res) => {
  const cartId = req.session.cartId;
  if (!cartId) return res.status(404).json({ error: 'No cart found' });

  const { productId } = req.params;

  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId, productId }
  });

  if (!cartItem) return res.status(404).json({ error: 'Item not found' });

  if (cartItem.quantity > 1) {
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity - 1 }
    });
    res.json({ quantity: updated.quantity });
  } else {
    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    res.json({ quantity: 0, removed: true });
  }
});

module.exports = router;