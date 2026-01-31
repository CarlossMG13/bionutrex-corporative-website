import { useLocation, useNavigate } from "react-router-dom";
import { Home, Monitor, Tablet, Smartphone, X, Upload, Eye, EyeOff, LogOut, User, Loader2 } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/hooks/useAuth";
import { useHomeDataRefresh } from "@/contexts/HomeDataContext";
import { homeSectionAPI, sliderAPI } from "@/services/api";
import { toast } from "sonner";
import type { PendingChange } from "@/contexts/AdminContext";

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
    setIsPreviewMode,
    pendingChanges,
    clearPendingChanges,
    hasUnsavedChanges,
    isPublishing,
    setIsPublishing
  } = useAdmin();
  
  // Hook para refrescar datos del Home y aplicar cambios pendientes
  let triggerRefresh: (() => void) | null = null;
  let applyPendingChanges: ((changes: any[]) => void) | null = null;
  try {
    const context = useHomeDataRefresh();
    triggerRefresh = context.triggerRefresh;
    applyPendingChanges = context.applyPendingChanges;
  } catch (err) {
    // Context no disponible en todas las páginas
  }

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/admin/login");
  };

  // Función para publicar todos los cambios pendientes
  const handlePublishChanges = async () => {
    if (pendingChanges.length === 0) {
      toast.info("No hay cambios pendientes para publicar");
      return;
    }

    setIsPublishing(true);
    const loadingToast = toast.loading(`Publicando ${pendingChanges.length} cambios...`);
    
    try {
      let successCount = 0;
      let errorCount = 0;

      // Procesar cada cambio pendiente
      for (const change of pendingChanges) {
        try {
          await publishSingleChange(change);
          successCount++;
        } catch (error) {
          console.error(`Error publishing change ${change.id}:`, error);
          errorCount++;
        }
      }

      // Limpiar cambios pendientes si todos fueron exitosos
      if (errorCount === 0) {
        clearPendingChanges();
        toast.success(`✅ ${successCount} cambios publicados exitosamente`, {
          id: loadingToast
        });
        
        // Refresh completo del sitio para mostrar cambios
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay para que el usuario vea el mensaje de éxito
      } else {
        toast.warning(`⚠️ ${successCount} cambios publicados, ${errorCount} fallaron`, {
          id: loadingToast
        });
      }

      // Refrescar datos del Home si está disponible
      if (triggerRefresh) {
        triggerRefresh();
      }
      
      // Aplicar cambios pendientes al contexto inmediatamente
      if (applyPendingChanges && errorCount === 0) {
        applyPendingChanges([]);
      }

    } catch (error) {
      console.error('Error during batch publish:', error);
      toast.error("❌ Error al publicar cambios", {
        id: loadingToast
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Función para publicar un cambio individual
  const publishSingleChange = async (change: PendingChange): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token available');
    }

    switch (change.type) {
      case 'section':
        await publishSectionChange(change);
        break;
      case 'slider':
        await publishSliderChange(change);
        break;
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  };

  // Función para publicar cambios de secciones
  const publishSectionChange = async (change: PendingChange): Promise<void> => {
    const { action, data } = change;

    switch (action) {
      case 'update':
      case 'visibility':
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('active', data.active.toString());
        formData.append('order', data.order.toString());
        
        if (data.subtitle) {
          formData.append('subtitle', data.subtitle);
        }
        if (data.buttonText) {
          formData.append('buttonText', data.buttonText);
        }
        if (data.buttonLink) {
          formData.append('buttonLink', data.buttonLink);
        }
        
        await homeSectionAPI.update(data.id, formData);
        break;
        
      case 'create':
        const createFormData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            createFormData.append(key, data[key].toString());
          }
        });
        await homeSectionAPI.create(createFormData);
        break;
        
      case 'delete':
        await homeSectionAPI.delete(data.id);
        break;
    }
  };

  // Función para publicar cambios de slider
  const publishSliderChange = async (change: PendingChange): Promise<void> => {
    const { action, data } = change;

    switch (action) {
      case 'update':
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subtitle', data.subtitle || '');
        formData.append('imageUrl', data.imageUrl);
        formData.append('active', data.active.toString());
        formData.append('order', data.order.toString());
        
        await sliderAPI.update(data.id, formData);
        break;
        
      case 'create':
        const createFormData = new FormData();
        createFormData.append('title', data.title);
        createFormData.append('subtitle', data.subtitle || '');
        createFormData.append('imageUrl', data.imageUrl);
        createFormData.append('active', data.active.toString());
        createFormData.append('order', data.order.toString());
        
        await sliderAPI.create(createFormData);
        break;
        
      case 'delete':
        await sliderAPI.delete(data.id);
        break;
    }
  };

  // Función para descartar cambios
  const handleDiscardChanges = () => {
    if (pendingChanges.length === 0) {
      toast.info("No hay cambios para descartar");
      return;
    }

    const changeCount = pendingChanges.length;
    clearPendingChanges();
    toast.success(`🗑️ ${changeCount} cambios descartados`);
    
    // Refrescar la página para restaurar el estado original
    window.location.reload();
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
          <button 
            onClick={handleDiscardChanges}
            disabled={!hasUnsavedChanges || isPublishing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges && !isPublishing
                ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title={hasUnsavedChanges ? `Descartar ${pendingChanges.length} cambios` : "No hay cambios para descartar"}
          >
            <X size={16} />
            <span className="text-sm font-medium">Discard</span>
            {hasUnsavedChanges && (
              <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                {pendingChanges.length}
              </span>
            )}
          </button>

          {/* Botón Publish */}
          <button 
            onClick={handlePublishChanges}
            disabled={!hasUnsavedChanges || isPublishing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges && !isPublishing
                ? "bg-[#0d9488] hover:bg-[#0f766e] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={hasUnsavedChanges ? `Publicar ${pendingChanges.length} cambios` : "No hay cambios para publicar"}
          >
            {isPublishing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            <span className="text-sm font-medium">
              {isPublishing ? "Publishing..." : "Publish Changes"}
            </span>
            {hasUnsavedChanges && !isPublishing && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                {pendingChanges.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
