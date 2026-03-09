import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { productAPI } from "@/services/api";
import type { Product } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

const BADGE_COLORS = [
  { label: "Azul", value: "#0d40a5" },
  { label: "Rojo", value: "#ef4444" },
  { label: "Verde", value: "#22c55e" },
  { label: "Ámbar", value: "#f59e0b" },
];

interface Props {
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}

export default function ProductEditModal({ product, onSave, onClose }: Props) {
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [badgeColor, setBadgeColor] = useState(
    product?.badgeColor ?? "#0d40a5",
  );
  const [rating, setRating] = useState(product?.rating?.toString() ?? "5");
  const [reviewCount, setReviewCount] = useState(
    product?.reviewCount?.toString() ?? "0",
  );
  const [active, setActive] = useState(product?.active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    resolveUrl(product?.imageUrl ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      setError("El precio es obligatorio");
      return;
    }
    if (!isEditing && !imageFile) {
      setError("La imagen es obligatoria");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("price", price);
      fd.append("badge", badge.trim());
      fd.append("badgeColor", badgeColor);
      fd.append("rating", rating);
      fd.append("reviewCount", reviewCount);
      fd.append("active", active ? "true" : "false");
      if (imageFile) fd.append("image", imageFile);

      const response = isEditing
        ? await productAPI.update(product.id, fd)
        : await productAPI.create(fd);

      onSave(response.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Object && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(msg ?? "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
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
              Imagen del producto
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

          {/* Nombre y Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Iso-Elite Whey..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($)<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="49.99"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge (opcional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="New Formula, Bestseller..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                {BADGE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setBadgeColor(c.value)}
                    title={c.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${badgeColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rating y Reviews */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1–5)
              </label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nro. de reseñas
              </label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
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
                  : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
