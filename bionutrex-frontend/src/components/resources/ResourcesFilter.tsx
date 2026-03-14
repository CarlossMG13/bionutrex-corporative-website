import type { HomeSection } from "@/types";

interface FilterOptions {
  categories: string[];
  productLines: string[];
  dateOptions: string[];
}

function parseOptions(raw: string): FilterOptions {
  try {
    const p = JSON.parse(raw);
    return {
      categories: Array.isArray(p.categories) ? p.categories : [],
      productLines: Array.isArray(p.productLines) ? p.productLines : [],
      dateOptions: Array.isArray(p.dateOptions) ? p.dateOptions : [],
    };
  } catch {
    return { categories: [], productLines: [], dateOptions: [] };
  }
}

interface Props {
  section: HomeSection;
  selectedCategory: string;
  selectedProductLine: string;
  selectedDate: string;
  onCategoryChange: (v: string) => void;
  onProductLineChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onClear: () => void;
}

const selectClass =
  "bg-white border border-gray-200 text-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5] outline-none min-w-[180px] cursor-pointer";

export default function ResourcesFilter({
  section,
  selectedCategory,
  selectedProductLine,
  selectedDate,
  onCategoryChange,
  onProductLineChange,
  onDateChange,
  onClear,
}: Props) {
  const opts = parseOptions(section.content);

  return (
    <section className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {opts.categories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={selectClass}
              >
                {opts.categories.map((c, i) => (
                  <option key={c} value={i === 0 ? "" : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {opts.productLines.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Línea de Producto
              </label>
              <select
                value={selectedProductLine}
                onChange={(e) => onProductLineChange(e.target.value)}
                className={selectClass}
              >
                {opts.productLines.map((l, i) => (
                  <option key={l} value={i === 0 ? "" : l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          {opts.dateOptions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Fecha
              </label>
              <select
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className={selectClass + " min-w-[140px]"}
              >
                {opts.dateOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={onClear}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#0d40a5] transition-colors"
        >
          <span className="material-symbols-outlined text-base">filter_list_off</span>
          Limpiar Filtros
        </button>
      </div>
    </section>
  );
}
