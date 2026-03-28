import { useState, useEffect } from "react";
import type { HomeSection, Product } from "@/types";
import { productAPI } from "@/services/api";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface BundleInfo {
  bundleTitle: string;
  bundleText: string;
  originalPrice: string;
  salePrice: string;
  icon: string;
}

function parseBundleInfo(raw: string): BundleInfo {
  try {
    const p = JSON.parse(raw);
    return {
      bundleTitle: p.bundleTitle ?? "The Ultimate Stack",
      bundleText: p.bundleText ?? "",
      originalPrice: p.originalPrice ?? "",
      salePrice: p.salePrice ?? "",
      icon: p.icon ?? "inventory_2",
    };
  } catch {
    return {
      bundleTitle: "The Ultimate Stack",
      bundleText: raw,
      originalPrice: "",
      salePrice: "",
      icon: "inventory_2",
    };
  }
}

export default function CategoriesStack({ section }: { section: HomeSection }) {
  const accent = section.accentColor ?? "#00e5ff";
  const [products, setProducts] = useState<Product[]>([]);
  const bundle = parseBundleInfo(section.content);

  useEffect(() => {
    productAPI
      .getAll()
      .then((res) => {
        const featured = (res.data as Product[])
          .filter((p) => p.featured && p.active)
          .sort((a, b) => a.featuredOrder - b.featuredOrder)
          .slice(0, 3);
        setProducts(featured);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="px-6 lg:px-20 py-20 bg-[#060d1a]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: "#0d40a5" }}
        >
          <span className="material-symbols-outlined">{bundle.icon}</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">
          {section.title}
        </h2>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product, i) => {
          const imgUrl = product.imageUrl ? resolveUrl(product.imageUrl) : "";
          return (
            <div
              key={product.id}
              className="group flex flex-col hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Image — sin fondo, producto grande */}
              <div className="relative flex items-end justify-center h-64 mb-4">
                {i === 0 && (
                  <span
                    className="absolute top-0 left-0 text-slate-900 text-[10px] font-bold px-2 py-1 rounded z-10"
                    style={{ backgroundColor: accent }}
                  >
                    BEST SELLER
                  </span>
                )}
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_24px_36px_rgba(0,229,255,0.15)] transition-all duration-300"
                  />
                ) : (
                  <span className="material-symbols-outlined text-slate-700 text-8xl">
                    inventory_2
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-lg font-bold text-white mb-1">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-white">
                    {product.variants?.[0]?.price != null ? `$${product.variants[0].price.toFixed(2)}` : ""}
                  </span>
                  <button
                    className="w-10 h-10 text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all"
                    style={{ backgroundColor: "#0d40a5" }}
                  >
                    <span className="material-symbols-outlined text-base">
                      add_shopping_cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bundle offer */}
      {(bundle.bundleTitle || bundle.salePrice) && (
        <div
          className="mt-12 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10"
          style={{ background: "rgba(13,64,165,0.1)" }}
        >
          <div className="flex gap-4 items-start">
            <span
              className="material-symbols-outlined text-4xl shrink-0"
              style={{ color: "#0d40a5" }}
            >
              {bundle.icon}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">
                {bundle.bundleTitle}
              </h3>
              {bundle.bundleText && (
                <p className="text-slate-400">{bundle.bundleText}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            {bundle.salePrice && (
              <div className="text-right">
                {bundle.originalPrice && (
                  <span className="block text-slate-500 line-through text-sm">
                    {bundle.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-black text-white">
                  {bundle.salePrice}
                </span>
              </div>
            )}
            {section.buttonText && (
              <button
                className="px-10 py-4 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
                style={{ backgroundColor: "#0d40a5" }}
              >
                {section.buttonText}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
