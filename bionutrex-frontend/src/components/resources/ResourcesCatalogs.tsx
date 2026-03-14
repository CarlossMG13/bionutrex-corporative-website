import type { HomeSection } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface CatalogCard {
  title: string;
  version: string;
  description: string;
  fileSize: string;
  fileIcon: string;
  downloadUrl: string;
  category?: string;
  productLine?: string;
}

function parseCatalogs(raw: string): CatalogCard[] {
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  selectedProductLine: string;
}

interface Props {
  section: HomeSection;
  filters?: Filters;
}

export default function ResourcesCatalogs({ section, filters }: Props) {
  let cards = parseCatalogs(section.content);

  if (filters) {
    const { searchQuery, selectedCategory, selectedProductLine } = filters;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategory) {
      cards = cards.filter((c) => c.category === selectedCategory);
    }
    if (selectedProductLine) {
      cards = cards.filter((c) => c.productLine === selectedProductLine);
    }
  }

  return (
    <section className="mb-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 uppercase">
        <span className="w-8 h-0.5 bg-[#0d40a5] rounded-full shrink-0" />
        {section.title}
      </h3>

      {cards.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No se encontraron resultados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, i) => {
            const img = section.images?.[i];
            const imgUrl = img?.url ? resolveUrl(img.url) : "";
            return (
              <div
                key={i}
                className="group bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#0d40a5]/30"
              >
                {/* Preview image */}
                <div className="aspect-[4/5] bg-gray-100 rounded-xl mb-6 overflow-hidden relative">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-300 text-7xl">
                        {card.fileIcon || "description"}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                    <button className="bg-white text-gray-900 p-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold text-gray-900">{card.title}</h4>
                  {card.version && (
                    <span className="text-gray-400 text-xs font-mono uppercase shrink-0 ml-2">
                      {card.version}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-6">{card.description}</p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      {card.fileIcon || "picture_as_pdf"}
                    </span>
                    {card.fileSize}
                  </span>
                  <a
                    href={card.downloadUrl || "#"}
                    className="font-bold text-sm flex items-center gap-1.5 hover:underline transition-colors"
                    style={{ color: "#0d40a5" }}
                  >
                    DESCARGAR
                    <span className="material-symbols-outlined text-lg">download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
