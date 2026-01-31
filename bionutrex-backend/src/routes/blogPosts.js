import express from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { generateSlug } from '../utils/helpers.js';

const router = express.Router();

// GET /api/blog-posts - Obtener posts publicados (público)
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog-posts/admin/all - Obtener todos los posts (admin)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('Get all blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog-posts/slug/:slug - Obtener post por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        published: true 
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Incrementar views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: post.views + 1 }
    });

    res.json({ ...post, views: post.views + 1 });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/blog-posts - Crear post (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, author, published } = req.body;

    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({ error: 'Title, excerpt, content and author are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Generar slug único
    let slug = generateSlug(title);
    let counter = 1;
    
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title)}-${counter}`;
      counter++;
    }

    const isPublished = published === 'true' || published === true;
    
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        imageUrl,
        author,
        published: isPublished,
        publishedAt: isPublished ? new Date() : null,
        views: 0
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/blog-posts/:id - Actualizar post (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, author, published } = req.body;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updateData = {
      title: title || existingPost.title,
      excerpt: excerpt || existingPost.excerpt,
      content: content || existingPost.content,
      author: author || existingPost.author
    };

    // Actualizar slug si el título cambió
    if (title && title !== existingPost.title) {
      let slug = generateSlug(title);
      let counter = 1;
      
      while (await prisma.blogPost.findFirst({ 
        where: { slug, id: { not: id } } 
      })) {
        slug = `${generateSlug(title)}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
    }

    // Manejar publicación
    if (published !== undefined) {
      const isPublished = published === 'true' || published === true;
      updateData.published = isPublished;
      
      // Si se está publicando por primera vez
      if (isPublished && !existingPost.published) {
        updateData.publishedAt = new Date();
      }
    }

    // Solo actualizar imagen si se subió una nueva
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });

    res.json(post);
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/blog-posts/:id - Eliminar post (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;