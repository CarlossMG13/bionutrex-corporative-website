import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Layout,
  Package,
  GripVertical,
  Star,
  Check,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useHomeDataRefresh } from "@/contexts/HomeDataContext";
import { homeSectionAPI, sliderAPI, productAPI } from "@/services/api";
import type { HomeSection, Slider, Product } from "@/types";
import { SectionEditModal } from "@/components/Admin/SectionEditModal";
import LivePreview from "@/components/Admin/LivePreview";
import SliderEditModal from "@/components/Admin/SliderEditModal";

export default function HomeEditor() {
  const {
    isPreviewMode,
    setIsPreviewMode,
    previewDevice,
    setPreviewDevice,
    addPendingChange,
    pendingChanges,
    hasUnsavedChanges,
  } = useAdmin();

  // Usar el contexto de manera segura
  let triggerRefresh: (() => void) | null = null;
  let applyPendingChanges: ((changes: any[]) => void) | null = null;
  try {
    const context = useHomeDataRefresh();
    triggerRefresh = context.triggerRefresh;
    applyPendingChanges = context.applyPendingChanges;
  } catch (err) {
    console.warn("useHomeDataRefresh context not available in HomeEditor");
  }

  const [sections, setSections] = useState<HomeSection[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [activeTab, setActiveTab] = useState<
    "sections" | "slider" | "products"
  >("sections");
  const [editingSection, setEditingSection] = useState<HomeSection | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  const [sectionToDelete, setSectionToDelete] = useState<HomeSection | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [featuredDragId, setFeaturedDragId] = useState<string | null>(null);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [featuredSaveMsg, setFeaturedSaveMsg] = useState<string | null>(null);
  const [origFeaturedIds, setOrigFeaturedIds] = useState<Set<string>>(new Set());

  // Handlers para el Live Preview
  const handlePreviewClose = useCallback(() => {
    setIsPreviewMode(false);
  }, [setIsPreviewMode]);

  const handleDeviceChange = useCallback(
    (device: "mobile" | "tablet" | "desktop") => {
      setPreviewDevice(device);
    },
    [setPreviewDevice],
  );


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
            images: [
              {
                id: "hero-img-1",
                url: "/images/heroSection-img.jpg",
                alt: "Imagen de fondo hero",
                caption: "",
                order: 0,
              },
            ],
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
            images: [
              {
                id: "methodology-img-1",
                url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK9y955Ko1Nefm9TJwmPBX1KfmDtPe-CJnpqoRL600xNDWCsT3Sez7XbBaq2y1U0EMgEQT5qCjcJsDuhkpg-suJSmnyonuBaOK64xYvKr2SoJbqQh-Xa7H2UDdu0TukJoXh2L9W1wUZJzwjW1QutdpZLGvekN52aPk2MllgWy9T3xOD6kTIqXj4tMjbduDsgi8ZAexkyB6wKwkaZELHrD491RAbgsM5T8jOvxeUzad7YfyhZXIUFnbjamttApQAYxKPEvpAJanLEE",
                alt: "Científico farmacéutico trabajando en sala limpia",
                caption: "",
                order: 0,
              },
            ],
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
                order: 0,
              },
              {
                id: "blog-img-2",
                url: "/images/img2-grid-product.jpg",
                alt: "Productos de mejora cognitiva",
                caption: "",
                order: 1,
              },
              {
                id: "blog-img-3",
                url: "/images/img3-grid-product.jpg",
                alt: "Fórmulas de apoyo metabólico",
                caption: "",
                order: 2,
              },
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
            mediaType: "image",
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
            mediaType: "image",
            active: true,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // Verificar autenticación primero
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
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

          // Filtrar solo las secciones que pertenecen a Home
          const HOME_KEYS = [
            "hero",
            "home_video_hero",
            "quality",
            "methodology",
            "blog",
          ];
          adminSections = adminSections.filter((s) =>
            HOME_KEYS.includes(s.sectionKey),
          );

          console.log("✅ API de admin disponible - datos reales cargados");
        } catch (adminError) {
          console.warn("❌ Endpoints de admin fallan:", adminError);

          // Fallback a endpoints públicos
          try {
            const publicResponse = await homeSectionAPI.getAll();
            adminSections = publicResponse.data;

            const HOME_KEYS = [
              "hero",
              "home_video_hero",
              "quality",
              "methodology",
              "blog",
            ];
            adminSections = adminSections.filter((s) =>
              HOME_KEYS.includes(s.sectionKey),
            );

            isApiAvailable = true;
            console.log("✅ Fallback a endpoint público funciona");
          } catch (publicError) {
            console.warn("❌ Todos los endpoints fallan:", publicError);
            isApiAvailable = false;
          }
        }

        if (isApiAvailable) {
          // Siempre intentar cargar sliders reales, sin importar si hay secciones
          let realSliders: Slider[] = [];
          try {
            const slidersResponse = await sliderAPI.getAllAdmin();
            realSliders = slidersResponse.data || [];
          } catch (slidersError) {
            console.warn("Sliders no disponibles:", slidersError);
          }

          let realProducts: Product[] = [];
          try {
            const productsResponse = await productAPI.getAllAdmin();
            realProducts = productsResponse.data || [];
          } catch {
            console.warn("Productos no disponibles");
          }

          const applyProducts = (all: Product[]) => {
            setProducts(all);
            const feat = all
              .filter((p) => p.featured)
              .sort((a, b) => a.featuredOrder - b.featuredOrder);
            const avail = all.filter((p) => !p.featured && p.active);
            setFeaturedProducts(feat);
            setAvailableProducts(avail);
            setOrigFeaturedIds(new Set(feat.map((p) => p.id)));
          };

          if (adminSections.length > 0) {
            setApiConnected(true);
            setSections(adminSections);
            setSliders(realSliders);
            applyProducts(realProducts);
            setError("Datos cargados correctamente.");
            setTimeout(() => setError(null), 3000);
          } else {
            // Secciones vacías — mostrar sliders reales si los hay
            setSections(mockSections);
            setSliders(realSliders.length > 0 ? realSliders : mockSliders);
            applyProducts(realProducts);
            setApiConnected(false);
            setError(
              realSliders.length > 0
                ? "⚠️ Secciones de ejemplo (sliders reales cargados)"
                : "⚠️ Base de datos vacía - usando datos de ejemplo",
            );
            setTimeout(() => setError(null), 5000);
          }
        } else {
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
            images: [
              {
                id: "hero-img-1",
                url: "/images/heroSection-img.jpg",
                alt: "Imagen de fondo hero",
                caption: "",
                order: 0,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        const fallbackSliders: Slider[] = [
          {
            id: "1",
            title: "Imagen de ejemplo",
            imageUrl: "/api/placeholder/800/600",
            mediaType: "image",
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

  // Aplicar cambios pendientes al contexto global en tiempo real
  useEffect(() => {
    if (applyPendingChanges && pendingChanges.length > 0) {
      applyPendingChanges(pendingChanges);
    }
  }, [pendingChanges, applyPendingChanges]);

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
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error de Conexión
          </h3>
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
                    content:
                      "Procesos respaldados por investigación científica",
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
                    mediaType: "image",
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
                    mediaType: "image",
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
      // Persist to DB (includes images array)
      await homeSectionAPI.updateWithJSON(updatedSection.id, {
        ...updatedSection,
        images: updatedSection.images ?? [],
      });

      // Update local state immediately for visual feedback
      addPendingChange({
        id: updatedSection.id,
        type: "section",
        action: "update",
        data: updatedSection,
      });
      setSections(
        sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
      );
      setEditingSection(null);
      setIsModalOpen(false);

      if (triggerRefresh) triggerRefresh();

      setError("✅ Sección guardada correctamente");
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
      const section = sections.find((s) => s.id === id);
      if (!section) return;

      const updatedSection = { ...section, active: !section.active };

      // Agregar el cambio a la cola de cambios pendientes
      addPendingChange({
        id: updatedSection.id,
        type: "section",
        action: "visibility",
        data: updatedSection,
      });

      // Actualizar estado local SIEMPRE para feedback visual inmediato
      setSections(sections.map((s) => (s.id === id ? updatedSection : s)));

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
    const section = sections.find((s) => s.id === id);
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
        type: "section",
        action: "delete",
        data: sectionToDelete,
      });

      // Actualizar estado local para feedback visual
      setSections(sections.filter((s) => s.id !== sectionToDelete.id));

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

  // ---- Handlers de Slider ----
  const handleSliderEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setIsSliderModalOpen(true);
  };

  const handleSliderDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este slider?")) return;
    try {
      await sliderAPI.delete(id);
      setSliders((prev) => prev.filter((s) => s.id !== id));
      if (triggerRefresh) triggerRefresh();
      setError("✅ Slider eliminado");
      setTimeout(() => setError(null), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Object && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(`❌ ${msg ?? "Error al eliminar el slider"}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleSliderSave = (savedSlider: Slider) => {
    if (editingSlider) {
      setSliders((prev) =>
        prev.map((s) => (s.id === savedSlider.id ? savedSlider : s)),
      );
    } else {
      setSliders((prev) => [...prev, savedSlider]);
    }
    setIsSliderModalOpen(false);
    setEditingSlider(null);
    if (triggerRefresh) triggerRefresh();
    setError("✅ Slider guardado correctamente");
    setTimeout(() => setError(null), 3000);
  };


  // ── Featured products helpers ──
  const addToFeatured = (product: Product) => {
    if (featuredProducts.length >= 6) return;
    setFeaturedProducts((prev) => [...prev, product]);
    setAvailableProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const removeFromFeatured = (product: Product) => {
    setFeaturedProducts((prev) => prev.filter((p) => p.id !== product.id));
    if (product.active) setAvailableProducts((prev) => [...prev, product]);
  };

  const handleFeaturedDrop = (targetId: string) => {
    if (!featuredDragId || featuredDragId === targetId) return;
    setFeaturedProducts((prev) => {
      const from = prev.find((p) => p.id === featuredDragId)!;
      const rest = prev.filter((p) => p.id !== featuredDragId);
      const toIdx = rest.findIndex((p) => p.id === targetId);
      rest.splice(toIdx, 0, from);
      return rest;
    });
    setFeaturedDragId(null);
  };

  const saveFeatured = async () => {
    setSavingFeatured(true);
    setFeaturedSaveMsg(null);
    try {
      const updates = featuredProducts.map((p, index) => {
        const fd = new FormData();
        fd.append("featured", "true");
        fd.append("featuredOrder", String(index));
        return productAPI.update(p.id, fd);
      });
      const removedIds = [...origFeaturedIds].filter(
        (id) => !featuredProducts.find((p) => p.id === id),
      );
      const removals = removedIds.map((id) => {
        const fd = new FormData();
        fd.append("featured", "false");
        fd.append("featuredOrder", "0");
        return productAPI.update(id, fd);
      });
      await Promise.all([...updates, ...removals]);
      setOrigFeaturedIds(new Set(featuredProducts.map((p) => p.id)));
      setFeaturedSaveMsg("✅ Cambios guardados");
    } catch {
      setFeaturedSaveMsg("❌ Error al guardar");
    } finally {
      setSavingFeatured(false);
      setTimeout(() => setFeaturedSaveMsg(null), 3000);
    }
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validar que sea imagen o video
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("❌ Solo se pueden subir archivos de imagen o video");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError("📁 Subiendo archivo...");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:3001/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);


        setError(`✅ Imagen "${file.name}" subida correctamente`);
        setTimeout(() => setError(null), 3000);

        // Limpiar el input
        event.target.value = "";
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error al subir la imagen");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(
        `❌ Error al subir la imagen: ${err instanceof Error ? err.message : "Error desconocido"}`,
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <>
      {/* Live Preview Component */}
      <LivePreview
        isOpen={isPreviewMode}
        device={previewDevice}
        onClose={handlePreviewClose}
        onDeviceChange={handleDeviceChange}
      />

      {/* Main Editor Interface */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editor de Página Principal
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el contenido y elementos de la página de inicio
            </p>

            {/* Status indicator */}
            <div className="flex gap-3 mt-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  apiConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiConnected ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                {apiConnected
                  ? "Conectado a la base de datos"
                  : "Modo sin conexión - datos de ejemplo"}
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Vista Previa en Vivo
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
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-[#0d40a5] text-[#0d40a5]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Catálogo de Productos
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
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              section.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {section.active ? "Visible" : "Oculto"}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {{
                              hero: "Hero",
                              home_video_hero: "Video Hero",
                              quality: "Best Sellers",
                              methodology: "Categorías",
                              blog: "Ciencia",
                            }[section.sectionKey] ?? section.sectionKey}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {section.content}
                        </p>
                        {section.subtitle && (
                          <p className="text-gray-500 text-xs mt-1">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleVisibility(section.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={section.active ? "Ocultar" : "Mostrar"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSectionEdit(section)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSectionDelete(section.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                alert(
                  "Funcionalidad de crear nueva sección pendiente de implementar",
                );
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">
                Agregar Nueva Sección
              </span>
            </button>
          </div>
        )}

        {activeTab === "slider" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sliders.map((slider) => (
                <div
                  key={slider.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={
                        slider.imageUrl.startsWith("/uploads/")
                          ? `http://localhost:3001${slider.imageUrl}`
                          : slider.imageUrl
                      }
                      alt={slider.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleSliderEdit(slider)}
                        className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleSliderDelete(slider.id)}
                        className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                    {!slider.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-medium">
                          Oculto
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {slider.title}
                      </h4>
                      {slider.accentColor && (
                        <div
                          className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: slider.accentColor }}
                        />
                      )}
                    </div>
                    {slider.label && (
                      <p className="text-xs text-gray-500 mb-2">
                        {slider.label}
                      </p>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        slider.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {slider.active ? "Visible" : "Oculto"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingSlider(null);
                setIsSliderModalOpen(true);
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-[#0d40a5] hover:text-[#0d40a5] hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Nuevo Slider</span>
            </button>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0d40a5] flex items-center justify-center mt-0.5">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0d40a5]">
                  ¿Quieres agregar o editar productos?
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Ve a{" "}
                  <span className="font-semibold text-gray-800">
                    Tienda → Catálogo de Productos
                  </span>{" "}
                  en el menú lateral para crear, editar o eliminar productos.
                </p>
              </div>
            </div>

            {/* ── Bestsellers picker ── */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    Productos Bestsellers (Home)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Arrastra para reordenar · Máx. 6 productos
                  </p>
                </div>
                <button
                  onClick={saveFeatured}
                  disabled={savingFeatured}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0d40a5] text-white text-sm rounded-lg hover:bg-[#0d40a5]/90 disabled:opacity-50 transition-colors"
                >
                  {savingFeatured ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar selección
                    </>
                  )}
                </button>
              </div>

              {featuredSaveMsg && (
                <p className={`text-sm font-medium ${featuredSaveMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                  {featuredSaveMsg}
                </p>
              )}

              {/* Selected (featured) list */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg min-h-[80px] p-2 space-y-1">
                {featuredProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-sm text-gray-400">
                    Añade productos desde la lista de abajo
                  </div>
                ) : (
                  featuredProducts.map((product, index) => {
                    const BACKEND_URL =
                      (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
                      "http://localhost:3001";
                    const imgSrc = product.imageUrl?.startsWith("/uploads/")
                      ? `${BACKEND_URL}${product.imageUrl}`
                      : product.imageUrl;
                    const minPrice =
                      product.variants && product.variants.length > 0
                        ? Math.min(...product.variants.map((v) => v.price))
                        : null;
                    return (
                      <div
                        key={product.id}
                        draggable
                        onDragStart={() => setFeaturedDragId(product.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleFeaturedDrop(product.id)}
                        onDragEnd={() => setFeaturedDragId(null)}
                        className={`flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-lg cursor-grab active:cursor-grabbing select-none transition-opacity ${featuredDragId === product.id ? "opacity-40" : ""}`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        <span className="text-xs font-bold text-[#0d40a5] w-5 text-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div
                          className="w-9 h-11 rounded bg-gray-100 bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url('${imgSrc}')` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          {minPrice !== null && (
                            <p className="text-xs text-gray-400">${minPrice.toFixed(2)}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromFeatured(product)}
                          className="text-xs text-red-500 hover:text-red-700 flex-shrink-0 px-1"
                        >
                          Quitar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Available products */}
              {featuredProducts.length < 6 && availableProducts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Catálogo disponible — clic en + para añadir
                  </p>
                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {availableProducts.map((product) => {
                      const BACKEND_URL =
                        (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
                        "http://localhost:3001";
                      const imgSrc = product.imageUrl?.startsWith("/uploads/")
                        ? `${BACKEND_URL}${product.imageUrl}`
                        : product.imageUrl;
                      const minPrice =
                        product.variants && product.variants.length > 0
                          ? Math.min(...product.variants.map((v) => v.price))
                          : null;
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-8 h-10 rounded bg-gray-100 bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url('${imgSrc}')` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{product.name}</p>
                            {minPrice !== null && (
                              <p className="text-xs text-gray-400">${minPrice.toFixed(2)}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => addToFeatured(product)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#0d40a5] text-white hover:bg-[#0d40a5]/80 flex-shrink-0 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Full catalog (read-only) */}
            {products.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Catálogo completo ({products.length} productos)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => {
                    const BACKEND_URL =
                      (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
                      "http://localhost:3001";
                    const imgSrc = product.imageUrl?.startsWith("/uploads/")
                      ? `${BACKEND_URL}${product.imageUrl}`
                      : product.imageUrl;
                    const minPrice =
                      product.variants && product.variants.length > 0
                        ? Math.min(...product.variants.map((v) => v.price))
                        : null;
                    return (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-3 flex gap-3 items-start"
                      >
                        <div
                          className="w-12 h-14 rounded bg-gray-100 bg-center bg-cover flex-shrink-0"
                          style={{ backgroundImage: `url('${imgSrc}')` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                          {minPrice !== null && (
                            <p className="text-xs text-gray-500 mt-0.5">${minPrice.toFixed(2)}</p>
                          )}
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {product.featured && (
                              <span className="text-[10px] bg-[#0d40a5] text-white px-2 py-0.5 rounded-full font-bold">
                                Bestseller #{product.featuredOrder + 1}
                              </span>
                            )}
                            {product.badge && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {product.badge}
                              </span>
                            )}
                            {!product.active && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Inactivo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Toast */}
        {error && !error.includes("Error al cargar") && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-40 max-w-md ${
              error.includes("✅")
                ? "bg-green-600 text-white"
                : error.includes("localmente") ||
                    error.includes("ejemplo") ||
                    error.includes("⚠️")
                  ? "bg-yellow-600 text-white"
                  : "bg-red-600 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <p className="text-sm flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-white/80 hover:text-white font-bold text-lg leading-none p-1 hover:bg-white/20 rounded"
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
            onFileUpload={handleFileUpload}
          />
        )}

        {/* Slider Edit Modal */}
        {isSliderModalOpen && (
          <SliderEditModal
            slider={editingSlider}
            onSave={handleSliderSave}
            onClose={() => {
              setIsSliderModalOpen(false);
              setEditingSlider(null);
            }}
          />
        )}


        {/* Delete Confirmation Modal */}
        {showDeleteModal && sectionToDelete && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Eliminar Sección
                </h3>
                <p className="text-gray-600">
                  ¿Estás seguro de que quieres eliminar la sección "
                  {sectionToDelete.title}"?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Esta acción se agregará a los cambios pendientes y se aplicará
                  cuando publiques los cambios.
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
    </>
  );
}
