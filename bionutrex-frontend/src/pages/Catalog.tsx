import { useState, useEffect, useMemo } from "react";
import { productAPI, categoryAPI } from "@/services/api";
import type { Product, Category } from "@/types";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, getMinPrice } from "@/components/catalog/ProductCard";
import {
  CatalogSidebar,
  type CatalogFilters,
} from "@/components/catalog/CatalogSidebar";

const PER_PAGE = 16;

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

const SORT_LABELS = {
  popular: "Popularidad",
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  rating: "Mejor valorados",
} as const;

type SortKey = keyof typeof SORT_LABELS;

export default function Catalog() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSortDropdown, setShowSort] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("popular");

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [priceFilter, setPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    Promise.all([
      productAPI.getAll().catch(() => ({ data: [] })),
      categoryAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([pRes, cRes]) => {
      setAllProducts(pRes.data ?? []);
      setCategories(cRes.data ?? []);
      const prices = (pRes.data ?? [])
        .map(getMinPrice)
        .filter((p: number) => p > 0);
      const top = prices.length ? Math.ceil(Math.max(...prices)) : 500;
      setMaxPrice(top);
      setPrice(top);
      setLoading(false);
    });
  }, []);

  const filters: CatalogFilters = {
    selectedCategories,
    priceFilter,
    maxPrice,
    minRating,
  };
  const hasFilters =
    selectedCategories.length > 0 || priceFilter < maxPrice || minRating > 0;

  const clearFilters = () => {
    setSelectedCategories([]);
    setPrice(maxPrice);
    setMinRating(0);
    setPage(1);
  };

  const handleCategoryToggle = (id: string) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => p.active);
    if (selectedCategories.length > 0)
      list = list.filter((p) => selectedCategories.includes(p.categoryId));
    if (priceFilter < maxPrice)
      list = list.filter((p) => getMinPrice(p) <= priceFilter);
    if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
    switch (sort) {
      case "price_asc":
        return [...list].sort((a, b) => getMinPrice(a) - getMinPrice(b));
      case "price_desc":
        return [...list].sort((a, b) => getMinPrice(b) - getMinPrice(a));
      case "rating":
        return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return [...list].sort((a, b) => a.featuredOrder - b.featuredOrder);
    }
  }, [allProducts, selectedCategories, priceFilter, maxPrice, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  return (
    <div className="w-full min-h-screen" style={{ background: "#f8f9fb" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Mobile top bar */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {filtered.length} productos
            </p>
            <h1 className="text-2xl font-black text-gray-900">Catálogo</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:border-[#0d40a5] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-[#0d40a5] text-white text-[9px] flex items-center justify-center">
                {selectedCategories.length +
                  (priceFilter < maxPrice ? 1 : 0) +
                  (minRating > 0 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">Filtros</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CatalogSidebar
                categories={categories}
                filters={filters}
                onCategoryToggle={handleCategoryToggle}
                onPriceChange={(v) => {
                  setPrice(v);
                  setPage(1);
                }}
                onRatingChange={(v) => {
                  setMinRating(v);
                  setPage(1);
                }}
                onClear={clearFilters}
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="mt-8 w-full py-3 bg-[#0d40a5] text-white font-bold rounded-xl"
              >
                Ver {filtered.length} resultado
                {filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-28">
              <CatalogSidebar
                categories={categories}
                filters={filters}
                onCategoryToggle={handleCategoryToggle}
                onPriceChange={(v) => {
                  setPrice(v);
                  setPage(1);
                }}
                onRatingChange={(v) => {
                  setMinRating(v);
                  setPage(1);
                }}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Grid */}
          <section className="flex-1 min-w-0 space-y-8">
            {/* Header row */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {filtered.length === 0
                    ? "Sin resultados"
                    : `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} de ${filtered.length} productos`}
                </p>
                <h1 className="hidden lg:block text-3xl font-black tracking-tight text-gray-900 mt-0.5">
                  Catálogo
                </h1>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSort((s) => !s)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700 border border-gray-300 px-4 py-2 rounded-xl hover:border-[#0d40a5] transition-all"
                >
                  <span className="hidden sm:inline">Ordenar: </span>
                  {SORT_LABELS[sort]}
                  <span className="material-symbols-outlined text-base">
                    expand_more
                  </span>
                </button>
                {showSortDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowSort(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                      {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(
                        ([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSort(key);
                              setShowSort(false);
                              setPage(1);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                              sort === key
                                ? "bg-[#0d40a5]/10 text-[#0d40a5]"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/5] bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-2 bg-gray-100 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-5 bg-gray-100 rounded w-1/2 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">
                  search_off
                </span>
                <p className="text-gray-500 font-medium mb-1">Sin resultados</p>
                <p className="text-gray-400 text-sm mb-4">
                  Prueba ajustando los filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 bg-[#0d40a5] text-white text-xs font-bold uppercase rounded-lg"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <nav className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0d40a5] hover:text-[#0d40a5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {buildPages(safePage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`e${i}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                      >
                        ···
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                          p === safePage
                            ? "bg-[#0d40a5] text-white shadow-sm"
                            : "border border-gray-300 text-gray-700 hover:border-[#0d40a5] hover:text-[#0d40a5]"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0d40a5] hover:text-[#0d40a5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
