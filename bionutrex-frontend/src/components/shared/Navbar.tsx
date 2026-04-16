import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, Search, User, ShoppingCart, LogOut, Package } from "lucide-react";
import { NavMegaMenu } from "./NavMegaMenu";
import { useCart } from "@/contexts/CartContext";
import { useAuthUser } from "@/contexts/AuthUserContext";

// ─── UserButton ───────────────────────────────────────────────────────────────
function UserButton({ className = "" }: { className?: string }) {
  const { user, loading, openAuth, logout, isAuthOpen } = useAuthUser();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className={`w-8 h-8 rounded-full bg-white/10 animate-pulse ${className}`} />
    );
  }

  // Sin sesión → abre el AuthDrawer
  if (!user) {
    return (
      <button
        onClick={openAuth}
        aria-label="Iniciar sesión"
        className={`text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer ${
          isAuthOpen ? "text-[#00e5ff]" : ""
        } ${className}`}
      >
        <User className="w-5 h-5" />
      </button>
    );
  }

  // Con sesión → iniciales + dropdown
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative ${className}`} ref={dropRef}>
      <button
        onClick={() => setDropOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-[#0d40a5] flex items-center justify-center
                   text-white font-black text-xs hover:bg-[#0d40a5]/80 transition-colors cursor-pointer"
        aria-label="Menú de cuenta"
      >
        {initials}
      </button>

      {dropOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl
                        border border-gray-100 overflow-hidden z-[60]">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-black text-gray-900 truncate">
              {user.name ?? "Mi cuenta"}
            </p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setDropOpen(false); navigate("/perfil?tab=datos"); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600
                       hover:bg-gray-50 hover:text-[#0d40a5] transition-colors cursor-pointer"
          >
            <User className="w-4 h-4" />
            Mi perfil
          </button>
          <button
            onClick={() => { setDropOpen(false); navigate("/perfil"); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600
                       hover:bg-gray-50 hover:text-[#0d40a5] transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Mis pedidos
          </button>
          <button
            onClick={() => { logout(); setDropOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600
                       hover:bg-red-50 hover:text-red-500 transition-colors border-t border-gray-100 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar({
  isPreview = false,
  previewDevice,
}: {
  isPreview?: boolean;
  previewDevice?: "mobile" | "tablet" | "desktop";
}) {
  const { toggleCart, cartCount } = useCart();
  const { user, openAuth } = useAuthUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

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
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    if (!isPreview) {
      window.addEventListener("scroll", controlNavbar, { passive: true });
    }
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [isPreview]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const handleCuentaClick = () => {
    setIsOpen(false);
    if (user) {
      navigate("/perfil");
    } else {
      openAuth();
    }
  };

  return (
    <>
      <header
        style={{
          transform: isVisible || isPreview ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease-out",
        }}
        className={`${
          isPreview ? "relative" : "fixed top-0 left-0 right-0 z-50"
        } bg-white/90 backdrop-blur-md border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 lg:h-20">
          {/* ── Mobile (< lg): grid 3 columnas ── */}
          <div className="grid grid-cols-3 items-center h-full lg:hidden">
            {/* Col izq: Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-[#0d40a5] transition-colors justify-self-start cursor-pointer"
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
              <button className="text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={toggleCart} className="relative text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0d40a5] text-white text-[9px] font-black px-1.5 rounded-full leading-4">
                    {cartCount}
                  </span>
                )}
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
              <UserButton />
              <button onClick={toggleCart} className="relative text-slate-600 hover:text-[#00e5ff] transition-colors cursor-pointer">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0d40a5] text-white text-[9px] font-black px-1.5 rounded-full leading-4">
                    {cartCount}
                  </span>
                )}
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

      {/* Mobile menu */}

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease-out",
        }}
        className={`${isPreview ? "absolute" : "fixed"} inset-0 bg-black/50 z-40 lg:hidden`}
      />

      {/* Sidebar */}
      <div
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s ease-out",
        }}
        className={`${isPreview ? "absolute" : "fixed"} top-0 left-0 h-full w-72 bg-[#0d40a5] shadow-2xl z-50 lg:hidden`}
        aria-hidden={!isOpen}
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
            className="text-white hover:text-[#00e5ff] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col p-6 space-y-6">
          {[
            { label: "Nosotros", to: "/about" },
            { label: "Productos", to: "/products" },
            { label: "Categorías", to: "/categories" },
            { label: "Recursos", to: "/resources" },
            { label: "Blog", to: "/blog" },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
                transitionDelay: isOpen ? `${0.08 + i * 0.05}s` : "0s",
              }}
            >
              <Link
                to={item.to}
                className="text-white font-extrabold text-xl tracking-widest uppercase hover:text-[#00e5ff] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </div>
          ))}

          <div
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateX(0)" : "translateX(-16px)",
              transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
              transitionDelay: isOpen ? "0.38s" : "0s",
            }}
          >
            <button
              onClick={handleCuentaClick}
              className="text-white font-extrabold text-xl tracking-widest uppercase hover:text-[#00e5ff] transition-colors text-left cursor-pointer"
            >
              Cuenta
            </button>
          </div>

          <div
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateX(0)" : "translateX(-16px)",
              transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
              transitionDelay: isOpen ? "0.43s" : "0s",
            }}
            className="pt-6 border-t border-white/20 flex items-center gap-6"
          >
            <button
              onClick={toggleCart}
              className="text-white hover:text-[#00e5ff] transition-colors flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              Carrito
              {cartCount > 0 && (
                <span className="bg-[#00e5ff] text-[#0d40a5] text-[9px] font-black px-1.5 rounded-full leading-4">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
