import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Zap, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("loading");
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Supabase redirige a esta página con el token en el hash de la URL:
     *   /auth/verify#access_token=...&type=signup
     *
     * El cliente de Supabase lee el hash automáticamente en onAuthStateChange.
     * Solo necesitamos escuchar el evento y confirmar que el tipo es SIGNED_IN.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setStatus("success");
        // Redirige al catálogo tras 2.5 s
        setTimeout(() => navigate("/catalogo"), 2500);
      } else if (event === "TOKEN_REFRESHED") {
        setStatus("success");
        setTimeout(() => navigate("/catalogo"), 2500);
      }
    });

    // Si ya hay sesión activa (recarga de página), marcar como éxito directo
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
        setTimeout(() => navigate("/catalogo"), 2500);
      } else {
        // Dar 4 segundos para que el hash sea procesado
        const timeout = setTimeout(() => {
          setStatus((current) => (current === "loading" ? "error" : current));
        }, 4000);
        return () => clearTimeout(timeout);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-[#EEEEEE] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'Raleway', sans-serif" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1.5 mb-12">
        <Zap className="w-7 h-7 text-[#00e5ff] fill-[#00e5ff]" />
        <span className="text-2xl font-black tracking-tighter uppercase italic text-black">
          Bionutrex
        </span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-5">
              <Loader className="w-12 h-12 text-[#0d40a5] animate-spin" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Verificando tu correo…
            </h1>
            <p className="text-gray-400 text-sm">Un momento, por favor.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              ¡Correo verificado!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Tu cuenta está activa. Te redirigimos al catálogo en un momento.
            </p>
            <Link
              to="/catalogo"
              className="inline-block bg-[#0d40a5] text-white font-black text-xs uppercase
                         tracking-widest px-8 py-3 rounded-xl hover:bg-[#0d40a5]/90 transition-colors"
            >
              Ir al catálogo
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight mb-2">
              Link inválido
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              El link de verificación expiró o ya fue usado. Intenta iniciar sesión o regístrate de nuevo.
            </p>
            <Link
              to="/"
              className="inline-block bg-[#0d40a5] text-white font-black text-xs uppercase
                         tracking-widest px-8 py-3 rounded-xl hover:bg-[#0d40a5]/90 transition-colors"
            >
              Ir al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
