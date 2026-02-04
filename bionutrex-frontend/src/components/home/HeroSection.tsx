import React from "react";
import { Link } from "react-router-dom";
import { useHomeSections } from "@/contexts/HomeDataContext";
import HeroSectionImg from "../../assets/images/heroSection-img.jpg";

export default function HeroSection() {
  const { getSectionByKey, getActiveSliders } = useHomeSections();
  
  const heroSection = getSectionByKey('hero');
  const sliders = getActiveSliders();
  
  // Prioridad de imagen de fondo: 
  // 1. Imagen configurada en la sección
  // 2. Primer slider activo
  // 3. Imagen por defecto
  const backgroundImage = (
    heroSection?.images?.[0]?.url ||
    heroSection?.imageUrl ||
    (sliders.length > 0 && sliders[0].imageUrl) ||
    HeroSectionImg
  );
  
  const imageAlt = heroSection?.images?.[0]?.alt || "Hero background";

  // Contenido por defecto si no hay datos de la API
  const title = heroSection?.title || "Ciencia Avanzada. Pureza Natural.";
  const content = heroSection?.content || "Liderando el futuro de la biotecnología con suplementos naturales de alta potencia y estándares de fabricación de grado farmacéutico.";
  const subtitle = heroSection?.subtitle;

  return (
    <section className="main h-screen min-h-[700px] max-h-[900px] relative flex items-center justify-center w-full overflow-hidden z-0">
      {/* Imagen Background */}
      <img
        className="absolute inset-0 z-10 h-full w-full object-cover"
        src={backgroundImage}
        alt={imageAlt}
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-20 bg-black/40" />
      {/* Contenido */}
      <div className="absolute z-30 flex flex-col items-start justify-center px-4 sm:px-6 md:px-8 lg:px-12 w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-4xl space-y-4 sm:space-y-6 md:space-y-8">
        <h3 className="playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white leading-tight">
          {title.split('.').map((part, index, array) => (
            <React.Fragment key={index}>
              {part.trim()}
              {index < array.length - 1 && '.'} 
              {index === 0 && <br />}
            </React.Fragment>
          ))}
        </h3>
        <p className="raleway text-sm font-light sm:text-base md:text-md text-white/90">
          {subtitle || content}
        </p>
        <div className="buttons raleway flex flex-col sm:flex-row gap-3 sm:gap-4 w-full items-stretch sm:items-center sm:justify-start mt-4">
          <Link
            to="/blog"
            className="text-[#0d40a5] text-center text-sm font-semibold bg-white rounded-md hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-4 py-3 sm:px-5 sm:py-3 w-full sm:w-auto sm:min-w-[180px] whitespace-nowrap"
          >
            Explorar nuestro Blog
          </Link>
          <Link
            to="/about"
            className="text-white text-center font-semibold rounded-md bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 px-4 py-3 sm:px-5 sm:py-3 w-full sm:w-auto sm:min-w-[180px] whitespace-nowrap"
          >
            Ver Líneas de Producto
          </Link>
        </div>
      </div>
    </section>
  );
}
