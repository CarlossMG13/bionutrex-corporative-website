import React from "react";
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

export default function ResourcesCTA({ section }: { section: HomeSection }) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const bgImage = section.images?.[0];
  const bgUrl = bgImage?.url ? resolveUrl(bgImage.url) : "";

  return (
    <section className="mb-20">
      <div
        className="rounded-3xl p-8 lg:p-16 border border-white/10 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #0d40a5 0%, #0d1b3e 60%, #060d1a 100%)",
        }}
      >
        {/* Decorative bg image */}
        {bgUrl && (
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden lg:block pointer-events-none">
            <img
              src={bgUrl}
              alt=""
              className="h-full w-full object-cover grayscale brightness-150"
            />
          </div>
        )}

        <div className="relative z-10">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6 uppercase">
            {renderSegments(segments, accent)}
          </h3>
          {section.content && (
            <p className="text-slate-200 text-lg mb-10 max-w-xl leading-relaxed">
              {contentToText(section.content)}
            </p>
          )}
          <div className="flex flex-wrap gap-6">
            {section.buttonText && (
              <a
                href={section.buttonLink || "#"}
                className="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-xl hover:brightness-110 transition-all"
                style={{ backgroundColor: accent, color: "#060d1a" }}
              >
                <span className="material-symbols-outlined">support_agent</span>
                {section.buttonText}
              </a>
            )}
            {section.button2Text && (
              <a
                href={section.button2Link || "#"}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined">mail</span>
                {section.button2Text}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
