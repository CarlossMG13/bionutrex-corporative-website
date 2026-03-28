import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Edit,
  Video,
  ImageIcon,
  Layout,
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Upload,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useHomeDataRefresh } from "@/contexts/HomeDataContext";
import { homeSectionAPI, technicalResourceAPI } from "@/services/api";
import type { HomeSection, TechnicalResource } from "@/types";
import { SectionEditModal } from "@/components/Admin/SectionEditModal";
import LivePreview from "@/components/Admin/LivePreview";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

const SECTION_LABELS: Record<string, string> = {
  resources_hero: "Hero",
  resources_filter: "Filtros",
  resources_catalogs: "Catálogos Destacados",
  resources_table: "Technical Data Sheets",
  resources_cta: "CTA — Soporte",
};

const RESOURCES_KEYS = Object.keys(SECTION_LABELS);

const ICON_OPTIONS = [
  "description", "picture_as_pdf", "science", "biotech", "local_pharmacy",
  "inventory_2", "article", "folder", "lab_panel", "analytics",
];
const COLOR_OPTIONS = ["blue", "green", "red", "yellow", "purple", "orange"];

const MOCK_SECTIONS: HomeSection[] = [
  {
    id: "mock-resources-hero",
    sectionKey: "resources_hero",
    title: "CENTRO DE RECURSOS CIENTÍFICOS",
    subtitle: "Portal Profesional",
    content: "Documentación técnica para distribuidores y profesionales de la salud.",
    accentColor: "#00e5ff",
    mediaType: "image",
    videoMuted: true,
    buttonText: "Solicitar Especificaciones",
    buttonLink: "/",
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type ActiveTab = "sections" | "resources";

interface ResourceForm {
  title: string;
  reference: string;
  category: string;
  productLine: string;
  description: string;
  icon: string;
  iconColor: string;
  active: boolean;
  file: File | null;
}

const EMPTY_FORM: ResourceForm = {
  title: "",
  reference: "",
  category: "",
  productLine: "",
  description: "",
  icon: "description",
  iconColor: "blue",
  active: true,
  file: null,
};

export default function ResourcesEditor() {
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
  } catch {}

  const [activeTab, setActiveTab] = useState<ActiveTab>("sections");
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Technical resources state
  const [resources, setResources] = useState<TechnicalResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<TechnicalResource | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(EMPTY_FORM);
  const [savingResource, setSavingResource] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load CMS sections
  useEffect(() => {
    const load = async () => {
      try {
        setDataLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
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
          } catch {}
        }

        if (connected) {
          const resSections = allSections.filter((s) =>
            RESOURCES_KEYS.includes(s.sectionKey),
          );
          setSections(resSections.length > 0 ? resSections : MOCK_SECTIONS);
          setApiConnected(resSections.length > 0);
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
  }, []);

  // Load technical resources
  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const res = await technicalResourceAPI.getAllAdmin();
      setResources(res.data);
    } catch {
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "resources") loadResources();
  }, [activeTab, loadResources]);

  useEffect(() => {
    if (applyPendingChanges && pendingChanges.length > 0) {
      applyPendingChanges(pendingChanges);
    }
  }, [pendingChanges, applyPendingChanges]);

  const handlePreviewClose = useCallback(() => setIsPreviewMode(false), [setIsPreviewMode]);
  const handleDeviceChange = useCallback(
    (device: "mobile" | "tablet" | "desktop") => setPreviewDevice(device),
    [setPreviewDevice],
  );

  const handleEdit = (section: HomeSection) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleSave = async (updated: HomeSection) => {
    try {
      await homeSectionAPI.updateWithJSON(updated.id, {
        ...updated,
        images: updated.images ?? [],
      });
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      addPendingChange({ id: updated.id, type: "section", action: "update", data: updated });
    } catch (err) {
      console.error("Error saving section:", err);
      showToast("❌ Error al guardar la sección");
      return;
    }
    setEditingSection(null);
    setIsModalOpen(false);
    if (triggerRefresh) triggerRefresh();
    showToast("✅ Sección guardada correctamente");
  };

  const handleToggleVisibility = async (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    const updated = { ...section, active: !section.active };
    try {
      await homeSectionAPI.updateWithJSON(id, { active: updated.active });
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
      addPendingChange({ id: updated.id, type: "section", action: "visibility", data: updated });
      if (triggerRefresh) triggerRefresh();
      showToast(`✅ Sección ${updated.active ? "visible" : "oculta"}`);
    } catch {
      showToast("❌ Error al actualizar visibilidad");
    }
  };

  // Resource form helpers
  const openNewResource = () => {
    setEditingResource(null);
    setResourceForm(EMPTY_FORM);
    setShowResourceForm(true);
  };

  const openEditResource = (r: TechnicalResource) => {
    setEditingResource(r);
    setResourceForm({
      title: r.title,
      reference: r.reference ?? "",
      category: r.category,
      productLine: r.productLine ?? "",
      description: r.description ?? "",
      icon: r.icon,
      iconColor: r.iconColor,
      active: r.active,
      file: null,
    });
    setShowResourceForm(true);
  };

  const handleResourceSubmit = async () => {
    if (!resourceForm.title || !resourceForm.category) {
      showToast("❌ Título y categoría son requeridos");
      return;
    }
    setSavingResource(true);
    try {
      const fd = new FormData();
      fd.append("title", resourceForm.title);
      fd.append("reference", resourceForm.reference);
      fd.append("category", resourceForm.category);
      fd.append("productLine", resourceForm.productLine);
      fd.append("description", resourceForm.description);
      fd.append("icon", resourceForm.icon);
      fd.append("iconColor", resourceForm.iconColor);
      fd.append("active", String(resourceForm.active));
      if (resourceForm.file) fd.append("file", resourceForm.file);

      if (editingResource) {
        await technicalResourceAPI.update(editingResource.id, fd);
        showToast("✅ Recurso actualizado");
      } else {
        await technicalResourceAPI.create(fd);
        showToast("✅ Recurso creado");
      }
      setShowResourceForm(false);
      loadResources();
    } catch {
      showToast("❌ Error al guardar el recurso");
    } finally {
      setSavingResource(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("¿Eliminar este recurso?")) return;
    try {
      await technicalResourceAPI.delete(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast("✅ Recurso eliminado");
    } catch {
      showToast("❌ Error al eliminar el recurso");
    }
  };

  const COLOR_DOT: Record<string, string> = {
    blue: "#3b82f6", green: "#22c55e", red: "#ef4444",
    yellow: "#eab308", purple: "#a855f7", orange: "#f97316",
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
            <h1 className="text-3xl font-bold text-gray-900">Editor — Página Recursos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona el contenido de la página de Recursos
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
                {apiConnected ? "Conectado a la base de datos" : "Modo sin conexión"}
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

        {toast && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            {toast}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 flex gap-0">
          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sections"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layout className="w-4 h-4" />
            Secciones de Contenido
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "resources"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Recursos Técnicos
          </button>
        </div>

        {/* Tab: Secciones */}
        {activeTab === "sections" && (
          <>
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
                              {SECTION_LABELS[section.sectionKey] ?? section.sectionKey}
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
                          <p className="text-gray-600 text-sm line-clamp-1">
                            {section.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleToggleVisibility(section.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(section)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Recursos Técnicos */}
        {activeTab === "resources" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Gestiona los documentos técnicos que aparecen en la tabla de la página Recursos.
              </p>
              <button
                onClick={openNewResource}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Nuevo Recurso
              </button>
            </div>

            {resourcesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d40a5]" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1">Sin recursos técnicos</p>
                <p className="text-gray-400 text-sm">
                  Crea el primer documento para que aparezca en la página Recursos
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Documento</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Referencia</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Archivo</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resources.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${COLOR_DOT[r.iconColor] ?? "#3b82f6"}18` }}
                            >
                              <span
                                className="material-symbols-outlined text-base"
                                style={{ color: COLOR_DOT[r.iconColor] ?? "#3b82f6" }}
                              >
                                {r.icon}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800 text-sm">{r.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm font-mono">{r.reference || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {r.fileUrl ? (
                            <a
                              href={`${BACKEND_URL}${r.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0d40a5] text-xs hover:underline"
                            >
                              Ver archivo
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">Sin archivo</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              r.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => openEditResource(r)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(r.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Edit Modal */}
      {isModalOpen && (
        <SectionEditModal
          section={editingSection}
          onSave={handleSave}
          onClose={() => {
            setEditingSection(null);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Resource Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingResource ? "Editar Recurso" : "Nuevo Recurso Técnico"}
              </h2>
              <button
                onClick={() => setShowResourceForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                  placeholder="Ficha Técnica Omega-3"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={resourceForm.reference}
                  onChange={(e) => setResourceForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                  placeholder="TDS-001"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                  placeholder="Suplementos, Vitaminas..."
                />
              </div>

              {/* Product Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Línea de Producto</label>
                <input
                  type="text"
                  value={resourceForm.productLine}
                  onChange={(e) => setResourceForm((f) => ({ ...f, productLine: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                  placeholder="Performance, Wellness..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                  placeholder="Descripción breve del documento..."
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ícono</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setResourceForm((f) => ({ ...f, icon }))}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                        resourceForm.icon === icon
                          ? "border-[#0d40a5] bg-[#0d40a5]/10"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      title={icon}
                    >
                      <span className="material-symbols-outlined text-base text-gray-700">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color del ícono</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setResourceForm((f) => ({ ...f, iconColor: color }))}
                      className={`w-8 h-8 rounded-full border-4 transition-all ${
                        resourceForm.iconColor === color ? "border-gray-800 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: COLOR_DOT[color] }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo (PDF, DOCX, etc.)
                </label>
                {editingResource?.fileUrl && !resourceForm.file && (
                  <p className="text-xs text-gray-500 mb-2">
                    Archivo actual:{" "}
                    <a
                      href={`${BACKEND_URL}${editingResource.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0d40a5] hover:underline"
                    >
                      ver archivo
                    </a>
                  </p>
                )}
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0d40a5] transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {resourceForm.file ? resourceForm.file.name : "Seleccionar archivo..."}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.zip"
                    onChange={(e) =>
                      setResourceForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
                    }
                  />
                </label>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="res-active"
                  checked={resourceForm.active}
                  onChange={(e) => setResourceForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0d40a5]"
                />
                <label htmlFor="res-active" className="text-sm font-medium text-gray-700">
                  Recurso activo (visible en la página)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowResourceForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleResourceSubmit}
                disabled={savingResource}
                className="px-6 py-2 text-sm text-white bg-[#0d40a5] rounded-lg hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50 font-medium"
              >
                {savingResource ? "Guardando..." : editingResource ? "Actualizar" : "Crear Recurso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
