import type { Category } from "@/types";

function Stars({ rating, active }: { rating: number; active: boolean }) {
  return (
    <span className={`flex gap-0.5 ${!active ? "opacity-40" : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[12px]"
          style={{
            fontVariationSettings: `'FILL' ${i <= rating ? 1 : 0}`,
            color: "#0d40a5",
          }}
        >
          star
        </span>
      ))}
    </span>
  );
}

export interface CatalogFilters {
  selectedCategories: string[];
  priceFilter: number;
  maxPrice: number;
  minRating: number;
}

interface Props {
  categories: Category[];
  filters: CatalogFilters;
  onCategoryToggle: (id: string) => void;
  onPriceChange: (val: number) => void;
  onRatingChange: (val: number) => void;
  onClear: () => void;
}

export function CatalogSidebar({
  categories,
  filters,
  onCategoryToggle,
  onPriceChange,
  onRatingChange,
  onClear,
}: Props) {
  const { selectedCategories, priceFilter, maxPrice, minRating } = filters;
  const hasFilters =
    selectedCategories.length > 0 || priceFilter < maxPrice || minRating > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d40a5]">
          Filtros del catálogo
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Refinar búsqueda
        </h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-[#0d40a5] underline underline-offset-2 transition-colors mt-1 block"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Categoría
          </h3>
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => onCategoryToggle(cat.id)}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      active
                        ? "bg-[#0d40a5] border-[#0d40a5]"
                        : "border-gray-300 group-hover:border-[#0d40a5]"
                    }`}
                  >
                    {active && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors ${
                      active
                        ? "text-[#0d40a5]"
                        : "text-gray-700 group-hover:text-[#0d40a5]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Precio */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Precio máx.
          </h3>
          <span className="text-sm font-black text-[#0d40a5]">
            ${priceFilter}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceFilter}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: "#0d40a5" }}
        />
        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
          <span>$0</span>
          <span>${maxPrice}</span>
        </div>
      </section>

      {/* Calificación */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Calificación
        </h3>
        <div className="flex flex-col gap-2">
          {([0, 4, 5] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(r)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                minRating === r
                  ? "bg-[#0d40a5]/10 text-[#0d40a5] border border-[#0d40a5]/20"
                  : "bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100"
              }`}
            >
              {r === 0 ? (
                <span className="uppercase tracking-wider">Todos</span>
              ) : (
                <>
                  <Stars rating={r} active={minRating === r} />
                  <span>{r === 5 ? "5.0 exacto" : "4.0 y superior"}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
