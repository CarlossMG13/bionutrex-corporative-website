import { BlobProvider } from "@react-pdf/renderer";
import { FichaTecnicaPDF } from "./FichaTecnicaPDF";

interface Ingredient {
  name: string;
  amount: string;
}
interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

function parse<T>(raw: string | undefined): T[] {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

const FALLBACK_INGREDIENTS: Ingredient[] = [
  { name: "Bio-Peptide Complex", amount: "15,000mg" },
  { name: "L-Glutamine (Micronized)", amount: "5,000mg" },
  { name: "Electrolyte Neural-Shield", amount: "2,400mg" },
  { name: "AstraGin® Absorption Enhancer", amount: "50mg" },
  { name: "BCAA 2:1:1 Ratio", amount: "8,000mg" },
];

const FALLBACK_FEATURES: Feature[] = [
  {
    icon: "trending_up",
    title: "Peak Intensity",
    description: "Supports ATP regeneration during high-output sessions.",
    color: "#0d40a5",
  },
  {
    icon: "self_improvement",
    title: "Rapid Recovery",
    description: "Decreases DOMS by reducing inflammation markers.",
    color: "#00b894",
  },
];

interface Props {
  productName?: string;
  categoryName?: string;
  description?: string;
  longDescription?: string;
  ingredients?: string;
  features?: string;
  badge?: string;
}

export function ProductCategoryData({
  productName,
  categoryName,
  description,
  longDescription,
  ingredients,
  features,
  badge,
}: Props) {
  const rows = parse<Ingredient>(ingredients);
  const cards = parse<Feature>(features).slice(0, 2);

  const displayRows = rows.length ? rows : FALLBACK_INGREDIENTS;
  const displayCards = cards.length ? cards : FALLBACK_FEATURES;
  const displayDesc =
    longDescription ||
    "Nuestra fórmula de extracción propietaria preserva las fracciones bioactivas que se pierden en los procesos de fabricación estándar. Diseñada para atletas de alto rendimiento que exigen precisión técnica en cada dosis.";
  const displayCategory = categoryName ?? "Producto";

  const pdfDoc = (
    <FichaTecnicaPDF
      productName={productName}
      categoryName={categoryName}
      description={description}
      longDescription={longDescription}
      ingredients={ingredients}
      features={features}
      badge={badge}
    />
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-20 items-start">
      {/* Izquierda — Tabla de composición */}
      <div className="p-7 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <h3 className="text-xl font-black tracking-tight text-gray-900 mb-6">
          Molecular Breakdown
        </h3>

        <div className="space-y-0">
          {displayRows.map((row, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-3.5 ${
                i < displayRows.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-gray-700">
                {row.name}
              </span>
              <span className="text-sm font-black text-[#0d40a5] font-mono">
                {row.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Botón PDF */}
        <BlobProvider document={pdfDoc}>
          {({ url, loading }) => (
            <button
              onClick={() => url && window.open(url, "_blank")}
              disabled={loading || !url}
              className="w-full cursor-pointer mt-6 py-3 border border-gray-200 rounded-xl text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-[#0d40a5] hover:border-[#0d40a5] transition-all disabled:opacity-40 disabled:cursor-wait"
            >
              {loading ? "Generando PDF..." : "Descargar la ficha técnica"}
            </button>
          )}
        </BlobProvider>
      </div>

      {/* Derecha — Categoría + características */}
      <div className="space-y-7">
        {/* Texto de categoría */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0d40a5] block mb-2">
            {displayCategory}
          </span>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 leading-tight mb-4">
            Diseñado para los imparables.
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm">{displayDesc}</p>
        </div>

        {/* 2 Feature cards */}
        <div className="grid grid-cols-2 gap-4">
          {displayCards.map((card, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: `${card.color}0d`,
                borderColor: `${card.color}25`,
              }}
            >
              <span
                className="material-symbols-outlined text-xl mb-3 block"
                style={{ color: card.color }}
              >
                {card.icon}
              </span>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {card.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
