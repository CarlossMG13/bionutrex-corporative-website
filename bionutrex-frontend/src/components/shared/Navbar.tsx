import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                BIONUTREX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Productos
            </Link>
            <Link
              to="/blog"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Blog
            </Link>
            <Link
              to="/contacto"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Contacto
            </Link>
            <Button>Tienda</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/productos"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Productos
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/contacto"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export { Navbar };
