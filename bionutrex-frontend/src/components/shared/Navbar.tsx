import * as React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navbar principal */}
      <div className="p-5 flex items-center justify-between | lg:px-10">
        {/* Logo */}
        <div className="logo flex text-center items-center justify-center order-2 flex-1 | md:order-1 md:flex-initial md:justify-start">
          <Link to="/">
            <span className="anton font-bold text-3xl">BIONUTREX</span>
          </Link>
        </div>

        {/* Desktop navbar */}
        <nav className="hidden md:flex items-center raleway font-medium order-2 [&>a]:px-3 [&>a]:py-2  lg:[&>a]:text-md">
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
            Productos
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Blog
          </Link>
          <Link
            to="/"
            className="text-[#333] hover:bg-[#e2e2e2] rounded-sm transition-colors duration-300"
          >
            Contacto
          </Link>
        </nav>

        {/* Button Admin Desktop */}
        <div className="hidden md:flex items-center raleway font-medium space-x-9 order-3">
          <Link
            to="/"
            className="text-[#333] border px-3 py-1 rounded-full border-[#333] hover:bg-[#333] hover:text-white transition-colors duration-300 | lg:text-md"
          >
            Soy colaborador
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-center order-1">
          <button onClick={() => setIsOpen(!isOpen)} className="text-[#333]">
            <Menu className="h-8 w-8" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <>
        {/* Overlay oscuro con animación */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Sidebar con animación de deslizamiento */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-[#333] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
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
              Inicio
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
              Productos
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/"
              className="raleway font-medium text-2xl text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>

            {/* Botón colaborador */}
            <div className="pt-4 border-t">
              <Link
                to="/"
                className="block text-center raleway font-medium text-white border px-4 py-2 rounded-full border-white hover:bg-white hover:text-[#333] transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Soy colaborador
              </Link>
            </div>
          </nav>
        </div>
      </>
    </>
  );
}
