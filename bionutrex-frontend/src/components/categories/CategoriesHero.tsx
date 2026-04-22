import React from "react";
import { Link } from "react-router-dom";
import type { HomeSection, TitleSegment } from "@/types";
import { contentToText } from "@/utils/contentToText";

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

export default function CategoriesHero({ section }: { section: HomeSection }) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const image = section.images?.[0];
  const bgUrl = image?.url ? resolveUrl(image.url) : "";

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "85vh", backgroundColor: "#060d1a" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, #060d1a 40%, rgba(6,13,26,0.75) 70%, transparent)",
          }}
        />
        {section.mediaType === "video" && section.videoUrl ? (
          <video
            src={resolveUrl(section.videoUrl)}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-50"
          />
        ) : bgUrl ? (
          <img
            src={bgUrl}
            alt={image?.alt || section.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: "linear-gradient(135deg, #060d1a 0%, #0d2040 100%)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        className="relative z-20 px-6 lg:px-20 flex flex-col justify-center"
        style={{ minHeight: "85vh", maxWidth: "56rem" }}
      >
        {/* Eyebrow badge */}
        {section.subtitle && (
          <span
            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 rounded-full border w-fit"
            style={{
              backgroundColor: `${accent}20`,
              color: accent,
              borderColor: `${accent}50`,
            }}
          >
            {section.subtitle}
          </span>
        )}

        {/* Title */}
        <h1 className="text-white text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight uppercase italic">
          {renderSegments(segments, accent)}
        </h1>

        {/* Description */}
        {section.content && (
          <p className="text-slate-300 text-lg lg:text-xl max-w-2xl mb-10 leading-relaxed">
            {contentToText(section.content)}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-4">
          {section.buttonText && (
            <Link
              to={section.buttonLink || "/"}
              className="flex items-center gap-2 px-8 py-4 text-white rounded-lg font-bold text-base transition-all hover:brightness-110"
              style={{
                backgroundColor: "#0d40a5",
                boxShadow: "0 0 24px rgba(13,64,165,0.5)",
              }}
            >
              {section.buttonText}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          )}
          {section.button2Text && (
            <Link
              to={section.button2Link || "/"}
              className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-lg font-bold text-base hover:bg-white/5 transition-all"
            >
              {section.button2Text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
