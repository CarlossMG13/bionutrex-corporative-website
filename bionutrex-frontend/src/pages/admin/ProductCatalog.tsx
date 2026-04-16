import { useState, useEffect } from "react";
import { productAPI, categoryAPI } from "@/services/api";
import type { Product, Category } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import ProductFormModal from "./components/ProductFormModal";

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllAdmin();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Usar categorías de ejemplo si la API falla
      setCategories([
        { id: "1", name: "Suplementos", slug: "suplementos" },
        { id: "2", name: "Vitaminas", slug: "vitaminas" },
        { id: "3", name: "Digestión", slug: "digestion" },
        { id: "4", name: "Antioxidantes", slug: "antioxidantes" },
      ]);
    }
  };

  const handleCreateProduct = async (formData: FormData) => {
    setIsLoading(true);
    try {
      console.log("Creating product with FormData:");
      // Log para debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await productAPI.create(formData);
      setProducts((prev) => [...prev, response.data]);
      setShowFormModal(false);
      alert("Producto creado exitosamente");
    } catch (error: any) {
      console.error("Error creating product:", error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || "Error desconocido";
      alert(`Error al crear el producto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      console.log("Updating product with FormData:");
      // Log para debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await productAPI.update(editingProduct.id, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? response.data : p))
      );
      setShowFormModal(false);
      setEditingProduct(null);
      alert("Producto actualizado exitosamente");
    } catch (error: any) {
      console.error("Error updating product:", error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || "Error desconocido";
      alert(`Error al actualizar el producto: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }
    try {
      await productAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar el producto");
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextFeatured = !product.featured;
    // If adding: assign next order; if removing: reset to 0
    const featuredCount = products.filter((p) => p.featured && p.id !== product.id).length;
    const fd = new FormData();
    fd.append("featured", String(nextFeatured));
    fd.append("featuredOrder", nextFeatured ? String(featuredCount) : "0");
    try {
      const res = await productAPI.update(product.id, fd);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data : p)));
    } catch (error) {
      console.error("Error toggling featured:", error);
      alert("Error al actualizar el producto");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesCategory =
      !selectedCategoryId || product.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const getTotalStock = () => {
    return products.reduce((acc, p) => {
      const stock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
      return acc + stock;
    }, 0);
  };

  const getInventoryValue = () => {
    return products.reduce((acc, p) => {
      const value = p.variants?.reduce((sum, v) => sum + v.price * v.stock, 0) || 0;
      return acc + value;
    }, 0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el inventario y información de productos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Destacados</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p) => p.featured).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalStock()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">
                ${getInventoryValue().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/300x200?text=Sin+imagen";
                }}
              />
              {product.featured && (
                <div className="absolute top-2 left-2">
                  <span className="bg-yellow-500 text-white px-2 py-1 text-xs rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Destacado
                  </span>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-2 right-2">
                  <span
                    className="text-white px-2 py-1 text-xs rounded-full"
                    style={{ backgroundColor: product.badgeColor }}
                  >
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description || "Sin descripción"}
              </p>

              <div className="flex justify-between items-center mb-3">
                <div>
                  {product.variants && product.variants.length > 0 && (
                    <span className="text-lg font-bold text-[#0d40a5]">
                      ${product.variants[0].price}
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.round(product.rating || 5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    Stock:{" "}
                    {product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}
                  </span>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-xs text-gray-500">
                  {product.category?.name || "Sin categoría"}
                </span>
                <div className="flex gap-1">
                  <button
                    title={product.featured ? "Quitar de Bestsellers" : "Agregar a Bestsellers"}
                    onClick={() => handleToggleFeatured(product)}
                    className={`p-1.5 transition-colors ${product.featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}`}
                  >
                    <Star className={`w-4 h-4 ${product.featured ? "fill-yellow-400" : ""}`} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowFormModal(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros o crea un nuevo producto
          </p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowFormModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Producto
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <ProductFormModal
          onClose={() => {
            setShowFormModal(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          product={editingProduct || undefined}
          categories={categories}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
