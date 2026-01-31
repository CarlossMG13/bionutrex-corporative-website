import express from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/home-sections - Obtener secciones activas (público)
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.homeSection.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });

    res.json(sections);
  } catch (error) {
    console.error('Get home sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/home-sections/admin/all - Obtener todas las secciones (admin)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(sections);
  } catch (error) {
    console.error('Get all home sections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/home-sections/key/:key - Obtener sección por key
router.get('/key/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const section = await prisma.homeSection.findUnique({
      where: { 
        sectionKey: key,
        active: true 
      }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Get section by key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/home-sections - Crear sección (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { sectionKey, title, subtitle, content, buttonText, buttonLink, order, active } = req.body;

    if (!sectionKey || !title || !content) {
      return res.status(400).json({ error: 'Section key, title and content are required' });
    }

    // Verificar que no existe una sección con esa key
    const existingSection = await prisma.homeSection.findUnique({
      where: { sectionKey }
    });

    if (existingSection) {
      return res.status(400).json({ error: 'Section with this key already exists' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const section = await prisma.homeSection.create({
      data: {
        sectionKey,
        title,
        subtitle: subtitle || null,
        content,
        imageUrl,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        order: order ? parseInt(order) : 0,
        active: active === 'true' || active === true
      }
    });

    res.status(201).json(section);
  } catch (error) {
    console.error('Create home section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/home-sections/:id - Actualizar sección (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionKey, title, subtitle, content, buttonText, buttonLink, order, active } = req.body;

    const existingSection = await prisma.homeSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const updateData = {
      sectionKey: sectionKey || existingSection.sectionKey,
      title: title || existingSection.title,
      subtitle: subtitle !== undefined ? subtitle : existingSection.subtitle,
      content: content || existingSection.content,
      buttonText: buttonText !== undefined ? buttonText : existingSection.buttonText,
      buttonLink: buttonLink !== undefined ? buttonLink : existingSection.buttonLink,
      order: order !== undefined ? parseInt(order) : existingSection.order,
      active: active !== undefined ? (active === 'true' || active === true) : existingSection.active
    };

    // Solo actualizar imagen si se subió una nueva
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const section = await prisma.homeSection.update({
      where: { id },
      data: updateData
    });

    res.json(section);
  } catch (error) {
    console.error('Update home section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/home-sections/:id - Eliminar sección (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existingSection = await prisma.homeSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await prisma.homeSection.delete({
      where: { id }
    });

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete home section error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;