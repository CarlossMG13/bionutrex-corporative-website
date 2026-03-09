import { useState, useRef } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { sliderAPI } from "@/services/api";
import type { Slider, SliderStat } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface Props {
  slider: Slider | null; // null = crear nuevo
  onSave: (slider: Slider) => void;
  onClose: () => void;
}

export default function SliderEditModal({ slider, onSave, onClose }: Props) {
  const isEditing = !!slider;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(slider?.title ?? "");
  const [label, setLabel] = useState(slider?.label ?? "");
  const [description, setDescription] = useState(slider?.description ?? "");
  const [accentColor, setAccentColor] = useState(
    slider?.accentColor ?? "#00e5ff",
  );
  const [mediaType, setMediaType] = useState(slider?.mediaType ?? "image");
  const [videoUrl, setVideoUrl] = useState(slider?.videoUrl ?? "");
  const [videoMuted, setVideoMuted] = useState(slider?.videoMuted !== false);
  const [buttonText, setButtonText] = useState(slider?.buttonText ?? "");
  const [buttonLink, setButtonLink] = useState(slider?.buttonLink ?? "");
  const [button2Text, setButton2Text] = useState(slider?.button2Text ?? "");
  const [button2Link, setButton2Link] = useState(slider?.button2Link ?? "");
  const [order, setOrder] = useState(slider?.order ?? 0);
  const [active, setActive] = useState(slider?.active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    resolveUrl(slider?.imageUrl ?? ""),
  );
  const [stats, setStats] = useState<SliderStat[]>(() => {
    if (!slider?.stats) return [];
    try {
      return JSON.parse(slider.stats);
    } catch {
      return [];
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addStat = () => setStats([...stats, { value: "", label: "" }]);
  const removeStat = (i: number) =>
    setStats(stats.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: "value" | "label", val: string) =>
    setStats(stats.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!isEditing && !imageFile) {
      setError("La imagen es obligatoria para un nuevo slider");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("label", label.trim());
      formData.append("description", description.trim());
      formData.append("accentColor", accentColor);
      formData.append("mediaType", mediaType);
      formData.append("videoUrl", mediaType === "video" ? videoUrl.trim() : "");
      formData.append("videoMuted", videoMuted ? "true" : "false");
      formData.append("buttonText", buttonText.trim());
      formData.append("buttonLink", buttonLink.trim());
      formData.append("button2Text", button2Text.trim());
      formData.append("button2Link", button2Link.trim());
      formData.append("stats", JSON.stringify(stats));
      formData.append("order", String(order));
      formData.append("active", active ? "true" : "false");
      if (imageFile) formData.append("image", imageFile);

      const response = isEditing
        ? await sliderAPI.update(slider.id, formData)
        : await sliderAPI.create(formData);

      onSave(response.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Object && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(msg ?? "Error al guardar el slider");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Slider" : "Nuevo Slider"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de fondo
              {!isEditing && <span className="text-red-500 ml-1">*</span>}
            </label>
            {imagePreview && (
              <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gray-100">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {imagePreview ? "Cambiar imagen" : "Subir imagen"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Título y Label */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="POWER DEFINED."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (badge)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Human-Centric Performance"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Texto descriptivo del slide..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Color + Tipo de media + Activo */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color de acento
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-14 border border-gray-300 rounded-lg cursor-pointer p-0.5"
                />
                <span className="text-xs text-gray-500 font-mono">
                  {accentColor}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de media
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-gray-400"}`}
                />
                {active ? "Visible" : "Oculto"}
              </button>
            </div>
          </div>

          {/* Video (solo si mediaType = video) */}
          {mediaType === "video" && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del video
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoMuted}
                  onChange={(e) => setVideoMuted(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Video en mute por defecto
                </span>
              </label>
            </div>
          )}

          {/* Botones CTA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Botones CTA
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Botón 1: texto"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="Botón 1: /link"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={button2Text}
                  onChange={(e) => setButton2Text(e.target.value)}
                  placeholder="Botón 2: texto"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={button2Link}
                  onChange={(e) => setButton2Link(e.target.value)}
                  placeholder="Botón 2: /link"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Estadísticas
              </label>
              <button
                type="button"
                onClick={addStat}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(i, "value", e.target.value)}
                    placeholder="150K+"
                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    placeholder="Athletes Fueled"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {stats.length === 0 && (
                <p className="text-xs text-gray-400">
                  Sin estadísticas. Haz clic en "Agregar" para añadir.
                </p>
              )}
            </div>
          </div>

          {/* Orden */}
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#0d40a5] hover:bg-[#0d40a5]/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear slider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
