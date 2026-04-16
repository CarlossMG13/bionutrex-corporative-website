import { supabase } from "../lib/supabase.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * userAuthMiddleware — autentica clientes (tabla users)
 *
 * 1. Lee el Bearer token del header Authorization
 * 2. Verifica con Supabase Auth
 * 3. Busca o crea el User en la tabla users
 * 4. Expone req.user para el resto de la ruta
 */
export const userAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const email = supabaseUser.email;
    const name = supabaseUser.user_metadata?.name || null;

    // Bloquear emails de admin: esta ruta es exclusiva de clientes
    const adminRecord = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });
    if (adminRecord) {
      return res.status(403).json({
        error: "admin_account",
        message: "Esta cuenta es de uso exclusivo del panel de administración.",
      });
    }

    // Upsert: crea el User si no existe (primera sesión post-verificación)
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},                         // no sobreescribir datos del perfil ya editados
      create: { email, name },
    });

    req.user = dbUser;
    next();
  } catch (err) {
    console.error("userAuthMiddleware error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

/**
 * optionalUserAuth — igual que userAuthMiddleware pero NO bloquea si no hay token.
 * Útil para endpoints públicos que también sirven a usuarios autenticados.
 */
export const optionalUserAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) return next();

    const email = supabaseUser.email;
    const name = supabaseUser.user_metadata?.name || null;

    // Si es admin, no lo tratamos como cliente (falla silenciosa en rutas opcionales)
    const adminRecord = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });
    if (adminRecord) return next();

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

    req.user = dbUser;
    next();
  } catch {
    next(); // falla silenciosamente
  }
};
