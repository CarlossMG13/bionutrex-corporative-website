import * as React from "react";
import FirstImageGrid from "@/assets/images/img1-grid-product.jpg";
import SecondImageGrid from "@/assets/images/img2-grid-product.jpg";
import ThirdImageGrid from "@/assets/images/img3-grid-product.jpg";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function BlogSection() {
  return (
    <div className="py-20 flex flex-col max-w-300 mx-auto px-6">
      <div className="header-section text-start sm:text-center flex items-start sm:items-center justify-center flex-col space-y-2">
        <h2 className="playfair text-[#0d40a5] text-3xl font-serif-title">
          Líneas de Productos Core
        </h2>
        <p className="raleway text-[#0d40a5] max-w-lg mt-4 md:mt-0">
          Explore nuestra gama de suplementos clínicamente validados, diseñados
          para profesionales de la salud e individuos conscientes de su
          bienestar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 raleway">
        <div className="group cursor-pointer">
          <div className="aspect-square bg-ice-gray rounded-xl mb-6 overflow-hidden relative">
            <img
              alt="Cellular health supplements"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={FirstImageGrid}
            />
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            Regeneración Celular
          </h3>
          <p className="text-steel-blue text-sm mb-4 leading-relaxed text-[#0d40a5]">
            Precursores avanzados de NAD+ y fórmulas de apoyo mitocondrial para
            la longevidad y energía.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0d40a5] font-bold text-sm uppercase tracking-wider "
          >
            Saber más
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="group cursor-pointer">
          <div className="aspect-square bg-ice-gray rounded-xl mb-6 overflow-hidden relative">
            <img
              alt="Immune support research"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={SecondImageGrid}
            />
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            Modulación Inmune
          </h3>
          <p className="text-steel-blue text-sm mb-4 leading-relaxed text-[#0d40a5]">
            Polisacáridos derivados de hongos y complejos de ionóforos de zinc
            para la defensa estacional.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0d40a5] font-bold text-sm uppercase tracking-wider "
          >
            Saber más
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="group cursor-pointer">
          <div className="aspect-square bg-ice-gray rounded-xl mb-6 overflow-hidden relative">
            <img
              alt="Botanical extracts"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={ThirdImageGrid}
            />
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            Rendimiento Cognitivo
          </h3>
          <p className="text-steel-blue text-sm mb-4 leading-relaxed text-[#0d40a5]">
            Stacks nootrópicos con Bacopa Monnieri y extractos estandarizados de
            Melena de León.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#0d40a5] font-bold text-sm uppercase tracking-wider "
          >
            Saber más
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
