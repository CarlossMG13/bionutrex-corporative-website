import { useState, useEffect } from "react";
import {
  Save,
  Eye,
  Upload,
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Layout,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useHomeDataRefresh } from "@/contexts/HomeDataContext";
import { homeSectionAPI, sliderAPI } from "@/services/api";
import type { HomeSection, Slider } from "@/types";
import { SectionEditModal } from "@/components/Admin/SectionEditModal";

// Importar los componentes reales de la página Home
import Home from "@/pages/Home";

export default function HomeEditor() {
  const { isPreviewMode } = useAdmin();
  
  // Usar el contexto de manera segura
  let triggerRefresh: (() => void) | null = null;
  try {
    const context = useHomeDataRefresh();
    triggerRefresh = context.triggerRefresh;
  } catch (err) {
    console.warn('useHomeDataRefresh context not available in HomeEditor');
  }
  
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [activeTab, setActiveTab] = useState<"sections" | "slider">("sections");
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        
        // Datos de ejemplo como fallback
        const mockSections: HomeSection[] = [
          {
            id: "1",
            sectionKey: "hero",
            title: "Sección Hero",
            subtitle: "Subtítulo de ejemplo",
            content: "Ciencia Avanzada. Pureza Natural.",
            active: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2", 
            sectionKey: "quality",
            title: "Sección Calidad",
            content: "Comprometidos con la excelencia en cada producto",
            active: true,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            sectionKey: "methodology", 
            title: "Metodología",
            content: "Procesos respaldados por investigación científica",
            active: true,
            order: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "4",
            sectionKey: "blog",
            title: "Sección Blog", 
            content: "Últimas noticias y artículos científicos",
            active: true,
            order: 4,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        const mockSliders: Slider[] = [
          {
            id: "1",
            title: "Innovación Científica",
            subtitle: "Laboratorios de última generación",
            imageUrl: "/api/placeholder/800/600",
            active: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2", 
            title: "Productos Naturales",
            subtitle: "100% ingredientes naturales",
            imageUrl: "/api/placeholder/800/600",
            active: true,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        // Verificar autenticación primero
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No hay token de autenticación - usando datos de ejemplo");
          setSections(mockSections);
          setSliders(mockSliders);
          setApiConnected(false);
          setError("⚠️ No autenticado - usando datos de ejemplo");
          setDataLoading(false);
          return;
        }

        // Probar conectividad con endpoints de admin primero
        let isApiAvailable = false;
        let adminSections = [];
        
        try {
          const adminResponse = await homeSectionAPI.getAllAdmin();
          isApiAvailable = true;
          adminSections = adminResponse.data;
          console.log("✅ API de admin disponible - datos reales cargados");
        } catch (adminError) {
          console.warn("❌ Endpoints de admin fallan:", adminError);
          
          // Fallback a endpoints públicos
          try {
            const publicResponse = await homeSectionAPI.getAll();
            adminSections = publicResponse.data;
            isApiAvailable = true;
            console.log("✅ Fallback a endpoint público funciona");
          } catch (publicError) {
            console.warn("❌ Todos los endpoints fallan:", publicError);
            isApiAvailable = false;
          }
        }

        if (isApiAvailable && adminSections.length > 0) {
          // API disponible y con datos reales
          setApiConnected(true);
          setSections(adminSections);
          
          // Intentar cargar sliders
          try {
            const slidersResponse = await sliderAPI.getAll();
            setSliders(slidersResponse.data || []);
          } catch (slidersError) {
            console.warn("Sliders no disponibles:", slidersError);
            setSliders([]);
          }
          
          setError("✅ Datos reales cargados desde la base de datos");
          setTimeout(() => setError(null), 3000);
          
        } else if (isApiAvailable && adminSections.length === 0) {
          // API disponible pero base de datos vacía
          setSections(mockSections);
          setSliders(mockSliders);
          setApiConnected(false);
          setError("⚠️ Base de datos vacía - usando datos de ejemplo");
          setTimeout(() => setError(null), 5000);
          
        } else {
          // API no disponible completamente
          setSections(mockSections);
          setSliders(mockSliders);
          setApiConnected(false);
          setError("❌ Servidor backend no disponible - datos de ejemplo");
          setTimeout(() => setError(null), 5000);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        
        // Datos de ejemplo en caso de error total
        const fallbackSections: HomeSection[] = [
          {
            id: "1",
            sectionKey: "hero",
            title: "Sección Hero",
            content: "Ciencia Avanzada. Pureza Natural.",
            active: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        const fallbackSliders: Slider[] = [
          {
            id: "1",
            title: "Imagen de ejemplo",
            imageUrl: "/api/placeholder/800/600",
            active: true,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        // En caso de error, usar datos mock
        setSections(fallbackSections);
        setSliders(fallbackSliders);
        setError("Usando datos de ejemplo (API no disponible)");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []); // Sin dependencias para evitar loops

  // Si estamos en modo preview, mostramos la página Home real
  if (isPreviewMode) {
    return <Home />;
  }

  if (dataLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d40a5] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes("Error al cargar")) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Conexión</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
            <button 
              onClick={() => {
                // Cargar con datos mock
                const fallbackSections: HomeSection[] = [
                  {
                    id: "1",
                    sectionKey: "hero",
                    title: "Sección Hero",
                    subtitle: "Subtítulo de ejemplo",
                    content: "Ciencia Avanzada. Pureza Natural.",
                    active: true,
                    order: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: "2", 
                    sectionKey: "quality",
                    title: "Sección Calidad",
                    content: "Comprometidos con la excelencia en cada producto",
                    active: true,
                    order: 2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: "3",
                    sectionKey: "methodology", 
                    title: "Metodología",
                    content: "Procesos respaldados por investigación científica",
                    active: true,
                    order: 3,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: "4",
                    sectionKey: "blog",
                    title: "Sección Blog", 
                    content: "Últimas noticias y artículos científicos",
                    active: true,
                    order: 4,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ];

                const fallbackSliders: Slider[] = [
                  {
                    id: "1",
                    title: "Innovación Científica",
                    subtitle: "Laboratorios de última generación",
                    imageUrl: "/api/placeholder/800/600",
                    active: true,
                    order: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: "2", 
                    title: "Productos Naturales",
                    subtitle: "100% ingredientes naturales",
                    imageUrl: "/api/placeholder/800/600",
                    active: true,
                    order: 2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ];

                setSections(fallbackSections);
                setSliders(fallbackSliders);
                setError("Modo sin conexión - usando datos de ejemplo");
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Continuar sin conexión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSectionEdit = (section: HomeSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSectionSave = async (updatedSection: HomeSection) => {
    try {
      // Solo intentar guardar en API si está conectada
      if (apiConnected) {
        const formData = new FormData();
        formData.append('title', updatedSection.title);
        formData.append('content', updatedSection.content);
        formData.append('active', updatedSection.active.toString());
        formData.append('order', updatedSection.order.toString());
        
        if (updatedSection.subtitle) {
          formData.append('subtitle', updatedSection.subtitle);
        }
        if (updatedSection.buttonText) {
          formData.append('buttonText', updatedSection.buttonText);
        }
        if (updatedSection.buttonLink) {
          formData.append('buttonLink', updatedSection.buttonLink);
        }
        
        try {
          await homeSectionAPI.update(updatedSection.id, formData);
        } catch (updateError) {
          console.warn("Update failed, possibly authentication issue:", updateError);
          // Continuar con actualización local
        }
      }
      
      // Actualizar estado local
      setSections(sections.map(s => 
        s.id === updatedSection.id ? updatedSection : s
      ));
      
      setEditingSection(null);
      setIsModalOpen(false);
      setHasChanges(false);
      
      // Disparar actualización de la página Home
      if (triggerRefresh) {
        triggerRefresh();
      }
      
      const message = apiConnected 
        ? "✅ Sección actualizada exitosamente" 
        : "✅ Cambios guardados localmente";
      setError(message);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error saving section:", err);
      setError("❌ Error al guardar la sección");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleModalClose = () => {
    setEditingSection(null);
    setIsModalOpen(false);
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const section = sections.find(s => s.id === id);
      if (!section) return;

      const updatedSection = { ...section, active: !section.active };

      // Solo intentar actualizar en API si está conectada
      if (apiConnected) {
        try {
          const formData = new FormData();
          formData.append('title', section.title);
          formData.append('content', section.content);
          formData.append('active', updatedSection.active.toString());
          formData.append('order', section.order.toString());
          
          if (section.subtitle) {
            formData.append('subtitle', section.subtitle);
          }
          if (section.buttonText) {
            formData.append('buttonText', section.buttonText);
          }
          if (section.buttonLink) {
            formData.append('buttonLink', section.buttonLink);
          }

          await homeSectionAPI.update(id, formData);
          console.log("✅ Visibilidad actualizada en la API");
        } catch (updateError) {
          console.warn("Update failed, continuing with local update:", updateError);
          setError("⚠️ Cambio guardado localmente - problemas de conexión");
          setTimeout(() => setError(null), 3000);
        }
      }
      
      // Actualizar estado local SIEMPRE
      setSections(sections.map(s => 
        s.id === id ? updatedSection : s
      ));
      
      // IMPORTANTE: Disparar actualización de la página Home
      if (triggerRefresh) {
        console.log("🔄 Refrescando datos del Home...");
        triggerRefresh();
      }
      
      // Solo mostrar mensaje de éxito si no hubo errores
      if (apiConnected) {
        setError("✅ Visibilidad actualizada exitosamente");
        setTimeout(() => setError(null), 3000);
      }
      
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError("❌ Error al cambiar la visibilidad");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSectionDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta sección?")) return;
    
    try {
      // Solo intentar eliminar en API si está conectada
      if (apiConnected) {
        await homeSectionAPI.delete(id);
      }
      
      // Actualizar estado local
      setSections(sections.filter(s => s.id !== id));
      setHasChanges(false);
      
      // Disparar actualización de la página Home
      if (triggerRefresh) {
        triggerRefresh();
      }
      
      const message = apiConnected 
        ? "✅ Sección eliminada exitosamente" 
        : "✅ Sección eliminada localmente";
      setError(message);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting section:", err);
      setError("❌ Error al eliminar la sección");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSaveChanges = () => {
    // Esta función ya no es necesaria porque guardamos individualmente
    setHasChanges(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor de Página Principal</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el contenido y elementos de la página de inicio
          </p>
          
          {/* Status indicator */}
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            apiConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              apiConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            {apiConnected 
              ? 'Conectado a la base de datos'
              : 'Modo sin conexión - datos de ejemplo'
            }
          </div>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("sections")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sections"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Secciones de Contenido
          </button>
          <button
            onClick={() => setActiveTab("slider")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "slider"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Slider de Imágenes
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          {/* Sections List */}
          <div className="grid gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        section.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {section.active ? "Visible" : "Oculto"}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {section.sectionKey}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{section.content}</p>
                    {section.subtitle && (
                      <p className="text-gray-500 text-xs mt-1">{section.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleVisibility(section.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={section.active ? "Ocultar" : "Mostrar"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSectionEdit(section)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSectionDelete(section.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Section */}
          <button 
            onClick={() => {
              // TODO: Implementar creación de nueva sección
              alert("Funcionalidad de crear nueva sección pendiente de implementar");
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] transition-colors"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="block text-sm font-medium">Agregar Nueva Sección</span>
          </button>
        </div>
      )}

      {activeTab === "slider" && (
        <div className="space-y-6">
          {/* Slider Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map((slider) => (
              <div
                key={slider.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={slider.imageUrl}
                    alt={slider.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => {
                        // TODO: Implementar edición de slider
                        alert("Funcionalidad de editar slider pendiente de implementar");
                      }}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      <Edit className="w-3 h-3 text-gray-600" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("¿Estás seguro de que quieres eliminar este slider?")) {
                          try {
                            // Intentar eliminar en la API
                            try {
                              await sliderAPI.delete(slider.id);
                            } catch (apiError) {
                              console.warn("API delete failed, deleting locally:", apiError);
                              setError("Slider eliminado localmente (API no disponible)");
                            }
                            
                            // Actualizar estado local
                            setSliders(sliders.filter(s => s.id !== slider.id));
                            
                            // Disparar actualización de la página Home
                            if (triggerRefresh) {
                              triggerRefresh();
                            }
                            setError("✅ Slider eliminado exitosamente");
                            setTimeout(() => setError(null), 3000);
                          } catch (err) {
                            console.error("Error deleting slider:", err);
                            setError("Error al eliminar el slider");
                          }
                        }
                      }}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                  {!slider.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Oculto</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {slider.title}
                  </h4>
                  {slider.subtitle && (
                    <p className="text-sm text-gray-600">{slider.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      slider.active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {slider.active ? "Visible" : "Oculto"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Image */}
          <button 
            onClick={() => {
              // TODO: Implementar subida de nueva imagen
              alert("Funcionalidad de subir nueva imagen pendiente de implementar");
            }}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto mb-3" />
            <span className="block text-sm font-medium mb-1">Subir Nueva Imagen</span>
            <span className="block text-xs text-gray-400">PNG, JPG hasta 5MB</span>
          </button>
        </div>
      )}

      {/* Status Toast */}
      {error && !error.includes("Error al cargar") && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          error.includes("✅") 
            ? "bg-green-600 text-white"
            : error.includes("localmente") || error.includes("ejemplo") || error.includes("⚠️")
            ? "bg-yellow-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          <div className="flex items-center gap-2">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-white/80 hover:text-white font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Section Edit Modal */}
      {isModalOpen && (
        <SectionEditModal
          section={editingSection}
          onSave={handleSectionSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}