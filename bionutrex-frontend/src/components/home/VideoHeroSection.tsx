import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useHomeSections } from "@/contexts/HomeDataContext";
import type { TitleSegment } from "@/types";
import { contentToText } from "@/utils/contentToText";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
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

export default function VideoHeroSection() {
  const { getSectionByKey } = useHomeSections();
  const section = getSectionByKey("home_video_hero");
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseJSON<TitleSegment[]>(section.titleSegments, [
    { text: section.title, bold: true },
  ]);
  const videoSrc = resolveUrl(section.videoUrl ?? "");
  const posterSrc = resolveUrl(section.images?.[0]?.url ?? section.imageUrl ?? "");

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden flex items-end">
      {/* ── Video / Fallback ── */}
      <div className="absolute inset-0 z-0 bg-[#0a1628]">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : posterSrc ? (
          <img
            src={posterSrc}
            alt={section.title}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Overlay layers — dark vignette + bottom-left gradient for text legibility */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24">
        <div className="max-w-3xl space-y-6 md:space-y-8">
          {/* Eyebrow badge */}
          {section.subtitle && (
            <div
              className="inline-flex items-center gap-2.5 border px-4 py-2 rounded-full backdrop-blur-sm"
              style={{
                borderColor: `${accent}50`,
                backgroundColor: `${accent}10`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accent }}
              />
              <span
                className="text-[10px] font-black tracking-[0.35em] uppercase"
                style={{ color: accent }}
              >
                {section.subtitle}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.88] tracking-tighter uppercase text-white">
            {renderSegments(segments, accent)}
          </h1>

          {/* Description */}
          {section.content && (
            <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                {contentToText(section.content)}
              </p>
          )}

          {/* CTA */}
          {(section.buttonText || section.buttonLink) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {section.buttonText && (
                <Link
                  to={section.buttonLink || "/"}
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-black uppercase tracking-[0.25em] text-black hover:brightness-90 transition-all duration-300"
                  style={{ backgroundColor: accent }}
                >
                  {section.buttonText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex flex-col items-center gap-2">
        <span
          className="text-[9px] font-black tracking-[0.3em] uppercase rotate-90 origin-center"
          style={{ color: accent }}
        >
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-transparent"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${accent})` }}
        />
      </div>
    </section>
  );
}
