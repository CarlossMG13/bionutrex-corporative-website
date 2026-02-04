import { Outlet } from "react-router-dom";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import EditPanel from "./EditPanel";

// Componente interno que usa el contexto
function AdminLayoutContent() {
  const { previewDevice, isPreviewMode } = useAdmin();

  // Configuración de dimensiones por dispositivo
  const deviceStyles = {
    desktop: {
      width: "100%",
      maxWidth: "none",
      margin: "0",
      border: "none",
      borderRadius: "0.75rem",
    },
    tablet: {
      width: "768px",
      maxWidth: "768px",
      margin: "0 auto",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    mobile: {
      width: "375px",
      maxWidth: "375px",
      margin: "0 auto",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
  };

  const previewStyle = isPreviewMode ? deviceStyles[previewDevice] : deviceStyles.desktop;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar izquierdo */}
      <AdminSidebar />

      {/* Contenido Principal */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <AdminTopbar />

        {/* Area de contenido central (preview) */}
        <main 
          className={`flex-1 overflow-y-auto ${
            isPreviewMode ? "p-6 bg-gray-200" : "p-6"
          }`}
        >
          <div 
            className="bg-white min-h-full transition-all duration-300"
            style={previewStyle}
          >
            {/* Barra de información del dispositivo en modo preview */}
            {isPreviewMode && previewDevice !== "desktop" && (
              <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-t-lg">
                {previewDevice === "tablet" ? "iPad (768px)" : "iPhone (375px)"} Preview
              </div>
            )}
            
            <div className={`${isPreviewMode && previewDevice !== "desktop" ? "" : "rounded-xl shadow-sm"}`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Panel de edicion */}
      <EditPanel />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminLayoutContent />
    </AdminProvider>
  );
}
