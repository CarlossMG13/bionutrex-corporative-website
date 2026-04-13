import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Admin } from "@/types";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión activa al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setAdmin({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!,
        });
      }
      setLoading(false);
    });

    // Escuchar cambios de sesión (login/logout en otra pestaña, expiración, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setAdmin({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!,
        });
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { isAuthenticated, admin, loading, login, logout };
}
