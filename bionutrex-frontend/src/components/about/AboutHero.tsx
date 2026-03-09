import { Link } from "react-router-dom";
import type { HomeSection, TitleSegment } from "@/types";

interface Props {
  section: HomeSection | undefined;
}

export default function AboutHero({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";
  const isVideo = section.mediaType === "video" && !!section.videoUrl;

  const BACKEND =
    import.meta.env.VITE_API_URL?.replace("/api", "") ??
    "http://localhost:3001";
  const rawBg = section.images?.[0]?.url ?? section.imageUrl ?? "";
  const bgImage = rawBg.startsWith("/uploads/") ? `${BACKEND}${rawBg}` : rawBg;

  // Parsear segmentos del título
  let segments: TitleSegment[] = [];
  if (section.titleSegments) {
    try {
      segments = JSON.parse(section.titleSegments);
    } catch {
      segments = [{ text: section.title }];
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a1628]">
      {/* Fondo: video o imagen */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <video
            src={section.videoUrl!}
            autoPlay
            loop
            muted={section.videoMuted !== false}
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          bgImage && (
            <img
              src={bgImage}
              alt={section.title}
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />
          )
        )}
        {/* Gradiente: oscuro a la izq, transparente a la der */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/60 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          {section.subtitle && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit mb-8 backdrop-blur-md border"
              style={{
                background: `${accent}1a`,
                borderColor: `${accent}33`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: accent }}
              />
              <span
                className="text-[10px] font-black tracking-[0.3em] uppercase"
                style={{ color: accent }}
              >
                {section.subtitle}
              </span>
            </div>
          )}

          {/* Título */}
          <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase italic text-white mb-8">
            {segments.length > 0
              ? segments.map((seg, i) => {
                  const segColor =
                    seg.color === "accent" ? accent : (seg.color ?? "white");
                  return (
                    <span key={i}>
                      {seg.newlineBefore && <br />}
                      <span style={{ color: segColor }}>{seg.text}</span>
                    </span>
                  );
                })
              : section.title}
          </h1>

          {/* Descripción */}
          {section.content && (
            <p className="text-slate-300 max-w-xl text-xl font-medium leading-relaxed mb-10">
              {section.content}
            </p>
          )}

          {/* CTA */}
          {section.buttonText && section.buttonLink && (
            <Link
              to={section.buttonLink}
              className="inline-block px-12 py-5 text-sm font-black uppercase tracking-[0.2em] border-2 text-white hover:scale-105 transition-all duration-300"
              style={{ borderColor: accent, color: accent }}
            >
              {section.buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
