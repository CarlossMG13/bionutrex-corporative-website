import express from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/sliders - Obtener sliders activos (público)
router.get('/', async (req, res) => {
  try {
    const sliders = await prisma.slider.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });

    res.json(sliders);
  } catch (error) {
    console.error('Get sliders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sliders/admin/all - Obtener todos los sliders (admin)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(sliders);
  } catch (error) {
    console.error('Get all sliders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sliders/:id - Obtener slider por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const slider = await prisma.slider.findUnique({
      where: { id }
    });

    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    res.json(slider);
  } catch (error) {
    console.error('Get slider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sliders - Crear slider (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, order, active } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const slider = await prisma.slider.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        order: order ? parseInt(order) : 0,
        active: active === 'true' || active === true
      }
    });

    res.status(201).json(slider);
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/sliders/:id - Actualizar slider (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, buttonText, buttonLink, order, active } = req.body;

    const existingSlider = await prisma.slider.findUnique({
      where: { id }
    });

    if (!existingSlider) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    const updateData = {
      title: title || existingSlider.title,
      subtitle: subtitle !== undefined ? subtitle : existingSlider.subtitle,
      description: description !== undefined ? description : existingSlider.description,
      buttonText: buttonText !== undefined ? buttonText : existingSlider.buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : existingSlider.buttonLink,
      order: order !== undefined ? parseInt(order) : existingSlider.order,
      active: active !== undefined ? (active === 'true' || active === true) : existingSlider.active
    };

    // Solo actualizar imagen si se subió una nueva
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const slider = await prisma.slider.update({
      where: { id },
      data: updateData
    });

    res.json(slider);
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/sliders/:id - Eliminar slider (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existingSlider = await prisma.slider.findUnique({
      where: { id }
    });

    if (!existingSlider) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    await prisma.slider.delete({
      where: { id }
    });

    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;