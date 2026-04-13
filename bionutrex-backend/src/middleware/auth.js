import { supabase } from "../lib/supabase.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    // Supabase verifica la firma y expiración del JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: "Invalid or expired token" });

    req.admin = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
