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
    <div
      className="relative rounded-3xl overflow-hidden mb-16 flex items-end"
      style={{ aspectRatio: "21/9" }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {bgUrl ? (
          <img
            src={bgUrl}
            alt={image?.alt || section.title}
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #0d40a5 0%, #060d1a 100%)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d1a] via-[#060d1a]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-10 lg:p-16 w-full max-w-4xl">
        {section.subtitle && (
          <span
            className="inline-block px-3 py-1 text-xs font-bold tracking-widest uppercase rounded mb-4 w-fit"
            style={{
              backgroundColor: "rgba(13,64,165,0.3)",
              color: accent,
              border: `1px solid ${accent}50`,
            }}
          >
            {section.subtitle}
          </span>
        )}

        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight uppercase">
          {renderSegments(segments, accent)}
        </h1>

        {section.content && (
          <p className="text-slate-300 text-lg mb-8 max-w-2xl leading-relaxed">
            {section.content}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {searchProps && (
            <div className="flex-1 min-w-[300px] relative">
              <span
                className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#0d40a5" }}
              >
                search
              </span>
              <input
                value={searchProps.value}
                onChange={(e) => searchProps.onChange(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Buscar guías, protocolos o especificaciones..."
              />
            </div>
          )}
          {section.buttonText && (
            <button
              className="h-14 px-8 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm hover:brightness-110"
              style={{
                backgroundColor: "#0d40a5",
                boxShadow: "0 8px 24px rgba(13,64,165,0.35)",
              }}
            >
              <span className="material-symbols-outlined">description</span>
              {section.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
