import { useLocation } from "react-router-dom";
import { Home, Monitor, Tablet, Smartphone, X, Upload } from "lucide-react";

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
  const currentPage = pageTitles[location.pathname] || {
    title: "Admin",
    icon: <Home size={18} />,
  };

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

          {/* Indicador Live Preview */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-600">LIVE PREVIEW</span>
          </div>
        </div>

        {/* Centro - Controles de dispositivo */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            className="p-2 rounded-md bg-white shadow-sm text-gray-700"
            title="Desktop"
          >
            <Monitor size={18} />
          </button>
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
            title="Tablet"
          >
            <Tablet size={18} />
          </button>
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
            title="Mobile"
          >
            <Smartphone size={18} />
          </button>
        </div>

        {/* Lado derecho - Acciones */}
        <div className="flex items-center gap-3">
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
