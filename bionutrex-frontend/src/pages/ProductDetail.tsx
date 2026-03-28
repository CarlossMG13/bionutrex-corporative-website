import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI } from "@/services/api";
import type { Product, ProductVariant } from "@/types";
import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProductInfo } from "@/components/product-detail/ProductInfo";
import { ProductIngredients } from "@/components/product-detail/ProductIngredients";
import { RelatedProducts } from "@/components/product-detail/RelatedProducts";
import { ProductReviews } from "@/components/product-detail/ProductReviews";
import { ProductStack } from "@/components/product-detail/ProductStack";
import { ProductCategoryData } from "@/components/product-detail/ProductCategoryData";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productAPI
      .getById(id)
      .then((res) => {
        const p = res.data as Product;
        setProduct(p);
        setSelectedVariant(p.variants?.[0] ?? null);
      })
      .catch(() => navigate("/catalogo"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">
          inventory_2
        </span>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">
        <Link to="/" className="hover:text-[#0d40a5] transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-[#0d40a5] transition-colors">
          Catálogo
        </Link>
        {product.category?.name && (
          <>
            <span>/</span>
            <span className="text-gray-500">{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Hero: Gallery + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        <ProductGallery
          imageUrl={product.imageUrl ?? ""}
          extraImages={product.images}
          productName={product.name}
        />
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantSelect={setSelectedVariant}
        />
      </div>

      {/* Ingredients / Long description / Features */}
      <ProductIngredients
        ingredients={product.ingredients}
        longDescription={product.longDescription}
        features={product.features}
      />

      {/* Category data: ingredient breakdown + category features */}
      <ProductCategoryData
        productName={product.name}
        categoryName={product.category?.name}
        description={product.description}
        longDescription={product.longDescription}
        ingredients={product.ingredients}
        features={product.features}
        badge={product.badge}
      />

      {/* Reviews */}
      <ProductReviews
        rating={product.rating}
        reviewCount={product.reviewCount}
      />

      {/* Stack: 2 featured products */}
      <ProductStack />

      {/* Related products */}
      {product.categoryId && (
        <RelatedProducts
          categoryId={product.categoryId}
          excludeId={product.id}
          categoryName={product.category?.name}
        />
      )}
    </div>
  );
}
