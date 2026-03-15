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

interface Stat {
  value: string;
  label: string;
}

interface ParsedContent {
  description: string;
  icon: string;
  productName: string;
  stats: Stat[];
}

function parseContent(raw: string): ParsedContent {
  try {
    const p = JSON.parse(raw);
    return {
      description: p.description ?? raw,
      icon: p.icon ?? "offline_bolt",
      productName: p.productName ?? "",
      stats: Array.isArray(p.stats) ? p.stats : [],
    };
  } catch {
    return { description: raw, icon: "offline_bolt", productName: "", stats: [] };
  }
}

interface Props {
  section: HomeSection;
}

export default function ProductsPreWorkout({ section }: Props) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const { description, icon, productName, stats } = parseContent(section.content);

  return (
    <section
      className="relative py-24 overflow-hidden border-t border-white/5"
      style={{
        backgroundColor: "#060d1a",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Glass panel */}
        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 p-8 md:p-16"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          {/* Decorative bg icon */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "12rem", lineHeight: 1, color: accent }}
            >
              {icon}
            </span>
          </div>

          {/* Centered content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
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
                <span
                  className="h-px w-8"
                  style={{ backgroundColor: accent }}
                />
              </div>
            )}

            {/* Main title */}
            <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-none text-white">
              {renderSegments(segments, accent)}
            </h2>

            {/* Product name subtitle */}
            {productName && (
              <h3
                className="text-2xl md:text-3xl font-black tracking-[0.4em] uppercase"
                style={{ color: accent }}
              >
                {productName}
              </h3>
            )}

            {/* Description */}
            {description && (
              <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                {description}
              </p>
            )}

            {/* Stats row */}
            {stats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-10 py-6">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`text-center ${
                      i > 0 && i < stats.length - 1
                        ? "border-x border-white/10 px-10"
                        : ""
                    }`}
                  >
                    <div className="text-3xl font-black text-white italic">
                      {stat.value}
                    </div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA button */}
            {section.buttonText && (
              <Link
                to={section.buttonLink || "/"}
                className="px-12 py-5 font-black uppercase tracking-[0.2em] rounded-lg text-white text-sm transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, #0d40a5, ${accent})`,
                  boxShadow: "0 10px 40px rgba(17,82,212,0.4)",
                }}
              >
                {section.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
