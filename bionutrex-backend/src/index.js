import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

console.log("📦 Starting BioNutrex Backend...");

// Import routes
console.log("📥 Importing routes...");
import authRoutes from "./routes/auth.js";
import sliderRoutes from "./routes/sliders.js";
import homeSectionRoutes from "./routes/homeSections.js";
import blogPostRoutes from "./routes/blogPosts.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
console.log("✅ Routes imported successfully");

// ES modules setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("📂 Path setup complete");

// Load environment variables
console.log("⚙️  Loading environment variables...");
dotenv.config();
console.log("✅ Environment variables loaded");

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`🔧 Creating Express app on port ${PORT}...`);

// Middleware
console.log("📝 Setting up middleware...");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("✅ Middleware configured");

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsPath = path.join(__dirname, "../uploads");
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
  },
});

// Filtro para permitir múltiples tipos de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/mkv",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// Servir archivos estáticos (uploads)
console.log("🖼️  Setting up static file serving...");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
console.log("🛣️  Registering API routes...");
app.use("/api/auth", authRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/home-sections", homeSectionRoutes);
app.use("/api/blog-posts", blogPostRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
console.log("✅ All routes registered");

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BioNutrex API is running",
    timestamp: new Date().toISOString(),
  });
});

// List uploaded files
app.get("/api/uploads/list", (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, "../uploads");

    // Verificar si el directorio existe
    if (!fs.existsSync(uploadsPath)) {
      return res.json([]);
    }

    const files = fs.readdirSync(uploadsPath).filter((file) => {
      // Filtrar archivos comunes de media
      return file.match(
        /\.(jpg|jpeg|png|gif|webp|svg|mp4|avi|mov|mkv|webm|pdf|doc|docx|txt|mp3|wav|ogg|zip|rar|7z)$/i,
      );
    });

    res.json(files);
  } catch (error) {
    console.error("Error listing uploads:", error);
    res.status(500).json({ error: "Error listing uploaded files" });
  }
});

// Upload files endpoint
app.post("/api/uploads", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    res.json({
      message: "Archivo subido exitosamente",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error al subir el archivo" });
  }
});

// Upload multiple files endpoint
app.post("/api/uploads/multiple", upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido archivos" });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
    }));

    res.json({
      message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error al subir los archivos" });
  }
});

// Endpoint para eliminar un archivo de /uploads
app.delete("/api/uploads/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Eliminar el archivo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error al eliminar el archivo:", err);
        return res.status(500).json({ error: "Error al eliminar el archivo" });
      }

      res.json({ message: "Archivo eliminado correctamente" });
    });
  } catch (error) {
    console.error("Error en la eliminación del archivo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
console.log("🚀 Starting server...");
app.listen(PORT, () => {
  console.log(`✅ BioNutrex API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📂 Uploads served at: http://localhost:${PORT}/uploads`);
  console.log("🎉 Server is ready to receive requests!");
});
