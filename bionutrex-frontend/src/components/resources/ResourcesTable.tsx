import type { HomeSection, TechnicalResource } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

interface TDSRow {
  icon: string;
  iconColor: string;
  name: string;
  reference: string;
  category: string;
  date: string;
  downloadUrl: string;
  productLine?: string;
}

function parseCmsRows(raw: string): TDSRow[] {
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

function dbResourceToRow(r: TechnicalResource): TDSRow {
  return {
    icon: r.icon,
    iconColor: r.iconColor,
    name: r.title,
    reference: r.reference ?? "",
    category: r.category,
    date: new Date(r.updatedAt).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }),
    downloadUrl: r.fileUrl ? `${BACKEND_URL}${r.fileUrl}` : "#",
    productLine: r.productLine ?? undefined,
  };
}

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
};

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  selectedProductLine: string;
}

interface Props {
  section?: HomeSection;
  dbResources?: TechnicalResource[];
  filters?: Filters;
}

export default function ResourcesTable({ section, dbResources = [], filters }: Props) {
  // Merge CMS rows + DB resources
  const cmsRows = section?.content ? parseCmsRows(section.content) : [];
  const dbRows = dbResources.map(dbResourceToRow);
  let rows: TDSRow[] = [...dbRows, ...cmsRows];

  if (filters) {
    const { searchQuery, selectedCategory, selectedProductLine } = filters;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    if (selectedCategory) {
      rows = rows.filter((r) => r.category === selectedCategory);
    }
    if (selectedProductLine) {
      rows = rows.filter((r) => r.productLine === selectedProductLine);
    }
  }

  const title = section?.title ?? "Fichas Técnicas";

  if (rows.length === 0 && !section) return null;

  return (
    <section className="mb-20">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 uppercase">
        <span className="w-8 h-0.5 bg-[#0d40a5] rounded-full shrink-0" />
        {title}
      </h3>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No se encontraron resultados.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Documento
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Referencia
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Categoría
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Actualización
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, i) => {
                const iconColor = COLOR_MAP[row.iconColor] ?? "#0d40a5";
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${iconColor}18` }}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ color: iconColor }}
                          >
                            {row.icon}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-sm font-mono">
                      {row.reference || "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-sm">{row.date}</td>
                    <td className="px-6 py-5 text-right">
                      <a
                        href={row.downloadUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                        style={{
                          backgroundColor: "rgba(13,64,165,0.08)",
                          border: "1px solid rgba(13,64,165,0.25)",
                          color: "#0d40a5",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLAnchorElement;
                          el.style.backgroundColor = "#0d40a5";
                          el.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLAnchorElement;
                          el.style.backgroundColor = "rgba(13,64,165,0.08)";
                          el.style.color = "#0d40a5";
                        }}
                      >
                        Descargar
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
