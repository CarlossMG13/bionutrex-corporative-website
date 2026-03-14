import React, { useState } from "react";
import { X } from "lucide-react";
import { useMediaLibrary } from "../../../hooks/useMediaLibrary";
import ImageGallerySelector from "./ImageGallerySelector";
import type { Product, ProductVariant, Category } from "@/types";

interface ProductFormModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  product?: Product;
  categories: Category[];
  isLoading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  onClose,
  onSubmit,
  product,
  categories,
  isLoading = false,
}) => {
  const { files } = useMediaLibrary();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    badge: product?.badge || "",
    badgeColor: product?.badgeColor || "#0d40a5",
    rating: product?.rating || 5.0,
    reviewCount: product?.reviewCount || 0,
    featured: product?.featured || false,
    featuredOrder: product?.featuredOrder || 0,
    active: product?.active ?? true,
    categoryId: product?.categoryId || "",
    imageUrl: product?.imageUrl || "",
    imageSource: "url", // 'upload', 'library', 'url'
    imageFile: null as File | null,
  });

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants || [{ name: "", price: 0, stock: 0, sku: "", pieces: 0, grams: 0 }]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, imageFile: files[0] }));
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { name: "", price: 0, stock: 0, sku: "", pieces: 0, grams: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId) {
      alert("Por favor completa los campos obligatorios (nombre y categoría)");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("badge", formData.badge);
    submitData.append("badgeColor", formData.badgeColor);
    submitData.append("rating", String(formData.rating));
    submitData.append("reviewCount", String(formData.reviewCount));
    submitData.append("featured", String(formData.featured));
    submitData.append("featuredOrder", String(formData.featuredOrder));
    submitData.append("active", String(formData.active));
    submitData.append("categoryId", formData.categoryId);

    if (formData.imageFile) {
      submitData.append("imageFile", formData.imageFile);
    } else if (formData.imageUrl) {
      submitData.append("imageUrl", formData.imageUrl);
    }

    // Add variants as JSON
    submitData.append(
      "variants",
      JSON.stringify(
        variants.filter((v) => v.name && v.price)
      )
    );

    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {product ? "Editar Producto" : "Crear Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Nombre del producto"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5]"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              placeholder="Descripción del producto"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5]"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageSource"
                    value="upload"
                    checked={formData.imageSource === "upload"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageSource: e.target.value,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Subir Archivo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageSource"
                    value="library"
                    checked={formData.imageSource === "library"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageSource: e.target.value,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Biblioteca de Medios</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="imageSource"
                    value="url"
                    checked={formData.imageSource === "url"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageSource: e.target.value,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">URL</span>
                </label>
              </div>

              {formData.imageSource === "upload" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}

              {formData.imageSource === "library" && (
                <div className="mt-4">
                  <ImageGallerySelector
                    files={files}
                    selectedUrl={formData.imageUrl}
                    onSelect={(url) =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: url,
                      }))
                    }
                  />
                </div>
              )}

              {formData.imageSource === "url" && (
                <input
                  type="text"
                  placeholder="URL de la imagen"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Badge y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge
              </label>
              <input
                type="text"
                name="badge"
                placeholder="Ej: Nuevo, Oferta"
                value={formData.badge}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color del Badge
              </label>
              <input
                type="color"
                name="badgeColor"
                value={formData.badgeColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-10"
              />
            </div>
          </div>

          {/* Rating y Review Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación (0-5)
              </label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Reseñas
              </label>
              <input
                type="number"
                name="reviewCount"
                min="0"
                value={formData.reviewCount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Destacado</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden Destacado
              </label>
              <input
                type="number"
                name="featuredOrder"
                min="0"
                value={formData.featuredOrder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Variantes del Producto
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                + Agregar Variante
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre variante"
                        value={variant.name || ""}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={variant.price || 0}
                        onChange={(e) =>
                          handleVariantChange(index, "price", parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={variant.stock || 0}
                        onChange={(e) =>
                          handleVariantChange(index, "stock", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        placeholder="SKU"
                        value={variant.sku || ""}
                        onChange={(e) =>
                          handleVariantChange(index, "sku", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Piezas
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={variant.pieces || 0}
                        onChange={(e) =>
                          handleVariantChange(index, "pieces", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Gramos
                      </label>
                      <input
                        type="number"
                        placeholder="0.0"
                        step="0.1"
                        value={variant.grams || 0}
                        onChange={(e) =>
                          handleVariantChange(index, "grams", parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Eliminar Variante
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 disabled:opacity-50"
          >
            {isLoading ? "Guardando..." : product ? "Actualizar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
