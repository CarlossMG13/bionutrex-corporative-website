import React from "react";
import type { HomeSection, TitleSegment } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

function parseSegments(raw: string | undefined, fallback: string): TitleSegment[] {
  if (!raw) return [{ text: fallback }];
  try { return JSON.parse(raw); } catch { return [{ text: fallback }]; }
}

function renderSegments(segments: TitleSegment[], accent: string) {
  return segments.map((seg, i) => (
    <React.Fragment key={i}>
      {seg.newlineBefore && <br />}
      <span
        style={{
          color: seg.color === "accent" ? accent : seg.color || "inherit",
          fontWeight: seg.bold ? 900 : undefined,
          fontStyle: seg.italic ? "italic" : undefined,
        }}
      >
        {seg.text}
      </span>
    </React.Fragment>
  ));
}

interface SearchProps {
  value: string;
  onChange: (val: string) => void;
}

interface Props {
  section: HomeSection;
  searchProps?: SearchProps;
}

export default function ResourcesHero({ section, searchProps }: Props) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const image = section.images?.[0];
  const bgUrl = image?.url ? resolveUrl(image.url) : "";

  return (
    <section
      className="relative w-full flex items-center overflow-hidden"
      style={{ minHeight: "72vh", background: "#060d1a" }}
    >
      {/* Background image */}
      {bgUrl && (
        <img
          src={bgUrl}
          alt={image?.alt || section.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: bgUrl
            ? "linear-gradient(to right, rgba(6,13,26,0.95) 45%, rgba(6,13,26,0.4) 100%)"
            : "linear-gradient(135deg, #0d40a5 0%, #060d1a 60%)",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        {section.subtitle && (
          <span
            className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded mb-6"
            style={{
              backgroundColor: "rgba(13,64,165,0.35)",
              color: accent,
              border: `1px solid ${accent}55`,
            }}
          >
            {section.subtitle}
          </span>
        )}

        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight uppercase max-w-3xl">
          {renderSegments(segments, accent)}
        </h1>

        {section.content && (
          <p className="text-slate-300 text-lg mb-10 max-w-2xl leading-relaxed">
            {section.content}
          </p>
        )}

        <div className="flex flex-wrap gap-4 max-w-2xl">
          {searchProps && (
            <div className="flex-1 min-w-[280px] relative">
              <span
                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl"
                style={{ color: accent }}
              >
                search
              </span>
              <input
                value={searchProps.value}
                onChange={(e) => searchProps.onChange(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": accent } as React.CSSProperties}
                placeholder="Buscar guías, protocolos o especificaciones..."
              />
            </div>
          )}
          {section.buttonText && (
            <button
              className="h-14 px-8 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm hover:brightness-110 shrink-0"
              style={{
                backgroundColor: "#0d40a5",
                boxShadow: "0 8px 24px rgba(13,64,165,0.4)",
              }}
            >
              <span className="material-symbols-outlined text-base">description</span>
              {section.buttonText}
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-10 mt-14">
          {[
            { value: "100+", label: "Documentos técnicos" },
            { value: "24/7", label: "Acceso en línea" },
            { value: "ISO", label: "Certificados" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-black text-white" style={{ color: accent }}>
                {stat.value}
              </div>
              <div className="text-slate-400 text-xs uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
