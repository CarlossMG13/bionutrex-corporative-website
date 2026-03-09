import type { HomeSection } from "@/types";

const BACKEND =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND}${url}`;
  return url;
}

interface Props {
  section: HomeSection | undefined;
}

export default function AboutStory({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";
  const img1 = section.images?.[0];
  const img2 = section.images?.[1];
  const img3 = section.images?.[2];

  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: texto + fotos pequeñas */}
          <div className="space-y-10 lg:space-y-12">
            <div>
              {section.subtitle && (
                <span
                  className="text-[10px] font-black tracking-[0.4em] uppercase mb-4 block"
                  style={{ color: accent }}
                >
                  {section.subtitle}
                </span>
              )}
              <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#0a1628] leading-tight mb-6">
                {section.title}
              </h3>
              {section.content && (
                <p className="text-slate-600 text-lg leading-relaxed">
                  {section.content}
                </p>
              )}
            </div>

            {(img1 || img2) && (
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                {[img1, img2].map((img, i) =>
                  img ? (
                    <div key={i} className="space-y-3">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                        {img.url ? (
                          <img
                            src={resolveUrl(img.url)}
                            alt={img.alt || ""}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-400 text-xs">
                              Sin imagen
                            </span>
                          </div>
                        )}
                      </div>
                      {img.caption && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>

          {/* Right: imagen grande */}
          <div className="relative mt-8 lg:mt-0">
            <div
              className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl z-0 opacity-30 pointer-events-none"
              style={{ backgroundColor: accent }}
            />
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 h-80 md:h-[500px] lg:h-[650px]">
              {img3?.url ? (
                <img
                  src={resolveUrl(img3.url)}
                  alt={img3.alt || section.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">
                    Sin imagen principal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
