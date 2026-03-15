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

function parseSegments(
  raw: string | undefined,
  fallback: string,
): TitleSegment[] {
  if (!raw) return [{ text: fallback, bold: true }];
  try {
    return JSON.parse(raw);
  } catch {
    return [{ text: fallback, bold: true }];
  }
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

interface Badge {
  value: string;
  label: string;
}

interface ParsedContent {
  description: string;
  badges: Badge[];
}

function parseContent(raw: string): ParsedContent {
  try {
    const parsed = JSON.parse(raw);
    return {
      description: parsed.description ?? raw,
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return { description: raw, badges: [] };
  }
}

interface Props {
  section: HomeSection;
}

export default function ProductsFeature({ section }: Props) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const { description, badges } = parseContent(section.content);
  const imageSrc = resolveUrl(
    section.images?.[0]?.url ?? section.imageUrl ?? "",
  );

  return (
    <section className="relative py-24 bg-[#0a1628] border-t border-white/5 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left — Text */}
          <div className="w-full lg:w-1/2 space-y-8">
            {/* Eyebrow */}
            {section.subtitle && (
              <div
                className="inline-flex items-center gap-3"
                style={{ color: accent }}
              >
                <span
                  className="h-px w-8"
                  style={{ backgroundColor: accent }}
                />
                <span className="text-sm font-black uppercase tracking-widest">
                  {section.subtitle}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-tight text-white">
              {renderSegments(segments, accent)}
            </h2>

            {/* Description */}
            {description && (
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                {description}
              </p>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="grid grid-cols-2 gap-6">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div
                      className="text-3xl font-black mb-1"
                      style={{ color: accent }}
                    >
                      {badge.value}
                    </div>
                    <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">
                      {badge.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {section.buttonText && (
              <Link
                to={section.buttonLink || "/"}
                className="inline-flex px-10 py-4 font-black uppercase tracking-widest rounded-lg transition-all duration-300 border-2 text-sm"
                style={{
                  borderColor: accent,
                  color: accent,
                  boxShadow: `0 0 15px ${accent}33`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    accent;
                  (e.currentTarget as HTMLElement).style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = accent;
                }}
              >
                {section.buttonText}
              </Link>
            )}
          </div>

          {/* Right — Image */}
          <div className="w-full lg:w-1/2 relative group">
            {/* Glow */}
            <div
              className="absolute -inset-4 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{ backgroundColor: "#0d40a5" }}
            />

            {imageSrc ? (
              <img
                src={imageSrc}
                alt={section.images?.[0]?.alt || section.title}
                className="w-full rounded-2xl border border-white/10 relative z-10 grayscale hover:grayscale-0 transition-all duration-700 object-cover"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center relative z-10">
                <span className="text-slate-600 text-sm">Sin imagen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
