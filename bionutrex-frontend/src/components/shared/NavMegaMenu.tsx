import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  loadNavMenu,
  type NavMenuSection,
  type NavFeatured,
} from "@/data/navMenuData";

interface NavMegaMenuProps {
  activeItem: string | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const gridColsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

function FeaturedCard({ item }: { item: NavFeatured }) {
  return (
    <div className="relative rounded-xl overflow-hidden h-52 bg-slate-200">
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#00e5ff] mb-1">
          {item.badge}
        </span>
        <h3 className="text-base font-black uppercase italic text-white leading-tight mb-1">
          {item.title}
        </h3>
        <p className="text-xs text-white/70 mb-3">{item.description}</p>
        <Link
          to={item.href}
          className="self-start px-4 py-1.5 bg-[#0d40a5] text-white text-[10px] font-extrabold tracking-widest uppercase rounded hover:bg-[#0d40a5]/80 transition-colors"
        >
          {item.cta}
        </Link>
      </div>
    </div>
  );
}

export function NavMegaMenu({
  activeItem,
  onMouseEnter,
  onMouseLeave,
}: NavMegaMenuProps) {
  const [menuData, setMenuData] = useState<NavMenuSection[]>([]);

  useEffect(() => {
    setMenuData(loadNavMenu());
  }, []);

  const section = menuData.find((s) => s.key === activeItem) ?? null;
  const featuredCount = Math.min(section?.featured.length ?? 1, 3);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute left-0 right-0 top-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg transition-opacity duration-300 ${
        activeItem
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {section && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-[260px_1fr] gap-10">
            {/* LEFT — índice de subcategorías */}
            <div className="space-y-0.5 border-r border-slate-100 pr-8">
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-400 uppercase px-3 mb-3">
                {section.label}
              </p>
              {section.subcategories.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-extrabold tracking-wide text-slate-800 group-hover:text-[#0d40a5] transition-colors uppercase">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-400 font-normal normal-case">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>

            {/* RIGHT — grid de destacados (1, 2 o 3 tarjetas) */}
            <div
              className={`grid ${gridColsClass[featuredCount] ?? "grid-cols-1"} gap-4`}
            >
              {section.featured.slice(0, 3).map((feat, i) => (
                <FeaturedCard key={i} item={feat} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
