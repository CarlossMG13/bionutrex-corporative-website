import { Link } from "react-router-dom";
import footerVideo from "@/assets/videos/footer-video.webm";

export default function Footer() {
  return (
    <footer className="raleway bg-[#1e1e1e] text-white px-5 pt-10">
      <div className="top-section gap-10 flex flex-col | lg:flex-row lg:pb-10 lg:justify-around">
        <div className="video min-h-50 w-full lg:max-w-160 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={footerVideo} type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
        </div>
        <div className="links font-bold flex flex-col gap-15 pb-10 | lg:flex-row">
          <div>
            <span className="text-md text-xl text-[#0062D3]">MENÚ</span>
            <nav className="text-2xl text-[#c5c5c5] pt-5 space-y-3 flex flex-col [&>a]:hover:text-white transition-all duration-300 | md:text-4xl | lg:text-2xl">
              <Link to="/">INICIO</Link>
              <Link to="/about">NOSOTROS</Link>
              <Link to="/products">PRODUCTOS</Link>
              <Link to="/blog">BLOG</Link>
              <Link to="/">SOY COLABORADOR</Link>
            </nav>
          </div>
          <div>
            <span className="text-md text-xl text-[#0062D3]">CONTACTO</span>
            <nav className="text-2xl text-[#c5c5c5] pt-5 space-y-3 flex flex-col [&>a]:hover:text-white transition-all duration-300 | md:text-4xl | lg:text-2xl">
              <Link to="/">+52 55 5555 5555</Link>
              <Link to="/about">INFO@BIONUTREX.COM</Link>
              <span>12/a, new bustin tower NYC, US</span>
            </nav>
          </div>
        </div>
      </div>
      <div className="bottom-section text-center border-t border-[#333] p-10 transition-all duration-300">
        <span className="text-xs">Powered by Bionutrex - 2026</span>
        <h1 className="text-4xl mt-2 font-bold | sm:text-7xl | md:text-8xl | lg:text-9xl">
          BIONUTREX
        </h1>
      </div>
    </footer>
  );
}

export { Footer };
