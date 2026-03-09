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

export default function AboutFacilities({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";
  const mainImg = section.images?.[0];
  const img2 = section.images?.[1];
  const img3 = section.images?.[2];

  return (
    <section className="bg-slate-100 py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="max-w-2xl">
            {section.subtitle && (
              <span
                className="text-[10px] font-black tracking-[0.4em] uppercase mb-4 block"
                style={{ color: accent }}
              >
                {section.subtitle}
              </span>
            )}
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#0a1628] leading-tight">
              {section.title}
            </h3>
          </div>
          {section.content && (
            <p className="text-slate-500 font-medium md:max-w-sm">
              {section.content}
            </p>
          )}
        </div>

        {/* Image grid */}
        <div
          className="grid grid-cols-12 gap-4"
          style={{ height: "clamp(400px, 60vw, 700px)" }}
        >
          {/* Main large */}
          <div className="col-span-12 md:col-span-8 h-full relative group rounded-3xl overflow-hidden bg-slate-200">
            {mainImg?.url && (
              <img
                src={resolveUrl(mainImg.url)}
                alt={mainImg.alt || ""}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-90 saturate-[0.8] contrast-[1.1]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              {mainImg?.alt && (
                <div className="flex items-center gap-4 mb-2">
                  <span
                    className="w-12 h-[1px]"
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    className="text-[10px] font-black tracking-[0.3em] uppercase"
                    style={{ color: accent }}
                  >
                    {mainImg.alt}
                  </span>
                </div>
              )}
              {mainImg?.caption && (
                <h4 className="text-2xl md:text-3xl font-black text-white uppercase italic">
                  {mainImg.caption}
                </h4>
              )}
            </div>
          </div>

          {/* Side images */}
          <div className="col-span-12 md:col-span-4 flex flex-row md:flex-col gap-4 h-40 md:h-full">
            {[img2, img3].map((img, i) =>
              img ? (
                <div
                  key={i}
                  className="flex-1 relative group rounded-3xl overflow-hidden bg-slate-200"
                >
                  {img.url && (
                    <img
                      src={resolveUrl(img.url)}
                      alt={img.alt || ""}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 saturate-[0.7]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-8">
                    {img.caption && (
                      <h4 className="text-lg md:text-xl font-black text-white uppercase italic">
                        {img.caption}
                      </h4>
                    )}
                    {img.alt && (
                      <p
                        className="text-[10px] font-black tracking-[0.2em] uppercase mt-1"
                        style={{ color: accent }}
                      >
                        {img.alt}
                      </p>
                    )}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
