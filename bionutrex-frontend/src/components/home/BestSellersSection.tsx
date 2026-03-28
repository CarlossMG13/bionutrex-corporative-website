import { useState, useEffect } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeSections } from "@/contexts/HomeDataContext";
import { productAPI } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

const BADGE_BG: Record<string, string> = {
  "#0d40a5": "bg-[#0d40a5]",
  "#ef4444": "bg-red-500",
  "#22c55e": "bg-green-500",
  "#f59e0b": "bg-amber-500",
};

const FALLBACK: Product[] = [
  {
    id: "p1",
    name: "Iso-Elite Hydrolyzed Whey Hybrid",
    imageUrl:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=500&fit=crop",
    badge: "New Formula",
    badgeColor: "#0d40a5",
    rating: 5,
    reviewCount: 124,
    featured: true,
    featuredOrder: 0,
    active: true,
    categoryId: "",
    createdAt: "",
    updatedAt: "",
    variants: [{ id: "v1", name: "Default", price: 64.99, stock: 0 }],
  },
  {
    id: "p2",
    name: "Nitro-X Pre-Workout Electric",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
    badge: undefined,
    badgeColor: "#0d40a5",
    rating: 4,
    reviewCount: 89,
    featured: true,
    featuredOrder: 1,
    active: true,
    categoryId: "",
    createdAt: "",
    updatedAt: "",
    variants: [{ id: "v2", name: "Default", price: 49.99, stock: 0 }],
  },
  {
    id: "p3",
    name: "Pure BCAA Molecular Recovery",
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=500&fit=crop",
    badge: "Bestseller",
    badgeColor: "#ef4444",
    rating: 5,
    reviewCount: 215,
    featured: true,
    featuredOrder: 2,
    active: true,
    categoryId: "",
    createdAt: "",
    updatedAt: "",
    variants: [{ id: "v3", name: "Default", price: 34.99, stock: 0 }],
  },
  {
    id: "p4",
    name: "Vital-Peak Multi-Complex",
    imageUrl:
      "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&h=500&fit=crop",
    badge: undefined,
    badgeColor: "#0d40a5",
    rating: 4,
    reviewCount: 42,
    featured: true,
    featuredOrder: 3,
    active: true,
    categoryId: "",
    createdAt: "",
    updatedAt: "",
    variants: [{ id: "v4", name: "Default", price: 29.99, stock: 0 }],
  },
];

function Stars({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 mb-3">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            fill: i < filled ? "#00e5ff" : "#e2e8f0",
            stroke: i < filled ? "#00e5ff" : "#e2e8f0",
          }}
        />
      ))}
      <span className="text-[10px] text-slate-400 ml-1.5 font-bold">
        ({count})
      </span>
    </div>
  );
}

export default function QualitySection() {
  const { getSectionByKey } = useHomeSections();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const section = getSectionByKey("quality");
  const sectionLabel = section?.subtitle || "Performance Staples";
  const sectionTitle = section?.title || "Best Sellers";
  const viewAllText = section?.buttonText || "View All Products";
  const viewAllLink = section?.buttonLink || "#";

  useEffect(() => {
    productAPI
      .getFeatured()
      .then((res) => {
        if (res.data.length > 0) setProducts(res.data);
      })
      .catch(() => {}) // keep fallback
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="bg-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 sm:mb-16">
          <div>
            <span className="text-[#00e5ff] text-[10px] font-black tracking-[0.4em] uppercase mb-2 block">
              {sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-black">
              {sectionTitle}
            </h2>
          </div>
          <a
            href={viewAllLink}
            className="hidden sm:block text-black text-[11px] font-extrabold tracking-widest uppercase border-b-2 border-[#00e5ff] hover:text-[#00e5ff] transition-colors pb-1"
          >
            {viewAllText}
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, index) => {
            const badgeBg =
              BADGE_BG[product.badgeColor ?? "#0d40a5"] ?? "bg-[#0d40a5]";
            const minPrice =
              product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v) => v.price))
                : null;
            return (
              <Link
                key={product.id ?? index}
                to={`/catalogo/${product.id}`}
                className="group relative bg-white border border-slate-100 p-6 transition-all duration-300 hover:border-[#00e5ff] rounded-2xl hover:shadow-xl flex flex-col"
              >
                <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-[#f6f6f8] rounded-xl">
                  <div
                    className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url('${resolveUrl(product.imageUrl)}')`,
                    }}
                  />
                  {product.badge && (
                    <div
                      className={`absolute top-4 left-4 ${badgeBg} text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-widest rounded-sm shadow-lg`}
                    >
                      {product.badge}
                    </div>
                  )}
                </div>

                <Stars
                  rating={product.rating ?? 5}
                  count={product.reviewCount ?? 0}
                />

                <h3 className="text-base font-black uppercase tracking-tight mb-4 text-black leading-tight h-12 overflow-hidden">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-2xl font-black text-black">
                    {minPrice != null ? `$${minPrice.toFixed(2)}` : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const variant = product.variants?.[0];
                      if (variant) addToCart(product, variant);
                    }}
                    disabled={!product.variants?.length}
                    className="w-12 h-12 flex items-center justify-center bg-[#f6f6f8] hover:bg-[#00e5ff] hover:text-[#0d40a5] transition-all rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all — mobile */}
        <div className="mt-8 text-center sm:hidden">
          <a
            href={viewAllLink}
            className="text-[#0d40a5] text-[11px] font-extrabold tracking-widest uppercase border-b-2 border-[#00e5ff] hover:text-[#00e5ff] transition-colors pb-1"
          >
            {viewAllText}
          </a>
        </div>
      </div>
    </section>
  );
}
