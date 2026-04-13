import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Edit, Trash2, Video, ImageIcon, Layout } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useHomeDataRefresh } from "@/contexts/HomeDataContext";
import { homeSectionAPI } from "@/services/api";
import type { HomeSection } from "@/types";
import { SectionEditModal } from "@/components/Admin/SectionEditModal";
import LivePreview from "@/components/Admin/LivePreview";

const SECTION_LABELS: Record<string, string> = {
  products_hero: "Hero",
  products_feature: "Producto Destacado",
  products_feature_alt: "Producto Destacado Alt",
  products_preworkout: "Pre-Workout",
  products_cta: "CTA",
};

const PRODUCTS_KEYS = Object.keys(SECTION_LABELS);

const MOCK_SECTIONS: HomeSection[] = [
  {
    id: "mock-products-hero",
    sectionKey: "products_hero",
    title: "Push Beyond Evolution",
    subtitle: "Engineered for Performance",
    content:
      "Precision-engineered supplements designed for those who refuse to settle.",
    accentColor: "#00e5ff",
    mediaType: "image",
    videoMuted: true,
    buttonText: "Ver Líneas de Productos",
    buttonLink: "/products",
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProductsEditor() {
  const {
    isPreviewMode,
    setIsPreviewMode,
    previewDevice,
    setPreviewDevice,
    addPendingChange,
    pendingChanges,
    hasUnsavedChanges,
  } = useAdmin();

  let triggerRefresh: (() => void) | null = null;
  let applyPendingChanges: ((changes: any[]) => void) | null = null;
  try {
    const ctx = useHomeDataRefresh();
    triggerRefresh = ctx.triggerRefresh;
    applyPendingChanges = ctx.applyPendingChanges;
  } catch {
    // contexto no disponible
  }

  const [sections, setSections] = useState<HomeSection[]>([]);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [availableImages, setAvailableImages] = useState<
    { src: string; name: string; type: "local" | "upload" }[]
  >([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadAvailableImages = async () => {
    const images: { src: string; name: string; type: "local" | "upload" }[] =
      [];
    ["heroSection-img.jpg", "MethImage.jpg", "img1-grid-product.jpg"].forEach(
      (img) => {
        images.push({ src: `/images/${img}`, name: img, type: "local" });
      },
    );
    try {
      const res = await fetch("http://localhost:3001/api/uploads/list");
      if (res.ok) {
        const files: string[] = await res.json();
        files
          .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
          .forEach((f) => {
            images.push({
              src: `http://localhost:3001/uploads/${f}`,
              name: f,
              type: "upload",
            });
          });
      }
    } catch {
      /* sin uploads */
    }
    setAvailableImages(images);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setDataLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setSections(MOCK_SECTIONS);
          setApiConnected(false);
          setDataLoading(false);
          return;
        }

        let allSections: HomeSection[] = [];
        let connected = false;
        try {
          const res = await homeSectionAPI.getAllAdmin();
          allSections = res.data;
          connected = true;
        } catch {
          try {
            const res = await homeSectionAPI.getAll();
            allSections = res.data;
            connected = true;
          } catch {
            /* sin conexión */
          }
        }

        if (connected) {
          const productSections = allSections.filter((s) =>
            PRODUCTS_KEYS.includes(s.sectionKey),
          );
          setSections(
            productSections.length > 0 ? productSections : MOCK_SECTIONS,
          );
          setApiConnected(productSections.length > 0);
        } else {
          setSections(MOCK_SECTIONS);
          setApiConnected(false);
        }
      } catch {
        setSections(MOCK_SECTIONS);
        setApiConnected(false);
      } finally {
        setDataLoading(false);
      }
    };

    load();
    loadAvailableImages();
  }, []);

  useEffect(() => {
    if (applyPendingChanges && pendingChanges.length > 0) {
      applyPendingChanges(pendingChanges);
    }
  }, [pendingChanges, applyPendingChanges]);

  const handlePreviewClose = useCallback(
    () => setIsPreviewMode(false),
    [setIsPreviewMode],
  );
  const handleDeviceChange = useCallback(
    (device: "mobile" | "tablet" | "desktop") => setPreviewDevice(device),
    [setPreviewDevice],
  );

  const handleEdit = (section: HomeSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSave = (updated: HomeSection) => {
    addPendingChange({
      id: updated.id,
      type: "section",
      action: "update",
      data: updated,
    });
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(null);
    setIsModalOpen(false);
    if (triggerRefresh) triggerRefresh();
    showToast("✅ Cambios agregados a cola de publicación");
  };

  const handleToggleVisibility = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    const updated = { ...section, active: !section.active };
    addPendingChange({
      id: updated.id,
      type: "section",
      action: "visibility",
      data: updated,
    });
    setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (triggerRefresh) triggerRefresh();
    showToast(`✅ Sección ${updated.active ? "visible" : "oculta"}`);
  };

  return (
    <>
      <LivePreview
        isOpen={isPreviewMode}
        device={previewDevice}
        onClose={handlePreviewClose}
        onDeviceChange={handleDeviceChange}
      />

      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editor — Página Productos
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el contenido de la página de Productos
            </p>
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
                  : "Modo sin conexión"}
              </div>
              {hasUnsavedChanges && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {pendingChanges.length} cambios pendientes
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsPreviewMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Vista Previa
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            {toast}
          </div>
        )}

        {/* Tab label */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex items-center gap-2 py-2 px-1 border-b-2 border-[#0d40a5] w-fit">
            <Layout className="w-4 h-4 text-[#0d40a5]" />
            <span className="text-sm font-medium text-[#0d40a5]">
              Secciones de Contenido
            </span>
          </div>
        </div>

        {/* Content */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d40a5] mx-auto mb-4" />
              <p className="text-gray-600">Cargando contenido...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                          {SECTION_LABELS[section.sectionKey] ??
                            section.sectionKey}
                        </span>
                        {section.mediaType && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">
                            {section.mediaType === "video" ? (
                              <Video className="w-3 h-3" />
                            ) : (
                              <ImageIcon className="w-3 h-3" />
                            )}
                            {section.mediaType}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{section.content}</p>
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
                        onClick={() => handleEdit(section)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <SectionEditModal
          section={editingSection}
          onSave={handleSave}
          onClose={() => {
            setEditingSection(null);
            setIsModalOpen(false);
          }}
          availableImages={availableImages}
        />
      )}
    </>
  );
}
