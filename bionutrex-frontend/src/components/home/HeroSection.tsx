import React from "react";
import { Link } from "react-router-dom";
import { useHomeSections } from "@/hooks/useHomeSections";
import HeroSectionImg from "../../assets/images/heroSection-img.jpg";

export default function HeroSection() {
  const { getSectionByKey, getActiveSliders } = useHomeSections();
  
  const heroSection = getSectionByKey('hero');
  const sliders = getActiveSliders();
  
  // Usar el primer slider como imagen de fondo si hay sliders disponibles
  const backgroundImage = sliders.length > 0 && sliders[0].imageUrl 
    ? sliders[0].imageUrl 
    : HeroSectionImg;

  // Contenido por defecto si no hay datos de la API
  const title = heroSection?.title || "Ciencia Avanzada. Pureza Natural.";
  const content = heroSection?.content || "Liderando el futuro de la biotecnología con suplementos naturales de alta potencia y estándares de fabricación de grado farmacéutico.";
  const subtitle = heroSection?.subtitle;

  return (
    <section className="main h-150 relative flex items-center justify-center">
      {/* Imagen Background */}
      <img
        className="absolute inset-0 z-10 h-full w-full object-cover"
        src={backgroundImage}
        alt="Hero background"
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-20 bg-black/40" />
      {/* Contenido */}
      <div className="absolute z-30 flex flex-col items-start justify-center px-4 sm:px-6 md:px-8 lg:px-12 max-w-md sm:max-w-md md:max-w-lg lg:max-w-2xl space-y-8">
        <h3 className="playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
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
        <div className="buttons raleway flex flex-col md:flex-row gap-5  w-full items-center justify-center [&>a]:px-5 [&>a]:py-3">
          <Link
            to="/blog"
            className="text-[#0d40a5] text-center text-sm font-semibold bg-white rounded-md hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto md:min-w-62.5"
          >
            Explorar nuestro Blog
          </Link>
          <Link
            to="/about"
            className="text-white text-center font-semibold rounded-md bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 w-full md:w-auto min-w-62.5"
          >
            Ver Líneas de Producto
          </Link>
        </div>
      </div>
    </section>
  );
}
