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

interface GoalCard {
  title: string;
  description: string;
  link: string;
}

function parseGoals(raw: string): GoalCard[] {
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p;
    return [];
  } catch {
    return [];
  }
}

export default function CategoriesGoals({ section }: { section: HomeSection }) {
  const accent = section.accentColor ?? "#00e5ff";
  const segments = parseSegments(section.titleSegments, section.title);
  const goals = parseGoals(section.content);

  return (
    <section className="px-6 lg:px-20 py-16 bg-[#0a1628]">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-3 uppercase italic">
            {renderSegments(segments, accent)}
          </h2>
          <div
            className="h-1.5 w-24 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </div>
        {section.subtitle && (
          <p className="text-slate-400 max-w-md">{section.subtitle}</p>
        )}
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {goals.map((goal, i) => {
          const img = section.images?.[i];
          const imgUrl = img?.url ? resolveUrl(img.url) : "";
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl bg-slate-800 cursor-pointer"
              style={{ aspectRatio: "3/4" }}
            >
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={img?.alt || goal.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060d1a] via-[#060d1a]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {goal.title}
                </h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {goal.description}
                </p>
                <Link
                  to={goal.link || "/"}
                  className="inline-flex items-center font-bold text-sm uppercase tracking-wider group/link"
                  style={{ color: accent }}
                >
                  Explorar Stack
                  <span className="material-symbols-outlined ml-2 text-base group-hover/link:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
