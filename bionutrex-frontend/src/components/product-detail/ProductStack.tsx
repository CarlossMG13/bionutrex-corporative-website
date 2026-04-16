import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "@/services/api";
import type { Product } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

export function ProductStack() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productAPI
      .getAll()
      .then((res) => {
        const active = (res.data as Product[])
          .filter((p) => p.active)
          .slice(0, 2);
        setProducts(active);
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      className="mb-20 rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#060d1a" }}
    >
      <div className="px-8 pt-10 pb-4">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#00e5ff]">
          También te puede interesar
        </span>
        <h2 className="text-2xl font-black tracking-tighter text-white mt-1">
          Del mismo stack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {products.map((p, i) => {
          const minPrice = p.variants?.length
            ? Math.min(...p.variants.map((v) => v.price))
            : 0;
          return (
            <Link
              key={p.id}
              to={`/catalogo/${p.id}`}
              className={`group flex gap-5 p-8 hover:bg-white/5 transition-colors ${
                i === 0 && products.length === 2
                  ? "border-b md:border-b-0 md:border-r border-white/10"
                  : ""
              }`}
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0">
                {p.imageUrl ? (
                  <img
                    src={resolveUrl(p.imageUrl)}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-white/30">
                      inventory_2
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center gap-1.5 min-w-0">
                {p.category?.name && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#00e5ff]">
                    {p.category.name}
                  </span>
                )}
                <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {minPrice > 0 && (
                    <span className="text-sm font-black text-white">
                      ${minPrice.toFixed(2)}
                    </span>
                  )}
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white transition-all group-hover:brightness-110"
                    style={{ backgroundColor: "#0d40a5" }}
                  >
                    Ver producto →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
