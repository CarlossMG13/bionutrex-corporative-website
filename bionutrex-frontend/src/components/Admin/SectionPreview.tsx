import React from "react";
import type { HomeSection } from "@/types";

const truncate = (s: string, n = 200) => (s.length > n ? `${s.slice(0, n)}...` : s);

const StatsPreview: React.FC<{ items: any[] }> = ({ items }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {items.slice(0, 3).map((it, idx) => {
      const label = it.label ?? it.title ?? it.name ?? it.icon ?? "";
      const value = it.value ?? it.description ?? "";
      return (
        <div
          key={idx}
          className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 border border-gray-100"
        >
          <div className="font-medium">{label}</div>
          {value && <div className="text-xs text-slate-500">{String(value)}</div>}
        </div>
      );
    })}
    {items.length > 3 && (
      <div className="px-2 py-1 text-xs text-slate-500">+{items.length - 3} más</div>
    )}
  </div>
);

const TeamPreview: React.FC<{ items: any[] }> = ({ items }) => (
  <div className="flex flex-col text-sm text-slate-700">
    {items.slice(0, 3).map((m, idx) => (
      <div key={idx} className="truncate">
        <span className="font-medium">{m.name ?? m.title ?? m.label ?? `Miembro ${idx + 1}`}</span>
        {m.role && <span className="text-slate-500"> — {m.role}</span>}
      </div>
    ))}
    {items.length > 3 && <div className="text-xs text-slate-500 mt-1">+{items.length - 3} más</div>}
  </div>
);

const isPrimitive = (v: any) => v === null || ["string", "number", "boolean"].includes(typeof v);

const firstStringProp = (obj: any) => {
  if (!obj || typeof obj !== "object") return null;
  const prefer = ["label", "title", "name", "text", "description", "id"];
  for (const k of prefer) {
    if (typeof obj[k] === "string" && obj[k].trim()) return obj[k];
  }
  // fallback: first primitive string prop
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === "string" && obj[k].trim()) return obj[k];
  }
  return null;
};

const GenericJsonPreview: React.FC<{ data: any }> = ({ data }) => {
  if (Array.isArray(data)) {
    if (data.length === 0) return <div className="text-sm text-slate-700">0 elementos</div>;

    // Array of primitives
    if (data.every(isPrimitive)) {
      const sample = data.slice(0, 6).map((v) => String(v)).join(", ");
      return (
        <div className="text-sm text-slate-700">
          {data.length} elementos — {sample}
          {data.length > 6 ? ` +${data.length - 6}` : ""}
        </div>
      );
    }

    // Array of objects — render compact cards
    if (data.some((it) => typeof it === "object")) {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {data.slice(0, 3).map((it: any, idx: number) => {
            const label = firstStringProp(it) ?? `Ítem ${idx + 1}`;
            const subtitle = it.value ?? it.description ?? it.role ?? it.subtitle ?? null;
            return (
              <div
                key={idx}
                className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 border border-gray-100"
              >
                <div className="font-medium">{label}</div>
                {subtitle && <div className="text-xs text-slate-500">{truncate(String(subtitle), 60)}</div>}
              </div>
            );
          })}
          {data.length > 3 && (
            <div className="px-2 py-1 text-xs text-slate-500">+{data.length - 3} más</div>
          )}
        </div>
      );
    }

    return <div className="text-sm text-slate-700">{data.length} elementos</div>;
  }

  if (typeof data === "object" && data !== null) {
    // Testimonial (accept both 'testimonial' and common misspelling 'tertimonial') — render as quote
    const testimonialData = data.testimonial ?? data.tertimonial ?? null;
    if (testimonialData) {
      const t = Array.isArray(testimonialData) ? testimonialData[0] : testimonialData;
      const quote = firstStringProp(t) ?? t.quote ?? t.text ?? t.message ?? null;
      const author = t.author ?? t.name ?? null;
      return (
        <div className="p-2">
          {quote && <blockquote className="italic text-slate-700">“{truncate(String(quote), 180)}”</blockquote>}
          {author && <div className="text-xs text-slate-500 mt-1">— {author}</div>}
        </div>
      );
    }

    // Bundle / pricing info detection
    const bundleTitle = data.bundleTitle ?? data.bundle_title ?? null;
    const bundleText = data.bundleText ?? data.bundle_text ?? data.bundle_description ?? null;
    const originalPrice = data.originalPrice ?? data.original_price ?? null;
    const price = data.price ?? data.currentPrice ?? data.discountPrice ?? null;
    if (bundleTitle || bundleText || originalPrice || price) {
      return (
        <div>
          {bundleTitle && <div className="font-medium text-slate-800">{truncate(String(bundleTitle), 120)}</div>}
          {bundleText && <div className="text-sm text-slate-600 mb-1">{truncate(String(bundleText), 140)}</div>}
          <div className="flex items-center gap-3">
            {originalPrice && <div className="text-sm text-slate-500 line-through">{String(originalPrice)}</div>}
            {price && <div className="text-sm text-slate-800 font-bold">{String(price)}</div>}
          </div>
        </div>
      );
    }

    // If object contains array keys, render them as badge groups (supports multiple keys)
    const arrayKeys = ["badges", "features", "stats", "items", "goals", "cards", "highlights", "advantages", "bullets"];
    const specialArrayKeys = ["categories", "category", "productLines", "productLine", "dateOptions", "dateOption"];
    const allArrayKeySet = new Set([...arrayKeys, ...specialArrayKeys]);

    const matchedArrayKeys = Object.keys(data).filter((k) => Array.isArray((data as any)[k]) && (allArrayKeySet.has(k) || (data as any)[k].length > 0));

    if (matchedArrayKeys.length > 0) {
      const desc = (data.description ?? data.text ?? firstStringProp(data)) || null;
      return (
        <div>
          {desc && <div className="text-gray-600 text-sm mb-1">{truncate(String(desc), 140)}</div>}
          <div className="flex flex-col gap-2">
            {matchedArrayKeys.map((k) => {
              const arr = (data as any)[k] as any[];
              if (!Array.isArray(arr) || arr.length === 0) return null;

              if (k === "bullets") {
                return (
                  <div key={k}>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      {arr.slice(0, 4).map((it: any, idx: number) => (
                        <li key={idx} className="truncate">{firstStringProp(it) ?? String(it)}</li>
                      ))}
                      {arr.length > 4 && <li className="text-xs text-slate-500">+{arr.length - 4} más</li>}
                    </ul>
                  </div>
                );
              }

              // Humanize key for display (ProductLines -> Product lines)
              const groupLabel = k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

              return (
                <div key={k}>
                  <div className="text-xs text-slate-500 mb-1">{groupLabel}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {arr.slice(0, 4).map((it: any, idx: number) => {
                      const label = isPrimitive(it)
                        ? String(it)
                        : firstStringProp(it) ?? it.label ?? it.title ?? it.name ?? String(it);
                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full border border-blue-100"
                        >
                          {truncate(String(label), 40)}
                        </span>
                      );
                    })}
                    {arr.length > 4 && <div className="text-xs text-slate-500">+{arr.length - 4} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const keys = Object.keys(data);
    const previews: string[] = [];
    for (const k of keys.slice(0, 4)) {
      const v = data[k];
      if (isPrimitive(v)) previews.push(`${k}: ${truncate(String(v), 40)}`);
      else if (Array.isArray(v)) previews.push(`${k}: ${v.length} items`);
      else if (typeof v === "object") previews.push(`${k}: object`);
    }
    return (
      <div className="text-sm text-slate-700">{previews.join(" · ")}{keys.length > 4 ? " · ..." : ""}</div>
    );
  }

  return <div className="text-sm text-slate-700">{String(data)}</div>;
};

export default function SectionPreview({ section }: { section: HomeSection }) {
  const raw = section.content ?? "";

  if (!raw || raw.trim().length === 0) {
    return <div className="text-gray-400">Sin contenido</div>;
  }

  const tryParseJson = (s: string) => {
    try {
      let p: any = JSON.parse(s);
      // Handle double-encoded JSON strings
      if (typeof p === "string" && (p.trim().startsWith("{") || p.trim().startsWith("["))) {
        try {
          p = JSON.parse(p);
        } catch {
          // ignore
        }
      }
      return p;
    } catch {
      return null;
    }
  };

  const parsed = tryParseJson(raw);
  if (parsed !== null) {
    if (Array.isArray(parsed)) {
      if (section.sectionKey === "about_stats" || section.sectionKey.includes("stats")) {
        return <StatsPreview items={parsed} />;
      }
      if (section.sectionKey === "about_team" || section.sectionKey.includes("team")) {
        return <TeamPreview items={parsed} />;
      }
      return <GenericJsonPreview data={parsed} />;
    }

    if (typeof parsed === "object" && parsed !== null) {
      return <GenericJsonPreview data={parsed} />;
    }
  }

  // Plain text fallback (truncate to avoid huge blobs in list)
  return <div className="text-gray-600 text-sm">{truncate(raw, 240)}</div>;
}
