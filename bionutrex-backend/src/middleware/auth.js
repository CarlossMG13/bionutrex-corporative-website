import { supabase } from "../lib/supabase.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    // 1. Supabase verifica la firma y expiración del JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid or expired token" });

    // 2. Verifica que el usuario esté registrado como Admin en la BD.
    //    Esto impide que clientes registrados en la tienda accedan al panel.
    const adminRecord = await prisma.admin.findUnique({
      where: { email: user.email },
      select: { id: true, email: true },
    });

    if (!adminRecord) {
      return res.status(403).json({ error: "Access denied: administrator privileges required" });
    }

    req.admin = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
