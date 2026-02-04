import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db.js';
import { generateToken } from '../utils/helpers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Buscar admin por email
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generar token
    const token = generateToken({ adminId: admin.id });

    // Respuesta sin password
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      token,
      admin: adminWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (solo para crear el primer admin)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verificar si ya existe un admin con ese email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generar token
    const token = generateToken({ adminId: admin.id });

    res.status(201).json({
      token,
      admin
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verificar token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    res.json({ admin: req.admin });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;