import type { HomeSection } from "@/types";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND}${url}`;
  return url;
}

interface Expert {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

interface Props {
  section: HomeSection | undefined;
}

export default function AboutTeam({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";

  let experts: Expert[] = [];
  try {
    const parsed = JSON.parse(section.content);
    if (Array.isArray(parsed)) experts = parsed;
  } catch {
    experts = [];
  }

  return (
    <section className="bg-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center">
          {section.subtitle && (
            <span
              className="text-[10px] font-black tracking-[0.4em] uppercase mb-4 block"
              style={{ color: accent }}
            >
              {section.subtitle}
            </span>
          )}
          <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#0a1628] mb-4">
            {section.title}
          </h3>
          {section.buttonText && (
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
              {section.buttonText}
            </p>
          )}
        </div>

        {/* Experts grid */}
        {experts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {experts.map((expert, i) => {
              const imgSrc = expert.imageUrl ? resolveUrl(expert.imageUrl) : "";
              return (
                <div
                  key={i}
                  className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-slate-100"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={expert.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <h4 className="text-2xl font-black text-white uppercase italic">
                      {expert.name}
                    </h4>
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                      style={{ color: accent }}
                    >
                      {expert.role}
                    </p>
                    {expert.description && (
                      <p className="text-slate-300 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {expert.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
