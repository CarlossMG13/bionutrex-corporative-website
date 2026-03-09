import type { HomeSection } from "@/types";

interface StatBadge {
  icon: string;
  value: string;
  label: string;
  description: string;
}

interface Props {
  section: HomeSection | undefined;
}

export default function AboutStats({ section }: Props) {
  if (!section) return null;

  const accent = section.accentColor ?? "#00e5ff";

  let badges: StatBadge[] = [];
  try {
    const parsed = JSON.parse(section.content);
    if (Array.isArray(parsed)) badges = parsed;
  } catch {
    badges = [];
  }

  if (badges.length === 0) return null;

  const colsClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="bg-[#0a1628] py-20 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div
          className={`grid gap-10 md:gap-12 ${colsClass[Math.min(badges.length, 4)] ?? colsClass[4]}`}
        >
          {badges.map((badge, i) => (
            <div key={i} className="text-center md:text-left space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto md:mx-0">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ color: accent }}
                >
                  {badge.icon}
                </span>
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-white italic">
                {badge.value}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {badge.label}
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
