import React from "react";
import { Link } from "react-router-dom";
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
  if (!raw) return [{ text: fallback, bold: true }];
  try { return JSON.parse(raw); } catch { return [{ text: fallback, bold: true }]; }
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
          textDecoration: seg.underline ? "underline" : undefined,
        }}
      >
        {seg.text}
      </span>
    </React.Fragment>
  ));
}

interface Feature { icon: string; label: string; }
interface ParsedContent { description: string; features: Feature[]; }

function parseContent(raw: string): ParsedContent {
  try {
    const p = JSON.parse(raw);
    return {
      description: p.description ?? raw,
      features: Array.isArray(p.features) ? p.features : [],
    };
  } catch {
    return { description: raw, features: [] };
  }
}

interface Props { section: HomeSection; }

export default function ProductsFeatureAlt({ section }: Props) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const { description, features } = parseContent(section.content);
  const imageSrc = resolveUrl(section.images?.[0]?.url ?? section.imageUrl ?? "");

  return (
    <section className="relative py-24 bg-[#0a1628] overflow-hidden border-t border-white/5">
      {/* Blur decorativo top-right */}
      <div
        className="absolute top-0 right-0 w-1/3 h-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: "#0d40a520" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* row-reverse: imagen izquierda, texto derecha en desktop */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">

          {/* Texto — derecha */}
          <div className="w-full lg:w-1/2 space-y-8">
            {section.subtitle && (
              <div className="inline-flex items-center gap-3" style={{ color: accent }}>
                <span className="h-px w-8" style={{ backgroundColor: accent }} />
                <span className="text-sm font-black uppercase tracking-widest">
                  {section.subtitle}
                </span>
              </div>
            )}

            <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-tight text-white">
              {renderSegments(segments, accent)}
            </h2>

            {description && (
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                {description}
              </p>
            )}

            {features.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: "#0d40a5" }}
                    >
                      {feat.icon}
                    </span>
                    <span className="text-slate-300 font-bold uppercase text-xs tracking-tighter">
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {section.buttonText && (
              <Link
                to={section.buttonLink || "/"}
                className="inline-flex px-10 py-4 font-black uppercase tracking-widest rounded-lg text-black text-sm transition-all duration-300 hover:brightness-110"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 30px ${accent}40`,
                }}
              >
                {section.buttonText}
              </Link>
            )}
          </div>

          {/* Imagen — izquierda */}
          <div className="w-full lg:w-1/2 relative">
            <div
              className="absolute bottom-0 left-0 right-0 h-1/4 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, #0a1628, transparent)" }}
            />
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={section.images?.[0]?.alt || section.title}
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ filter: "grayscale(50%)" }}
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-slate-600 text-sm">Sin imagen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
