import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Admin } from "@/types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001/api";

/** Llama al backend para confirmar que el token pertenece a un admin real. */
async function verifyAdminRole(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok; // 200 = admin válido · 403 = cliente sin privilegios
  } catch {
    return false;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión activa al montar — confirma rol antes de dar acceso
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const isAdmin = await verifyAdminRole(session.access_token);
        if (isAdmin) {
          setIsAuthenticated(true);
          setAdmin({ id: session.user.id, email: session.user.email!, name: session.user.email! });
        } else {
          // Sesión activa pero NO es admin (cuenta de cliente) — denegar acceso
          setIsAuthenticated(false);
          setAdmin(null);
        }
      }
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
        setAdmin(null);
        return;
      }

      // Para CUALQUIER evento con sesión activa (INITIAL_SESSION, SIGNED_IN,
      // TOKEN_REFRESHED, USER_UPDATED) — siempre verificar el rol en el backend.
      // Nunca asumir que una sesión Supabase válida implica permisos de admin.
      const isAdmin = await verifyAdminRole(session.access_token);
      if (isAdmin) {
        setIsAuthenticated(true);
        setAdmin({ id: session.user.id, email: session.user.email!, name: session.user.email! });
      } else {
        // Sesión válida pero sin privilegios de admin (puede ser sesión de cliente)
        // No cerrar sesión — solo denegar acceso al panel
        setIsAuthenticated(false);
        setAdmin(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    // Verificar rol inmediatamente tras el login para dar feedback preciso
    const isAdmin = await verifyAdminRole(data.session!.access_token);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return { success: false, error: "No tienes permisos de administrador" };
    }

    // Establecer estado ANTES de retornar para que navigate() en Login.tsx
    // encuentre isAuthenticated=true y el ProtectedRoute no rechace el acceso
    setIsAuthenticated(true);
    setAdmin({ id: data.user.id, email: data.user.email!, name: data.user.email! });

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { isAuthenticated, admin, loading, login, logout };
}
