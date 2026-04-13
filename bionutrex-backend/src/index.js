import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import multer from "multer";

// Load env before importing lib modules that read process.env
dotenv.config();

import { uploadFile, deleteFile, BUCKETS } from "./lib/storage.js";

console.log("📦 Starting BioNutrex Backend...");

// Import routes
console.log("📥 Importing routes...");
import authRoutes from "./routes/auth.js";
import sliderRoutes from "./routes/sliders.js";
import homeSectionRoutes from "./routes/homeSections.js";
import blogPostRoutes from "./routes/blogPosts.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import technicalResourceRoutes from "./routes/technicalResources.js";
import cartRoutes from "./routes/cart.js";
import checkoutRoutes from "./routes/checkout.js";
import adminOrdersRoutes from "./routes/admin-orders.js";
console.log("✅ Routes imported successfully");

console.log("📂 Path setup complete");

// Load environment variables
console.log("✅ Environment variables loaded");

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`🔧 Creating Express app on port ${PORT}...`);

// Middleware
console.log("📝 Setting up middleware...");
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "bionutrex-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
}));
console.log("✅ Middleware configured");

// Multer en memoria — los archivos se suben directo a Supabase Storage
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/jpg", "image/png", "image/gif",
    "image/webp", "image/svg+xml",
    "video/mp4", "video/avi", "video/mov", "video/mkv", "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "audio/mpeg", "audio/wav", "audio/ogg",
    "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido"), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

// Los archivos ahora se sirven desde Supabase Storage (no hay carpeta /uploads local)

// Routes
console.log("🛣️  Registering API routes...");
app.use("/api/auth", authRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/home-sections", homeSectionRoutes);
app.use("/api/blog-posts", blogPostRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/technical-resources", technicalResourceRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
console.log("✅ All routes registered");

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BioNutrex API is running",
    timestamp: new Date().toISOString(),
  });
});

// List uploaded files — lista los archivos del bucket cms-assets
app.get("/api/uploads/list", async (req, res) => {
  try {
    const { supabase } = await import("./lib/supabase.js");
    const { data, error } = await supabase.storage.from(BUCKETS.CMS).list("", { limit: 200 });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((f) => f.name));
  } catch (error) {
    console.error("Error listing uploads:", error);
    res.status(500).json({ error: "Error listing uploaded files" });
  }
});

// Upload single file — sube al bucket cms-assets
app.post("/api/uploads", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se ha subido ningún archivo" });

    // El folder puede venir como query param: ?folder=sliders
    const folder = req.query.folder || "general";
    const url = await uploadFile(
      req.file.buffer,
      BUCKETS.CMS,
      folder,
      req.file.originalname,
      req.file.mimetype,
    );

    res.json({
      message: "Archivo subido exitosamente",
      originalName: req.file.originalname,
      size: req.file.size,
      url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error al subir el archivo" });
  }
});

// Upload multiple files
app.post("/api/uploads/multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido archivos" });
    }

    const folder = req.query.folder || "general";
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadFile(file.buffer, BUCKETS.CMS, folder, file.originalname, file.mimetype);
        return { originalName: file.originalname, size: file.size, url, type: file.mimetype };
      }),
    );

    res.json({
      message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error al subir los archivos" });
  }
});

// Delete file — recibe la URL pública y la elimina de Supabase Storage
app.delete("/api/uploads", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Se requiere la URL del archivo" });

    await deleteFile(url);
    res.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting file:", error);
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
