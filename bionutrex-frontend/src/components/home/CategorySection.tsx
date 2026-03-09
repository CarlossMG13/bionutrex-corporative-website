import { useHomeSections } from "@/contexts/HomeDataContext";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

const DEFAULT_CARDS = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAyRazIjuOU1VQuVp7PXAdYFt09xM3WTtDuC9uTmeuvQixxR7qkSBEwaO3Uhu55svoRQpNgQJDBs1foKJnGw1R0Z7kxXEXYYbosTID7FIYCLSLhrbebkcPHTsvQO7D2-33v5ok9t_TIPvCmE4SECaOoJAjoTgJQYvekFfl8igDMpbu2EEK0tc250EJiBdNDQEfLRkHlj5CK8Z2Fw9HPDvIw88skGaI-clDHAGm0C_iFLk0ybYMwuTQtKMQuwbBTCWnCVtz1m1t8n-Y",
    title: "Ganancia\nMuscular",
    desc: "Hipertrofia Estructural & Ingeniería de Potencia",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDR8Q4egqF3WU_XI1DIPQsiTHAUV0yPEspId2T5SOEp8lEkVDVBT6jMHEHb5TIvUrMYKyb7uyx12rA_1zf1T85ifwEKO0aibmJ6Covt-tcy_ib0ms1p2Kjpaju4Xw8ebF2H5dEgmrjhX_rnQw3NxE28rkWdnD9Gje2lpdMPngeLjtOODOt0CzpQ66tK4Mp0dwcr4pfTDIQmGPE1aPNTmN5NySovQylt5bN8hXnroc2Mb37W5cpBpB0gdZqKeTW0gqihOIq3A1VUPyo",
    title: "Energía",
    desc: "Activación Explosiva de ATP & Enfoque",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVjJIV1qh4hrPLsBnWZnhHL7uz4Z17-9Kj-gAddXxJoXzXh5LnMUMLn_xHytimMv_fZDrKU3NCNx2A0oifxKN02pc_Ikh6A6wS4e8MpssWn_3tNpKGPq3zHpOhIYBIyU9RzQWThjhtHU89pWAC8J5Qps5LZjoXtoxTpOLfCnbJ-Wz8d0_-5BTZ_VcZlJV5ilLvoD0Y8JqtMm2TZDSJa1mnLu3v9_TYKy8DDU8Bsu0Hgl3XYyy7rGDnfV8Nb46YdWr9YrKmB67E6WQ",
    title: "Recuperación",
    desc: "Reparación Celular & Resíntesis de Tejidos",
  },
];

export default function CategorySection() {
  const { getSectionByKey } = useHomeSections();
  const section = getSectionByKey("methodology");

  const sectionLabel = section?.subtitle || "Objetivos Funcionales";
  const sectionTitle = section?.title || "Optimiza Tu Fisiología";
  const buttonText = section?.buttonText || "Comprar ahora";

  const cards = DEFAULT_CARDS.map((defaults, i) => {
    const img = section?.images?.[i];
    return {
      image: img?.url ? resolveUrl(img.url) : defaults.image,
      title: img?.alt || defaults.title,
      desc: img?.caption || defaults.desc,
    };
  });

  return (
    <section className="bg-[#f6f6f8] py-20 sm:py-32 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[11px] font-black tracking-[0.6em] uppercase text-[#00e5ff] mb-4">
            {sectionLabel}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-black uppercase italic">
            {sectionTitle}
          </h3>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group relative h-[480px] sm:h-[580px] md:h-[650px] overflow-hidden rounded-3xl cursor-pointer"
            >
              {/* Imagen de fondo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url('${card.image}')` }}
              />
              {/* Overlay degradado */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              {/* Contenido */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end">
                <h3 className="text-4xl sm:text-5xl font-black uppercase italic text-white mb-2 leading-none whitespace-pre-line">
                  {card.title}
                </h3>
                <p className="text-slate-300 text-sm mb-6 sm:mb-8 max-w-[200px] font-semibold uppercase tracking-widest leading-relaxed">
                  {card.desc}
                </p>
                <button className="w-full bg-white text-black py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 group-hover:-translate-y-1 transform">
                  {buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
