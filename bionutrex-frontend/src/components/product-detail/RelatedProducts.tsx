import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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

interface Props {
  categoryId: string;
  excludeId: string;
  categoryName?: string;
}

export function RelatedProducts({ categoryId, excludeId, categoryName }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productAPI
      .getAll()
      .then((res) => {
        const related = (res.data as Product[])
          .filter((p) => p.categoryId === categoryId && p.id !== excludeId && p.active)
          .slice(0, 4);
        setProducts(related);
      })
      .catch(() => {});
  }, [categoryId, excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0d40a5] block mb-1">
            {categoryName ?? "Categoría"}
          </span>
          <h2 className="text-2xl font-black tracking-tighter text-gray-900">
            Productos relacionados
          </h2>
        </div>
        <Link
          to="/catalogo"
          className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#0d40a5] transition-colors"
        >
          Ver catálogo →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => {
          const minPrice = p.variants?.length
            ? Math.min(...p.variants.map((v) => v.price))
            : 0;
          return (
            <Link
              key={p.id}
              to={`/catalogo/${p.id}`}
              className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#0d40a5]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={resolveUrl(p.imageUrl)}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300">
                      inventory_2
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                {p.category?.name && (
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#0d40a5]">
                    {p.category.name}
                  </span>
                )}
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-black text-gray-900">
                    {minPrice > 0 ? `$${minPrice.toFixed(2)}` : "—"}
                  </span>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all active:scale-95"
                    style={{ backgroundColor: "#0d40a5" }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
