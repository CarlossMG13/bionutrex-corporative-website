import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { userAPI } from "@/services/api";
import type { CustomerUser } from "@/types";
import type { Session } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthUserContextType {
  /** Perfil del cliente en nuestra BD (null si no está autenticado) */
  user: CustomerUser | null;
  /** Sesión de Supabase (null si no está autenticado) */
  session: Session | null;
  /** true mientras se resuelve la sesión inicial */
  loading: boolean;
  /** true cuando el drawer de auth está abierto */
  isAuthOpen: boolean;

  openAuth: () => void;
  closeAuth: () => void;
  toggleAuth: () => void;

  /** Registro con Supabase Auth — envía email de verificación */
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;

  /** Login con Supabase Auth */
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  /** Cerrar sesión */
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthUserContext = createContext<AuthUserContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Después de que Supabase confirma la sesión, sincronizamos el User con la BD.
   * También marca el email como verificado la primera vez.
   */
  const syncUserWithBackend = useCallback(async () => {
    try {
      const { data } = await userAPI.sync();
      setUser(data.user);
    } catch {
      // Si sync falla (p.ej. email aún no verificado), intenta solo getMe
      try {
        const { data } = await userAPI.getMe();
        setUser(data);
      } catch {
        setUser(null);
      }
    }
  }, []);

  // ── Supabase Auth listener ────────────────────────────────────────────────

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        syncUserWithBackend().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Cambios en tiempo real (login, logout, verificación de email, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        syncUserWithBackend();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncUserWithBackend]);

  // ── Drawer ───────────────────────────────────────────────────────────────

  const openAuth = useCallback(() => setIsAuthOpen(true), []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);
  const toggleAuth = useCallback(() => setIsAuthOpen((v) => !v), []);

  // ── Auth actions ─────────────────────────────────────────────────────────

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          // Redirige aquí cuando el usuario hace clic en el link del correo
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Traducción de errores comunes de Supabase
      const msg =
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : error.message === "Email not confirmed"
          ? "Debes verificar tu correo antes de iniciar sesión"
          : error.message;
      return { success: false, error: msg };
    }
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AuthUserContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthOpen,
        openAuth,
        closeAuth,
        toggleAuth,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthUser() {
  const ctx = useContext(AuthUserContext);
  if (!ctx) throw new Error("useAuthUser must be used within AuthUserProvider");
  return ctx;
}
