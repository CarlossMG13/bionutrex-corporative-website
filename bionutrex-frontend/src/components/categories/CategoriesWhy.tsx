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

function parseSegments(
  raw: string | undefined,
  fallback: string,
): TitleSegment[] {
  if (!raw) return [{ text: fallback }];
  try {
    return JSON.parse(raw);
  } catch {
    return [{ text: fallback }];
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
        }}
      >
        {seg.text}
      </span>
    </React.Fragment>
  ));
}

interface Bullet {
  icon: string;
  title: string;
  description: string;
}
interface Testimonial {
  name: string;
  role: string;
  quote: string;
  imageUrl: string;
}

interface ParsedContent {
  description: string;
  bullets: Bullet[];
  testimonial: Testimonial;
}

function parseContent(raw: string): ParsedContent {
  try {
    const p = JSON.parse(raw);
    return {
      description: p.description ?? "",
      bullets: Array.isArray(p.bullets) ? p.bullets : [],
      testimonial: p.testimonial ?? {
        name: "",
        role: "",
        quote: "",
        imageUrl: "",
      },
    };
  } catch {
    return {
      description: raw,
      bullets: [],
      testimonial: { name: "", role: "", quote: "", imageUrl: "" },
    };
  }
}

export default function CategoriesWhy({ section }: { section: HomeSection }) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const { description, bullets, testimonial } = parseContent(section.content);
  const mainImage = section.images?.[0];
  const mainImageUrl = mainImage?.url ? resolveUrl(mainImage.url) : "";

  return (
    <section className="px-6 lg:px-20 py-24 bg-[#060d1a] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute right-0 top-0 w-1/3 h-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at right, ${accent}15 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: text + bullets */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight uppercase italic">
            {renderSegments(segments, accent)}
          </h2>
          {description && (
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              {description}
            </p>
          )}
          {bullets.length > 0 && (
            <div className="space-y-6">
              {bullets.map((b, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${accent}20`,
                      borderColor: `${accent}40`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: accent }}
                    >
                      {b.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{b.title}</h4>
                    <p className="text-slate-500 text-sm">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: image + testimonial */}
        <div className="relative">
          <div className="aspect-square bg-slate-800 rounded-3xl overflow-hidden border border-white/10">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={mainImage?.alt || ""}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-700 text-7xl">
                  image
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060d1a]/80 to-transparent" />

            {/* Testimonial overlay */}
            {(testimonial.name || testimonial.quote) && (
              <div className="absolute bottom-8 left-8 right-8 bg-slate-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                {(testimonial.name || testimonial.imageUrl) && (
                  <div className="flex items-center gap-4 mb-4">
                    {testimonial.imageUrl && (
                      <div
                        className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0"
                        style={{ borderColor: "#0d40a5" }}
                      >
                        <img
                          src={resolveUrl(testimonial.imageUrl)}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      {testimonial.name && (
                        <h5 className="font-bold text-white">
                          {testimonial.name}
                        </h5>
                      )}
                      {testimonial.role && (
                        <p className="text-xs text-slate-400">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {testimonial.quote && (
                  <p className="text-sm italic text-slate-300">
                    "{testimonial.quote}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
