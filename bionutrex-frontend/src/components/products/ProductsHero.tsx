import React, { useRef } from "react";
import { Link } from "react-router-dom";
import type { TitleSegment } from "@/types";

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

interface Props {
  section: {
    subtitle?: string;
    title: string;
    titleSegments?: string;
    accentColor?: string;
    content: string;
    buttonText?: string;
    buttonLink?: string;
    button2Text?: string;
    button2Link?: string;
    videoUrl?: string;
    mediaType?: string;
    images?: { url: string }[];
    imageUrl?: string;
  };
}

export default function ProductsHero({ section }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);

  const rawMedia = section.images?.[0]?.url ?? section.imageUrl ?? "";
  const mediaSrc = resolveUrl(rawMedia);
  const videoSrc = resolveUrl(section.videoUrl ?? "");
  const isVideo = section.mediaType === "video" && videoSrc;

  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#0a1628]">
        {isVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={mediaSrc || undefined}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={section.title}
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/40 via-[#0a1628]/60 to-[#0a1628]" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Eyebrow badge */}
        {section.subtitle && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border text-xs font-black tracking-[0.2em] uppercase"
            style={{
              backgroundColor: `${accent}15`,
              borderColor: `${accent}40`,
              color: accent,
            }}
          >
            {section.subtitle}
          </div>
        )}

        {/* Title */}
        <h1 className="text-white text-6xl md:text-8xl font-black leading-none tracking-tighter mb-6 uppercase italic">
          {renderSegments(segments, accent)}
        </h1>

        {/* Description */}
        {section.content && (
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {section.content}
          </p>
        )}

        {/* Buttons */}
        {(section.buttonText || section.button2Text) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {section.buttonText && (
              <Link
                to={section.buttonLink || "/"}
                className="w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest rounded-lg text-white text-sm transition-all hover:shadow-[0_0_30px_rgba(13,64,165,0.6)]"
                style={{ backgroundColor: "#0d40a5" }}
              >
                {section.buttonText}
              </Link>
            )}
            {section.button2Text && (
              <Link
                to={section.button2Link || "/"}
                className="w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest rounded-lg text-white text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                {section.button2Text}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
