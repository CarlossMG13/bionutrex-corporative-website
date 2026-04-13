import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// El login lo maneja Supabase Auth directamente desde el frontend.
// Este endpoint verifica que el token del request sigue siendo válido.
router.get("/verify", authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
