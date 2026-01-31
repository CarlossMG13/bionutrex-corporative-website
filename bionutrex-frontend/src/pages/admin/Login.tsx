import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  // Redirigir si ya está autenticado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d40a5] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("¡Bienvenido al panel de administración!");
        navigate("/admin");
      } else {
        toast.error(result.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Error de conexión. Verifica que el servidor esté ejecutándose.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full py-5 flex items-center justify-center md:justify-between md:px-20">
        {/* Logo */}
        <Link
          to={"/"}
          className="canada text-[#0d40a5] flex items-center gap-1 text-xl font-bold uppercase"
        >
          <Activity size={17} />
          Bionutrex
        </Link>
        <span className="hidden md:block uppercase canada tracking-widest text-gray-600">
          Sistemas Biotech
        </span>
      </div>
      <div className="h-[90vh] flex flex-col items-center justify-center px-4 overflow-y-hidden">
        <div className="text-center pb-10">
          <h2 className="font-bold text-3xl canada">Acceso Seguro</h2>
          <span className="text-sm text-gray-700 text-light raleway">
            Panel de Administrador
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 md:p-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="raleway block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="raleway w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none transition-all duration-300 bg-gray-50"
                placeholder="ejemplo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="raleway block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="raleway w-full px-4 py-3 border border-gray-00 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none transition-all duration-300 bg-gray-50"
                placeholder="••••••••"
              />
            </div>

            {/* Extra options */}
            <div className="w-full flex items-center justify-between raleway text-xs">
              <span className="">Recordar Sesión</span>
              <Link to={"/"} className="text-[#0a2d6e] font-bold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="raleway cursor-pointer shadow-md w-full bg-[#0d40a5] text-white font-semibold py-3 rounded-lg hover:bg-[#0a2d6e] transition-all duration-300 transform  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* server status */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <span>Servidor Administrador Activo</span>
          </div>
        </div>
        {/* Advice - Restrict access */}
        <div className="pt-10 max-w-md text-center">
          <span className="raleway text-xs text-gray-500">
            Este es un sistema restringido. El acceso no autorizado está
            estrictamente prohibido y sujeto a monitoreo.
          </span>
        </div>
      </div>
    </>
  );
}
