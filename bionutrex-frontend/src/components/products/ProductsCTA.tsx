import React from "react";
import { Link } from "react-router-dom";
import type { HomeSection, TitleSegment } from "@/types";

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
          textDecoration: seg.underline ? "underline" : undefined,
        }}
      >
        {seg.text}
      </span>
    </React.Fragment>
  ));
}

interface Props {
  section: HomeSection;
}

export default function ProductsCTA({ section }: Props) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);

  return (
    <section className="py-20 bg-[#0a1628] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-tight text-white">
            {renderSegments(segments, accent)}
          </h2>

          {/* Description */}
          {section.content && (
            <p className="text-slate-400 text-lg">{section.content}</p>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {section.buttonText && (
              <Link
                to={section.buttonLink || "/"}
                className="w-full sm:w-auto px-10 py-4 font-black uppercase tracking-widest rounded-lg text-white text-sm transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: "#0d40a5" }}
              >
                {section.buttonText}
              </Link>
            )}
            {section.button2Text && (
              <Link
                to={section.button2Link || "/"}
                className="w-full sm:w-auto px-10 py-4 border border-white/20 text-white font-black uppercase tracking-widest rounded-lg text-sm hover:bg-white/5 transition-all duration-300"
              >
                {section.button2Text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
