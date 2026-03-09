import { useHomeSections } from "@/contexts/HomeDataContext";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

interface Stat {
  value: string;
  label: string;
  desc: string;
}

const DEFAULT_STATS: Stat[] = [
  {
    value: "99.8%",
    label: "Bio-Disponibilidad",
    desc: "Nuestra ingeniería molecular propietaria asegura una absorción casi total en los primeros 15 minutos.",
  },
  {
    value: "0.0%",
    label: "Sustancias Prohibidas",
    desc: "Cada lote es triple-verificado por laboratorios independientes. Sin rellenos, sin químicos ocultos.",
  },
];

function parseStats(content: string): Stat[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_STATS;
}

export default function TrainerSection() {
  const { getSectionByKey } = useHomeSections();
  const section = getSectionByKey("blog");

  const sectionLabel = section?.subtitle || "Scientific Edge";
  const titleLines = (
    section?.title || "Diseñado para la\nMáquina Humana."
  ).split("\n");
  const stats = section?.content ? parseStats(section.content) : DEFAULT_STATS;

  const img = section?.images?.[0];
  const mainImage = img?.url
    ? img.url.startsWith("/uploads/")
      ? `${BACKEND_URL}${img.url}`
      : img.url
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuAr1BEaTEEaUPuSSObrewGQZYeSUAIchNBcl-FDp-foD29uELWEMCFpsvqa0RyiunUi5NdZ5GfPk_aDQky7VQj_07xgf0ItFF8YsYed_mh0oY4fnwb63s3d66v0bh0lyNEQu3AN7cXjJo6f3VRqpHk8F-d5elNlqKUa-YTDV894bBGRqQ-2kQJbvIFippYhyHe4Hf1-b23UmDPba0h44j23PiGr8xOOQpsRmHUDeYCIhL_wDr4hL0qZdqgIEPCd59jtia-ZR3EQIq4";
  const quote =
    img?.caption || '"El máximo rendimiento requiere la máxima pureza."';

  return (
    <section className="py-20 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Izquierda — Imagen */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <img
                alt="Elite Athlete"
                className="w-full h-[380px] sm:h-[500px] lg:h-[600px] object-cover"
                src={mainImage}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-[#0d40a5]/90 to-transparent">
                <p className="text-white text-base sm:text-lg font-bold italic tracking-tight uppercase">
                  {quote}
                </p>
              </div>
            </div>
          </div>

          {/* Derecha — Contenido */}
          <div className="order-1 lg:order-2">
            <h2 className="text-[#00e5ff] text-xs font-black tracking-[0.5em] uppercase mb-6">
              {sectionLabel}
            </h2>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.9] mb-8 sm:mb-10 text-black">
              {titleLines[0]}
              {titleLines[1] && (
                <>
                  <br />
                  <span className="text-slate-300 italic">{titleLines[1]}</span>
                </>
              )}
            </h3>

            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-5 sm:gap-6 p-6 sm:p-8 bg-[#f6f6f8] border border-slate-100 rounded-2xl hover:border-[#00e5ff] transition-all duration-300"
                >
                  <span className="text-3xl sm:text-4xl font-black text-[#00e5ff] italic flex-shrink-0">
                    {stat.value}
                  </span>
                  <div>
                    <p className="font-black uppercase text-sm tracking-widest text-black">
                      {stat.label}
                    </p>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
