import { useEffect, useRef, useState } from "react";
import type { HomeSection, TitleSegment } from "@/types";

interface Props {
  section: HomeSection | undefined;
}

export default function AboutMission({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";

  let segments: TitleSegment[] = [];
  try {
    if (section.titleSegments) {
      const parsed = JSON.parse(section.titleSegments);
      if (Array.isArray(parsed)) segments = parsed;
    }
  } catch {
    /* noop */
  }

  if (segments.length === 0) {
    segments = [{ text: section.content ?? "" }];
  }

  const fullText = segments.map((s) => s.text).join("");
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || displayed >= fullText.length) return;
    const t = setTimeout(() => setDisplayed((d) => d + 1), 16);
    return () => clearTimeout(t);
  }, [started, displayed, fullText.length]);

  // Renderizar segmentos con animación de escritura
  let charCount = 0;
  const rendered = segments.map((seg, i) => {
    const start = charCount;
    charCount += seg.text.length;
    const visible = seg.text.slice(0, Math.max(0, displayed - start));
    if (!visible) return null;
    const color = seg.color === "accent" ? accent : (seg.color ?? "inherit");
    return (
      <span key={i} style={{ color }}>
        {visible}
      </span>
    );
  });

  return (
    <section ref={ref} className="bg-slate-100 py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-5xl">
          {section.subtitle && (
            <span
              className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 block"
              style={{ color: accent }}
            >
              {section.subtitle}
            </span>
          )}

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0a1628] uppercase italic leading-[1.1] min-h-[2em]">
            {rendered}
            {displayed < fullText.length && (
              <span className="animate-pulse" style={{ color: accent }}>
                |
              </span>
            )}
          </h2>

          {section.buttonText && (
            <div className="mt-12 md:mt-16 flex items-center gap-6">
              <div className="h-px bg-slate-200 flex-grow" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] shrink-0">
                {section.buttonText}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
