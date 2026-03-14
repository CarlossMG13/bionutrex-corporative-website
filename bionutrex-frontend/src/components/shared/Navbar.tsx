import * as React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, Search, User, ShoppingCart } from "lucide-react";
import { NavMegaMenu } from "./NavMegaMenu";

export function Navbar({
  isPreview = false,
  previewDevice,
}: {
  isPreview?: boolean;
  previewDevice?: "mobile" | "tablet" | "desktop";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = (item: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(item);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    if (!isPreview) {
      window.addEventListener("scroll", controlNavbar);
    }
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, isPreview]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <>
      <header
        className={`${
          isPreview ? "relative" : "fixed top-0 left-0 right-0 z-50"
        } bg-white/90 backdrop-blur-md border-b border-slate-100 transition-transform duration-300 ${
          isVisible || isPreview ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 lg:h-20">
          {/* ── Mobile (< lg): grid 3 columnas ── */}
          <div className="grid grid-cols-3 items-center h-full lg:hidden">
            {/* Col izq: Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-[#0d40a5] transition-colors justify-self-start"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Col centro: Logo exactamente centrado */}
            <Link to="/" className="flex items-center justify-center gap-1.5">
              <Zap className="w-6 h-6 text-[#00e5ff] fill-[#00e5ff]" />
              <span className="text-xl font-black tracking-tighter uppercase italic text-black">
                Bionutrex
              </span>
            </Link>

            {/* Col der: Search + Cart */}
            <div className="flex items-center justify-end gap-4">
              <button className="text-slate-600 hover:text-[#00e5ff] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="relative text-slate-600 hover:text-[#00e5ff] transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#0d40a5] text-white text-[9px] font-black px-1.5 rounded-full leading-4">
                  2
                </span>
              </button>
            </div>
          </div>

          {/* ── Desktop (≥ lg): flex original ── */}
          <div className="hidden lg:flex items-center justify-between h-full">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8 lg:gap-16">
              <Link to="/" className="flex items-center gap-2">
                <Zap className="w-7 h-7 text-[#00e5ff] fill-[#00e5ff]" />
                <span className="text-2xl font-black tracking-tighter uppercase italic text-black">
                  Bionutrex
                </span>
              </Link>

              <nav
                className="flex items-center gap-5 xl:gap-8 text-[11px] font-extrabold tracking-[0.2em] uppercase"
                onMouseLeave={scheduleClose}
              >
                <Link
                  to="/about"
                  className="text-slate-500 hover:text-[#0d40a5] transition-colors"
                  onMouseEnter={() => openMenu("nosotros")}
                >
                  Nosotros
                </Link>
                <Link
                  to="/products"
                  className="text-slate-500 hover:text-[#0d40a5] transition-colors"
                  onMouseEnter={() => openMenu("productos")}
                >
                  Productos
                </Link>
                <Link
                  to="/categories"
                  className="text-slate-500 hover:text-[#0d40a5] transition-colors"
                  onMouseEnter={() => openMenu("categorias")}
                >
                  Categorías
                </Link>
                <Link
                  to="/resources"
                  className="text-slate-500 hover:text-[#0d40a5] transition-colors"
                  onMouseEnter={() => openMenu("recursos")}
                >
                  Recursos
                </Link>
                <Link
                  to="/"
                  className="text-slate-500 hover:text-[#0d40a5] transition-colors"
                  onMouseEnter={() => openMenu("blog")}
                >
                  Blog
                </Link>
              </nav>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-5">
              <button className="text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <User className="w-5 h-5" />
              </button>
              <button className="relative text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-[#0d40a5] text-white text-[9px] font-black px-1.5 rounded-full leading-4">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
        <NavMegaMenu
          activeItem={activeMenu}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      </header>

      {/* Overlay mobile */}
      <div
        className={`${isPreview ? "absolute" : "fixed"} inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar mobile */}
      <div
        className={`${isPreview ? "absolute" : "fixed"} top-0 left-0 h-full w-72 bg-[#0d40a5] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#00e5ff] fill-[#00e5ff]" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-white">
              Bionutrex
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-[#00e5ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col p-6 space-y-6">
          {[
            { label: "Nosotros", to: "/About" },
            { label: "Productos", to: "/Products" },
            { label: "Protein Hub", to: "/" },
            { label: "Performance", to: "/" },
            { label: "Blog", to: "/blog" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-white font-extrabold text-xl tracking-widest uppercase hover:text-[#00e5ff] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-6 border-t border-white/20 flex items-center gap-6">
            <button className="text-white hover:text-[#00e5ff] transition-colors flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase">
              <User className="w-5 h-5" />
              Account
            </button>
            <button className="text-white hover:text-[#00e5ff] transition-colors flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase">
              <ShoppingCart className="w-5 h-5" />
              Cart
              <span className="bg-[#00e5ff] text-[#0d40a5] text-[9px] font-black px-1.5 rounded-full leading-4">
                2
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
