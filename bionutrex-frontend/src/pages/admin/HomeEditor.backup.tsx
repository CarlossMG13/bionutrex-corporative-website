import { useState, useEffect, useMemo, useCallback } from "react";
import {
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
import LivePreview from "@/components/Admin/LivePreview";

// Configuraciones de dispositivos para preview
const DEVICE_CONFIGS = {
  mobile: {
    width: 375,
    height: 812,
    containerClass: "mobile-preview-container",
    name: "iPhone",
    icon: Smartphone,
    scale: 1
  },
  tablet: {
    width: 768,
    height: 1024,
    containerClass: "tablet-preview-container", 
    name: "iPad",
    icon: Tablet,
    scale: 0.8
  },
  desktop: {
    width: 1440,
    height: 900,
    containerClass: "desktop-preview-container",
    name: "Desktop",
    icon: Monitor,
    scale: 0.7
  }
};

// Componente separado para el Live Preview
interface LivePreviewProps {
  device: 'mobile' | 'tablet' | 'desktop';
  onClose: () => void;
  onDeviceChange: (device: 'mobile' | 'tablet' | 'desktop') => void;
}

function LivePreview({ device, onClose, onDeviceChange }: LivePreviewProps) {
  const deviceConfig = DEVICE_CONFIGS[device];
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPreviewKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const scale = deviceConfig.scale;
  const transformedWidth = deviceConfig.width * scale;
  const transformedHeight = deviceConfig.height * scale;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header del preview */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Vista Previa en Tiempo Real</h2>
          <div className="flex items-center gap-2">
            {Object.entries(DEVICE_CONFIGS).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => onDeviceChange(key as 'mobile' | 'tablet' | 'desktop')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    device === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="text-xs text-gray-500 hidden md:inline">
                    {config.width}×{config.height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Abrir en nueva pestaña</span>
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Contenedor del preview */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="relative">
          {/* Marco del dispositivo */}
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300 relative"
            style={{
              width: `${transformedWidth}px`,
              height: `${transformedHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            {/* Barra de estado simulada para móvil */}
            {device === 'mobile' && (
              <div className="bg-black text-white px-4 py-1 text-xs flex justify-between items-center">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-2 bg-white rounded-sm opacity-60" />
                  <div className="w-6 h-2 bg-white rounded-sm" />
                </div>
              </div>
            )}
            
            {/* Iframe con el contenido */}
            <div className="w-full h-full overflow-auto">
              <iframe
                key={previewKey}
                src="/"
                className="w-full h-full border-0"
                style={{
                  width: `${deviceConfig.width}px`,
                  height: `${deviceConfig.height - (device === 'mobile' ? 20 : 0)}px`,
                  transform: 'scale(1)',
                  transformOrigin: 'top left'
                }}
                title={`Vista previa ${deviceConfig.name}`}
              />
            </div>
          </div>
          
          {/* Etiqueta del dispositivo */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
            {deviceConfig.name} - {deviceConfig.width}×{deviceConfig.height}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeEditor() {
  const { 
    isPreviewMode, 
    setIsPreviewMode,
    previewDevice,
    setPreviewDevice,
    addPendingChange, 
    pendingChanges, 
    hasUnsavedChanges 
  } = useAdmin();
  
  // Usar el contexto de manera segura
  let triggerRefresh: (() => void) | null = null;
  let applyPendingChanges: ((changes: any[]) => void) | null = null;
  try {
    const context = useHomeDataRefresh();
    triggerRefresh = context.triggerRefresh;
    applyPendingChanges = context.applyPendingChanges;
  } catch (err) {
    console.warn('useHomeDataRefresh context not available in HomeEditor');
  }
  
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [activeTab, setActiveTab] = useState<"sections" | "slider">("sections");
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [availableImages, setAvailableImages] = useState<{src: string, name: string, type: 'local' | 'upload'}[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<HomeSection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Función para cargar imágenes disponibles
  const loadAvailableImages = async () => {
    const images: {src: string, name: string, type: 'local' | 'upload'}[] = [];
    
    // Cargar imágenes locales desde public/images (accesibles directamente)
    const localImages = [
      'heroSection-img.jpg',
      'MethImage.jpg',
      'img1-grid-product.jpg',
      'img2-grid-product.jpg',
      'img3-grid-product.jpg'
    ];
    
    // Usar rutas de public que funcionen en Vite
    localImages.forEach(img => {
      images.push({
        src: `/images/${img}`,
        name: img,
        type: 'local'
      });
    });
    
    // Intentar cargar imágenes del backend uploads
    try {
      const response = await fetch('http://localhost:3001/api/uploads/list');
      if (response.ok) {
        const uploadedFiles = await response.json();
        uploadedFiles.forEach((file: string) => {
          if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            images.push({
              src: `http://localhost:3001/uploads/${file}`,
              name: file,
              type: 'upload'
            });
          }
        });
      }
    } catch (err) {
      console.warn('No se pudieron cargar imágenes del servidor:', err);
    }
    
    setAvailableImages(images);
  };

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
            images: [{
              id: "hero-img-1",
              url: "/images/heroSection-img.jpg",
              alt: "Imagen de fondo hero",
              caption: "",
              order: 0
            }],
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
            images: [{
              id: "methodology-img-1",
              url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK9y955Ko1Nefm9TJwmPBX1KfmDtPe-CJnpqoRL600xNDWCsT3Sez7XbBaq2y1U0EMgEQT5qCjcJsDuhkpg-suJSmnyonuBaOK64xYvKr2SoJbqQh-Xa7H2UDdu0TukJoXh2L9W1wUZJzwjW1QutdpZLGvekN52aPk2MllgWy9T3xOD6kTIqXj4tMjbduDsgi8ZAexkyB6wKwkaZELHrD491RAbgsM5T8jOvxeUzad7YfyhZXIUFnbjamttApQAYxKPEvpAJanLEE",
              alt: "Científico farmacéutico trabajando en sala limpia",
              caption: "",
              order: 0
            }],
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
            images: [
              {
                id: "blog-img-1",
                url: "/images/img1-grid-product.jpg",
                alt: "Suplementos de salud celular",
                caption: "",
                order: 0
              },
              {
                id: "blog-img-2", 
                url: "/images/img2-grid-product.jpg",
                alt: "Productos de mejora cognitiva",
                caption: "",
                order: 1
              },
              {
                id: "blog-img-3",
                url: "/images/img3-grid-product.jpg", 
                alt: "Fórmulas de apoyo metabólico",
                caption: "",
                order: 2
              }
            ],
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
        let adminSections: HomeSection[] = [];
        
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
          
          setError("Datos cargados correctamente.");
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
            images: [{
              id: "hero-img-1",
              url: "/images/heroSection-img.jpg",
              alt: "Imagen de fondo hero",
              caption: "",
              order: 0
            }],
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
    loadAvailableImages();
  }, []); // Sin dependencias para evitar loops

  // Aplicar cambios pendientes al contexto global en tiempo real
  useEffect(() => {
    if (applyPendingChanges && pendingChanges.length > 0) {
      applyPendingChanges(pendingChanges);
    }
  }, [pendingChanges, applyPendingChanges]);

  // Handlers para el Live Preview
  const handlePreviewClose = useCallback(() => {
    setIsPreviewMode(false);
  }, [setIsPreviewMode]);
  
  const handleDeviceChange = useCallback((device: 'mobile' | 'tablet' | 'desktop') => {
    setPreviewDevice(device);
  }, [setPreviewDevice]);
  
  // Mostrar Live Preview si está activado
  if (isPreviewMode) {
    return (
      <LivePreview
        device={previewDevice}
        onClose={handlePreviewClose}
        onDeviceChange={handleDeviceChange}
      />
    );
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
      // Agregar el cambio a la cola de cambios pendientes
      addPendingChange({
        id: updatedSection.id,
        type: 'section',
        action: 'update',
        data: updatedSection
      });
      
      // Actualizar estado local inmediatamente para feedback visual
      setSections(sections.map(s => 
        s.id === updatedSection.id ? updatedSection : s
      ));
      
      setEditingSection(null);
      setIsModalOpen(false);
      
      // Disparar actualización de la página Home
      if (triggerRefresh) {
        triggerRefresh();
      }
      
      setError("✅ Cambios agregados a cola de publicación");
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

      // Agregar el cambio a la cola de cambios pendientes
      addPendingChange({
        id: updatedSection.id,
        type: 'section',
        action: 'visibility',
        data: updatedSection
      });
      
      // Actualizar estado local SIEMPRE para feedback visual inmediato
      setSections(sections.map(s => 
        s.id === id ? updatedSection : s
      ));
      
      // IMPORTANTE: Disparar actualización de la página Home
      if (triggerRefresh) {
        console.log("🔄 Refrescando datos del Home...");
        triggerRefresh();
      }
      
      setError("✅ Cambio de visibilidad agregado a cola de publicación");
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError("❌ Error al cambiar la visibilidad");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSectionDelete = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    
    setSectionToDelete(section);
    setShowDeleteModal(true);
  };

  const confirmSectionDelete = async () => {
    if (!sectionToDelete) return;
    
    try {
      // Agregar el cambio a la cola de cambios pendientes
      addPendingChange({
        id: sectionToDelete.id,
        type: 'section',
        action: 'delete',
        data: sectionToDelete
      });
      
      // Actualizar estado local para feedback visual
      setSections(sections.filter(s => s.id !== sectionToDelete.id));
      
      // Disparar actualización de la página Home
      if (triggerRefresh) {
        triggerRefresh();
      }
      
      setError("✅ Sección marcada para eliminación");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting section:", err);
      setError("❌ Error al eliminar la sección");
      setTimeout(() => setError(null), 3000);
    } finally {
      setShowDeleteModal(false);
      setSectionToDelete(null);
    }
  };

  const cancelSectionDelete = () => {
    setShowDeleteModal(false);
    setSectionToDelete(null);
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('❌ Solo se pueden subir archivos de imagen');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('❌ El archivo es demasiado grande (máximo 5MB)');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setUploading(true);
      setError('📁 Subiendo imagen...');
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        
        // Recargar las imágenes disponibles
        await loadAvailableImages();
        
        setError(`✅ Imagen "${file.name}" subida correctamente`);
        setTimeout(() => setError(null), 3000);
        
        // Limpiar el input
        event.target.value = '';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al subir la imagen');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`❌ Error al subir la imagen: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
    }
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
          <div className="flex gap-3 mt-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
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
            
            {/* Indicador de cambios pendientes */}
            {hasUnsavedChanges && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {pendingChanges.length} cambios pendientes
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </button>
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
            {sections
              .sort((a, b) => {
                // Ordenar por order ascendente
                if (a.order !== b.order) {
                  return a.order - b.order;
                }
                // Si tienen el mismo order, ordenar alfabéticamente por title
                return a.title.localeCompare(b.title);
              })
              .map((section) => (
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
                            // Agregar el cambio a la cola de cambios pendientes
                            addPendingChange({
                              id: slider.id,
                              type: 'slider',
                              action: 'delete',
                              data: slider
                            });
                            
                            // Actualizar estado local para feedback visual
                            setSliders(sliders.filter(s => s.id !== slider.id));
                            
                            // Disparar actualización de la página Home
                            if (triggerRefresh) {
                              triggerRefresh();
                            }
                            
                            setError("✅ Slider marcado para eliminación");
                            setTimeout(() => setError(null), 3000);
                          } catch (err) {
                            console.error("Error deleting slider:", err);
                            setError("❌ Error al eliminar el slider");
                            setTimeout(() => setError(null), 3000);
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botón para subir nueva imagen */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <button 
                  className={`w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={uploading}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3" />
                  <span className="block text-sm font-medium mb-1">
                    {uploading ? 'Subiendo...' : 'Subir Nueva Imagen'}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {uploading ? 'Por favor espera...' : 'Arrastra o haz clic para seleccionar (máx. 5MB)'}
                  </span>
                </button>
              </div>

              {/* Botón para agregar desde galería */}
              <button 
                onClick={() => setShowImageGallery(!showImageGallery)}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] transition-colors"
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-3" />
                <span className="block text-sm font-medium mb-1">Agregar desde Galería</span>
                <span className="block text-xs text-gray-400">Selecciona desde imágenes disponibles</span>
              </button>
            </div>
            
            {/* Galería de imágenes */}
            {showImageGallery && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Imágenes Disponibles</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableImages.map((image, index) => (
                    <div
                      key={`${image.type}-${index}`}
                      className="relative group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-[#0d40a5] transition-colors"
                      onClick={async () => {
                        try {
                          const newSlider: Slider = {
                            id: `temp-${Date.now()}`,
                            title: `Imagen ${sliders.length + 1}`,
                            subtitle: `Desde ${image.type === 'local' ? 'assets' : 'uploads'}`,
                            imageUrl: image.src,
                            active: true,
                            order: sliders.length + 1,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          
                          // Agregar el cambio a la cola de cambios pendientes
                          addPendingChange({
                            id: newSlider.id,
                            type: 'slider',
                            action: 'create',
                            data: newSlider
                          });
                          
                          // Actualizar estado local para feedback visual
                          setSliders([...sliders, newSlider]);
                          
                          // Disparar actualización de la página Home
                          if (triggerRefresh) {
                            triggerRefresh();
                          }
                          
                          setShowImageGallery(false);
                          setError('✅ Imagen agregada a cola de publicación');
                          setTimeout(() => setError(null), 3000);
                        } catch (err) {
                          console.error('Error adding image to slider:', err);
                          setError('❌ Error al agregar imagen al slider');
                          setTimeout(() => setError(null), 3000);
                        }
                      }}
                    >
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={image.src}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                        <p className="text-xs font-medium truncate">{image.name}</p>
                        <p className="text-xs text-gray-300">
                          {image.type === 'local' ? 'Assets' : 'Uploads'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {availableImages.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay imágenes disponibles
                  </p>
                )}
              </div>
            )}
          </div>
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
          availableImages={availableImages}
          onFileUpload={handleFileUpload}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sectionToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Eliminar Sección
              </h3>
              <p className="text-gray-600">
                ¿Estás seguro de que quieres eliminar la sección "{sectionToDelete.title}"?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción se agregará a los cambios pendientes y se aplicará cuando publiques los cambios.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSectionDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSectionDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}