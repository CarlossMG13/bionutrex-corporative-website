import * as React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar({ isPreview = false, previewDevice }: { isPreview?: boolean; previewDevice?: 'mobile' | 'tablet' | 'desktop' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down y pasa de 100px
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    // Solo agregar el listener de scroll si no estamos en preview mode
    if (!isPreview) {
      window.addEventListener("scroll", controlNavbar);
    }

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY, isPreview]);

  // Cerrar el menú móvil cuando el tamaño de pantalla cambie a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Función para determinar si mostrar versión móvil
  const shouldShowMobile = () => {
    if (isPreview && previewDevice) {
      return previewDevice === 'mobile';
    }
    // En modo no-preview, usar media queries normales
    return false;
  };

  // Función para determinar si mostrar versión desktop
  const shouldShowDesktop = () => {
    if (isPreview && previewDevice) {
      return previewDevice === 'tablet' || previewDevice === 'desktop';
    }
    // En modo no-preview, usar media queries normales
    return false;
  };

  return (
    <>
      {/* Navbar principal */}
      <div
        className={`${isPreview ? 'relative' : 'fixed top-0 left-0 right-0 z-50'} bg-white p-5 flex items-center justify-between border border-b shadow-sm transition-transform duration-300 | lg:px-10 ${
          isVisible && !isPreview ? "translate-y-0" : isPreview ? "" : "-translate-y-full"
        }`}
      >
        {/* Logo */}
        <div className={`logo flex text-center items-center justify-center ${
          isPreview 
            ? (shouldShowMobile() ? 'order-2 flex-1' : 'order-1 flex-initial justify-start')
            : 'order-2 flex-1 | md:order-1 md:flex-initial md:justify-start'
        }`}>
          <Link to="/">
            <span className="canada font-bold text-3xl">BIONUTREX</span>
          </Link>
        </div>

        {/* Desktop navbar */}
        <nav className={`${
          isPreview
            ? (shouldShowDesktop() ? 'flex' : 'hidden')
            : 'hidden md:flex'
        } items-center raleway font-medium order-2 [&>a]:px-3 [&>a]:py-2 | md:[&>a]:text-sm | lg:[&>a]:text-md`}>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Productos
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Nosotros
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Catálogo
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Recursos
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Blog
          </Link>
        </nav>

        {/* Button Admin Desktop */}
        <div className="hidden md:flex items-center raleway font-medium space-x-9 order-3">
          <Link
            to="/"
            className="text-[#0d40a5] border px-3 py-1 rounded-full border-[#0d40a5] hover:bg-[#0d40a5] hover:text-white hover:scale-105 transition-all duration-300 | md:text-sm"
          >
            Contacto
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-center order-1">
          <button onClick={() => setIsOpen(!isOpen)} className="text-[#333]">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <>
        {/* Overlay oscuro con animación */}
        <div
          className={`${isPreview ? 'absolute' : 'fixed'} inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Sidebar con animación de deslizamiento */}
        <div
          className={`${isPreview ? 'absolute' : 'fixed'} top-0 left-0 h-full w-64 bg-[#0d40a5] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <span className="anton font-bold text-2xl text-white">MENÚ</span>
            <button onClick={() => setIsOpen(false)} className="text-white ">
              <X />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col p-5 space-y-8">
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white  transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Productos
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white  transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Recursos
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>

            {/* Botón colaborador */}
            <div className="pt-4 border-t">
              <Link
                to="/"
                className="block text-center raleway font-medium text-white border px-4 py-2 rounded-full border-white hover:bg-white hover:text-[#333] transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </nav>
        </div>
      </>
    </>
  );
}
