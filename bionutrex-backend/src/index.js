import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Import routes
import authRoutes from './routes/auth.js';
import sliderRoutes from './routes/sliders.js';
import homeSectionRoutes from './routes/homeSections.js';
import blogPostRoutes from './routes/blogPosts.js';

// ES modules setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsPath = path.join(__dirname, '../uploads');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único con UUID
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const uniqueName = `${name}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/home-sections', homeSectionRoutes);
app.use('/api/blog-posts', blogPostRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BioNutrex API is running',
    timestamp: new Date().toISOString()
  });
});

// List uploaded files
app.get('/api/uploads/list', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../uploads');
    
    // Verificar si el directorio existe
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(uploadsPath).filter(file => {
      // Filtrar solo archivos de imagen
      return file.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    });
    
    res.json(files);
  } catch (error) {
    console.error('Error listing uploads:', error);
    res.status(500).json({ error: 'Error listing uploaded files' });
  }
});

// Upload files endpoint
app.post('/api/uploads', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    res.json({
      message: 'Archivo subido exitosamente',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BioNutrex API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📂 Uploads served at: http://localhost:${PORT}/uploads`);
});