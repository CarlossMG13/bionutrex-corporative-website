import { X, Upload, RotateCcw } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export default function EditPanel() {
  const {
    editingSection,
    setEditingSection,
    isPanelOpen,
    setIsPanelOpen,
    editData,
    updateEditField,
  } = useAdmin();

  // Cerrar el Panel
  const handleClose = () => {
    setIsPanelOpen(false);
    setEditingSection(null);
  };

  // Aplicar cambios
  const handleApplyChanges = () => {
    console.log("Aplicando cambios: ", editData);
    // Logica para guardar cambios
  };

  // Si el panel no esta abierto, no renderizar nada
  if (!isPanelOpen || !editingSection) {
    return null;
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-screen fixed right-0 top-0 flex flex-col shadow-lg z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-gray-900">
            Edit Section: {editingSection.name}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-500">SECTION ID: {editingSection.id}</p>
      </div>

      {/* Content - Campos editables */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Campo: Tagline */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Hero Tagline
          </label>
          <input
            type="text"
            value={editData.tagline || ""}
            onChange={(e) => updateEditField("tagline", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none transition-all"
            placeholder="Ej: Scientific Excellence"
          />
        </div>

        {/* Campo: Main Heading */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Main Heading
          </label>
          <input
            type="text"
            value={editData.heading || ""}
            onChange={(e) => updateEditField("heading", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none transition-all"
            placeholder="Ej: Innovative Nutraceuticals"
          />
        </div>

        {/* Campo: Description Body */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Description Body
          </label>
          <textarea
            value={editData.description || ""}
            onChange={(e) => updateEditField("description", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none transition-all resize-none"
            placeholder="Descripción de la sección..."
          />
        </div>

        {/* Campo: Background Image */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Hero Background Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0d40a5] transition-colors cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-600">Drop image or browse</p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP (Max 2MB)
            </p>
            <p className="text-xs text-gray-400">Recommended: 1200x1200px</p>
          </div>
        </div>
      </div>

      {/* Footer - Botones de acción */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyChanges}
            className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Apply Changes
          </button>
          <button
            onClick={() => console.log("Reset")}
            className="p-3 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
