import { Heart } from "lucide-react";
import type { Product, ProductVariant } from "@/types";

interface Props {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantSelect: (v: ProductVariant) => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-base"
          style={{
            fontVariationSettings: `'FILL' ${
              i <= Math.floor(rating) ? 1 : i - 0.5 <= rating ? 0.5 : 0
            }`,
            color: "#0d40a5",
          }}
        >
          star
        </span>
      ))}
    </span>
  );
}

const TRUST_BADGES = [
  { icon: "verified",   label: "Informed Sport\nCertificado" },
  { icon: "biotech",    label: "Lab Tested\nPureza" },
  { icon: "eco",        label: "100% Vegano\nFórmula" },
  { icon: "bolt",       label: "Absorción\nRápida" },
];

export function ProductInfo({ product, selectedVariant, onVariantSelect }: Props) {
  const price = selectedVariant?.price ?? product.variants?.[0]?.price ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Categoría */}
      {product.category?.name && (
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0d40a5]">
          {product.category.name}
        </span>
      )}

      {/* Badge */}
      {product.badge && (
        <span
          className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded w-fit"
          style={{ backgroundColor: product.badgeColor ?? "#0d40a5" }}
        >
          {product.badge}
        </span>
      )}

      {/* Nombre */}
      <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 leading-none">
        {product.name}
      </h1>

      {/* Rating */}
      {(product.rating !== undefined || product.reviewCount !== undefined) && (
        <div className="flex items-center gap-3">
          <Stars rating={product.rating ?? 0} />
          <span className="text-sm font-medium text-gray-500">
            {(product.rating ?? 0).toFixed(1)}{" "}
            {product.reviewCount
              ? `(${product.reviewCount.toLocaleString()} reseñas)`
              : ""}
          </span>
        </div>
      )}

      {/* Descripción */}
      {product.description && (
        <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
      )}

      {/* Selector de variantes */}
      {product.variants && product.variants.length > 1 && (
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">
            Selecciona variante
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onVariantSelect(v)}
                  className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    active
                      ? "border-[#0d40a5] text-[#0d40a5] bg-[#0d40a5]/5"
                      : "border-gray-200 text-gray-500 hover:border-[#0d40a5]/50"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Precio */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-gray-900 tracking-tight">
          ${price.toFixed(2)}
        </span>
        {selectedVariant?.stock !== undefined && (
          <span
            className={`text-xs font-bold mb-1 uppercase tracking-wider ${
              selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {selectedVariant.stock > 0
              ? `En stock (${selectedVariant.stock})`
              : "Agotado"}
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <button
          className="flex-1 py-4 rounded-xl font-black text-white uppercase tracking-wider text-sm transition-all active:scale-95"
          style={{
            backgroundColor: "#0d40a5",
            boxShadow: "0 8px 24px rgba(13,64,165,0.3)",
          }}
        >
          Agregar al carrito
        </button>
        <button className="w-14 h-14 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#0d40a5] hover:text-[#0d40a5] transition-all active:scale-95">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex justify-between items-center py-5 border-y border-gray-100 mt-2">
        {TRUST_BADGES.map((b) => (
          <div key={b.icon} className="flex flex-col items-center gap-1.5 text-center">
            <span className="material-symbols-outlined text-[#0d40a5] text-xl">{b.icon}</span>
            <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 leading-tight whitespace-pre-line">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
