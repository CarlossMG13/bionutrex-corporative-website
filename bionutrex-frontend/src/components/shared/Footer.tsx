import { Link } from "react-router-dom";
import { Mail, Speech, Facebook, MapPin, PhoneIncoming } from "lucide-react";

export default function Footer() {
  return (
    <footer className="raleway bg-[#0d40a5] text-white px-5 py-10 ">
      <div className="top-section flex flex-col space-y-10 lg:flex-row lg:justify-around [&>div]:lg:w-1/4 [&>div]:lg:px-3 lg:px-30">
        <div>
          <h3 className="playfair text-2xl pb-5">BIONUTREX</h3>
          <span className="raleway text-xs text-[#f6f6f88f]">
            Pioneros en la próxima generación de salud natural a través de
            ensayos clínicos rigurosos y fabricación ética.
          </span>
          <div className="icons pt-5 flex items-center gap-3">
            <Link to="/">
              <Facebook size={20} strokeWidth={2} />
            </Link>
            <Link to="/">
              <Mail size={20} strokeWidth={2} />
            </Link>
            <Link to="/">
              <Speech size={20} strokeWidth={2} />
            </Link>
          </div>
        </div>
        <div>
          <span className="raleway font-bold text-md">Menú</span>
          <ul className="flex flex-col space-y-2 pt-3 font-medium text-sm text-[#f6f6f88f] [&>a]:hover:text-white transition-colors duration-300">
            <Link to="/">Productos</Link>
            <Link to="/">Nosotros</Link>
            <Link to="/">Catálogo</Link>
            <Link to="/">Recursos</Link>
            <Link to="/">Blog</Link>
            <Link to="/">Contacto</Link>
          </ul>
        </div>
        <div>
          <span className="raleway font-bold text-md">Compañía</span>
          <ul className="flex flex-col space-y-2 pt-3 font-medium text-sm text-[#f6f6f88f] [&>a]:hover:text-white transition-colors duration-300">
            <Link to="/">Misión</Link>
            <Link to="/">Insfraestructura</Link>
            <Link to="/">Compromiso</Link>
            <Link to="/admin/login">Soy Colaborador</Link>
          </ul>
        </div>
        <div>
          <span className="raleway font-bold text-md">Contacto</span>
          <ul className="flex flex-col space-y-2 pt-3 pb-10 font-medium text-sm text-[#f6f6f88f]">
            <div className="flex gap-2 items-start">
              <MapPin size={20} />
              <span>
                Alacio Pérez 793, Salvador Díaz Mirón, 91700 Veracruz, Ver.
              </span>
            </div>
            <div className="flex gap-2 items-start">
              <PhoneIncoming size={20} />
              <span>+52 222 222 2222</span>
            </div>
          </ul>
        </div>
      </div>
      <div className="bottom-section text-center border-t border-[#f6f6f88f] pt-10 transition-all duration-300">
        <span className="text-xs">Powered by Bionutrex - 2026</span>
        <h1 className="text-4xl mt-2 font-bold | sm:text-7xl | md:text-8xl | lg:text-9xl">
          BIONUTREX
        </h1>
      </div>
    </footer>
  );
}

export { Footer };
