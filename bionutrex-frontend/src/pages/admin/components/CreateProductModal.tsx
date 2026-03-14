import React, { useState } from "react";
import { useMediaLibrary } from "../../../hooks/useMediaLibrary";
import type { Product } from "@/types";

interface CreateProductModalProps {
  onClose: () => void;
  onCreate: (newProduct: Product) => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ onClose, onCreate }) => {
  const { files } = useMediaLibrary();
  type FormData = {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    imageSource: string;
    imageFile: File | null;
    imageUrl: string;
  };

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageSource: "upload", // upload, library, url
    imageFile: null,
    imageUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Final fix for e.target.files null issue
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      console.warn("No files selected or input is null");
    }
  };

  const handleSubmit = () => {
    const { name, description, price, stock, category, imageSource, imageFile, imageUrl } = formData;

    if (!name || !description || !price || !stock || !category) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const newProduct: Product = {
      id: "", // Placeholder, backend should generate this
      status: "draft", // Default status
      featured: false, // Default featured status
      featuredOrder: 0, // Default order
      createdAt: new Date().toISOString(), // Default timestamp
      updatedAt: new Date().toISOString(), // Default timestamp
      active: true, // Default active status
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      imageUrl: imageSource === "upload" && imageFile ? URL.createObjectURL(imageFile) : imageUrl,
    };

    onCreate(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Producto</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre del producto"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Selecciona una categoría</option>
            <option value="Suplementos">Suplementos</option>
            <option value="Vitaminas">Vitaminas</option>
            <option value="Digestión">Digestión</option>
            <option value="Antioxidantes">Antioxidantes</option>
          </select>

          <div>
            <label className="block mb-2">Imagen del Producto</label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="imageSource"
                  value="upload"
                  checked={formData.imageSource === "upload"}
                  onChange={handleInputChange}
                />
                Subir Imagen
              </label>
              <label>
                <input
                  type="radio"
                  name="imageSource"
                  value="library"
                  checked={formData.imageSource === "library"}
                  onChange={handleInputChange}
                />
                Biblioteca de Medios
              </label>
              <label>
                <input
                  type="radio"
                  name="imageSource"
                  value="url"
                  checked={formData.imageSource === "url"}
                  onChange={handleInputChange}
                />
                URL
              </label>
            </div>

            {formData.imageSource === "upload" && (
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-2"
              />
            )}

            {formData.imageSource === "library" && (
              <select
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg mt-2"
              >
                <option value="">Selecciona una imagen</option>
                {files.map((file) => (
                  <option key={file.id} value={file.url}>
                    {file.name}
                  </option>
                ))}
              </select>
            )}

            {formData.imageSource === "url" && (
              <input
                type="text"
                name="imageUrl"
                placeholder="Pega la URL de la imagen"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg mt-2"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Crear Producto
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;