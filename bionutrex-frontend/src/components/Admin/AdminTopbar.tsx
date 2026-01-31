import { useLocation, useNavigate } from "react-router-dom";
import { Home, Monitor, Tablet, Smartphone, X, Upload, Eye, EyeOff, LogOut, User } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Mapeo de rutas a titulos
const pageTitles: Record<string, { title: string; icon: React.ReactNode }> = {
  "/admin/dashboard": { title: "Dashboard", icon: <Home size={18} /> },
  "/admin/home": { title: "Home Page Editor", icon: <Home size={18} /> },
  "/admin/products": { title: "Product Catalog", icon: <Home size={18} /> },
  "/admin/clinical": { title: "Clinical Data", icon: <Home size={18} /> },
  "/admin/media": { title: "Media Library", icon: <Home size={18} /> },
  "/admin/users": { title: "User Management", icon: <Home size={18} /> },
};

export default function AdminTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { 
    previewDevice, 
    setPreviewDevice, 
    isPreviewMode, 
    setIsPreviewMode 
  } = useAdmin();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/admin/login");
  };

  const currentPage = pageTitles[location.pathname] || {
    title: "Admin",
    icon: <Home size={18} />,
  };

  // Solo mostrar controles de preview en páginas que lo soporten
  const showPreviewControls = ["/admin/home"].includes(location.pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Título y estado */}
        <div className="flex items-center gap-4">
          {/* Título de página */}
          <div className="flex items-center gap-2 text-gray-700">
            {currentPage.icon}
            <span className="font-semibold">{currentPage.title}</span>
          </div>

          {/* Separador */}
          <div className="h-5 w-px bg-gray-300" />

          {/* Toggle Preview Mode */}
          {showPreviewControls && (
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isPreviewMode
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isPreviewMode ? (
                <>
                  <Eye size={14} />
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE PREVIEW
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  EDIT MODE
                </>
              )}
            </button>
          )}
        </div>

        {/* Centro - Controles de dispositivo */}
        {showPreviewControls && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`p-2 rounded-md transition-colors ${
                previewDevice === "desktop"
                  ? "bg-white shadow-sm text-gray-700"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
              title="Desktop (1200px+)"
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`p-2 rounded-md transition-colors ${
                previewDevice === "tablet"
                  ? "bg-white shadow-sm text-gray-700"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
              title="Tablet (768px - 1199px)"
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`p-2 rounded-md transition-colors ${
                previewDevice === "mobile"
                  ? "bg-white shadow-sm text-gray-700"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white"
              }`}
              title="Mobile (< 768px)"
            >
              <Smartphone size={18} />
            </button>
          </div>
        )}

        {/* Lado derecho - Usuario y acciones */}
        <div className="flex items-center gap-3">
          {/* Info del usuario */}
          {admin && (
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-700 font-medium">{admin.name}</span>
              </div>
              
              {/* Separador vertical */}
              <div className="h-4 w-px bg-gray-300" />
              
              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Botón Discard */}
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
            <span className="text-sm font-medium">Discard</span>
          </button>

          {/* Botón Publish */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg transition-colors">
            <Upload size={16} />
            <span className="text-sm font-medium">Publish Changes</span>
          </button>
        </div>
      </div>
    </header>
  );
}
