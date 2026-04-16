import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

export function getMinPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((v) => v.price));
}

export function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);
  const { addToCart } = useCart();
  const minPrice = getMinPrice(product);
  const imgUrl = resolveUrl(product.imageUrl);
  const firstVariant = product.variants?.[0];

  return (
    <Link
      to={`/catalogo/${product.id}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#0d40a5]/30"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-gray-300">
              inventory_2
            </span>
          </div>
        )}

        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded"
            style={{ backgroundColor: product.badgeColor ?? "#0d40a5" }}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            setWished((w) => !w);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className="w-4 h-4 transition-colors"
            style={{
              color: wished ? "#ef4444" : "#9ca3af",
              fill: wished ? "#ef4444" : "none",
            }}
          />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-1">
        {product.category?.name && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#0d40a5]">
            {product.category.name}
          </span>
        )}
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-black text-gray-900 tracking-tight">
            {minPrice > 0 ? `$${minPrice.toFixed(2)}` : "—"}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (firstVariant) addToCart(product, firstVariant);
            }}
            disabled={!firstVariant}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#0d40a5",
              boxShadow: "0 4px 12px rgba(13,64,165,0.3)",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
