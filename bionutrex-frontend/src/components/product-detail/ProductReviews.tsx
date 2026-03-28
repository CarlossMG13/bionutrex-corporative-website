interface Props {
  rating?: number;
  reviewCount?: number;
}

const MOCK_REVIEWS = [
  {
    initials: "JD",
    name: "Jonathan D.",
    role: "Atleta verificado",
    rating: 5,
    text: "Cambio notable en mis niveles de energía durante entrenamientos de alta intensidad. La fórmula es limpia, sin rellenos. Totalmente recomendado.",
    helpful: 42,
  },
  {
    initials: "MS",
    name: "María S.",
    role: "Entrenadora de resistencia",
    rating: 4.5,
    text: "Fórmula técnica sólida. Lo uso específicamente con mis atletas de alto rendimiento por su tasa de absorción. Excelente producto.",
    helpful: 18,
  },
];

const RATING_BARS = [
  { stars: 5, pct: 85 },
  { stars: 4, pct: 10 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{
            fontVariationSettings: `'FILL' ${
              i <= Math.floor(rating) ? 1 : i - 0.5 <= rating ? 0.5 : 0
            }`,
            color: "#0d40a5",
          }}
        >
          star
        </span>
      ))}
    </span>
  );
}

export function ProductReviews({ rating = 4.8, reviewCount = 1240 }: Props) {
  return (
    <section className="mb-20">
      <h2 className="text-2xl font-black tracking-tighter text-gray-900 mb-8">
        Reseñas de clientes
      </h2>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
        {/* Score global */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
          <div className="text-5xl font-black text-[#0d40a5] mb-2">
            {rating.toFixed(1)}
          </div>
          <Stars rating={rating} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
            Basado en {reviewCount.toLocaleString()} reseñas
          </p>
        </div>

        {/* Barras por estrella */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-2.5">
          {RATING_BARS.map((b) => (
            <div key={b.stars} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 w-3">{b.stars}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0d40a5] rounded-full"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-bold w-7">{b.pct}%</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="md:col-span-3 flex items-center justify-center">
          <button className="w-full py-3 border-2 border-[#0d40a5] text-[#0d40a5] rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#0d40a5] hover:text-white transition-all">
            Escribir reseña
          </button>
        </div>
      </div>

      {/* Reseñas individuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_REVIEWS.map((r) => (
          <div
            key={r.name}
            className="p-7 bg-white border border-gray-200 rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                  style={{ backgroundColor: "#0d40a5" }}
                >
                  {r.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{r.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {r.role}
                  </p>
                </div>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed italic mb-5">"{r.text}"</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
              <span className="material-symbols-outlined text-sm">thumb_up</span>
              <span>Útil ({r.helpful})</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
