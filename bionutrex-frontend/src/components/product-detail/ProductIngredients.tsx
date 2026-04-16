interface Ingredient { name: string; amount: string; }
interface Feature    { icon: string; title: string; description: string; color: string; }

function parse<T>(raw: string | undefined): T[] {
  try { return JSON.parse(raw || "[]"); } catch { return []; }
}

interface Props {
  ingredients?: string;
  longDescription?: string;
  features?: string;
}

export function ProductIngredients({ ingredients, longDescription, features }: Props) {
  const rows  = parse<Ingredient>(ingredients);
  const cards = parse<Feature>(features);

  if (!rows.length && !longDescription && !cards.length) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-20 items-start">
      {/* Tabla de ingredientes */}
      {rows.length > 0 && (
        <div className="p-7 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-xl font-black tracking-tight text-gray-900 mb-6">
            Composición molecular
          </h3>
          <div className="space-y-0">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`flex justify-between items-center py-3 ${
                  i < rows.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="font-medium text-gray-800 text-sm">{row.name}</span>
                <span className="font-black text-[#0d40a5] text-sm font-mono">{row.amount}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 border border-gray-200 rounded-xl text-xs uppercase tracking-widest font-black text-gray-400 hover:text-[#0d40a5] hover:border-[#0d40a5] transition-all">
            Ver tabla completa de nutrición
          </button>
        </div>
      )}

      {/* Descripción técnica + feature cards */}
      {(longDescription || cards.length > 0) && (
        <div className="space-y-7">
          {longDescription && (
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 mb-3">
                Diseñado para los imparables.
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{longDescription}</p>
            </div>
          )}
          {cards.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: `${card.color}0d`,
                    borderColor: `${card.color}25`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-xl mb-2 block"
                    style={{ color: card.color }}
                  >
                    {card.icon}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{card.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
