import FirstImageGrid from "@/assets/images/img1-grid-product.jpg";
import SecondImageGrid from "@/assets/images/img2-grid-product.jpg";
import ThirdImageGrid from "@/assets/images/img3-grid-product.jpg";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHomeSections } from "@/contexts/HomeDataContext";

export default function BlogSection() {
  const { getSectionByKey } = useHomeSections();
  
  const blogSection = getSectionByKey('blog');
  
  // Contenido dinámico o por defecto
  const sectionTitle = blogSection?.title || "Líneas de Productos Core";
  const sectionContent = blogSection?.content || "Explore nuestra gama de suplementos clínicamente validados, diseñados para profesionales de la salud e individuos conscientes de su bienestar.";
  const sectionSubtitle = blogSection?.subtitle;
  
  // Imágenes configurables con fallback a las imágenes por defecto
  const productImages = [
    blogSection?.images?.[0]?.url || FirstImageGrid,
    blogSection?.images?.[1]?.url || SecondImageGrid, 
    blogSection?.images?.[2]?.url || ThirdImageGrid
  ];
  
  const productAlts = [
    blogSection?.images?.[0]?.alt || "Cellular health supplements",
    blogSection?.images?.[1]?.alt || "Immune support research", 
    blogSection?.images?.[2]?.alt || "Botanical extracts"
  ];
  
  // Productos con contenido configurable
  const products = [
    {
      title: "Regeneración Celular",
      description: "Precursores avanzados de NAD+ y fórmulas de apoyo mitocondrial para la longevidad y energía.",
      image: productImages[0],
      alt: productAlts[0]
    },
    {
      title: "Modulación Inmune", 
      description: "Polisacáridos derivados de hongos y complejos de ionóforos de zinc para la defensa estacional.",
      image: productImages[1],
      alt: productAlts[1]
    },
    {
      title: "Rendimiento Cognitivo",
      description: "Stacks nootrópicos con Bacopa Monnieri y extractos estandarizados de Melena de León.",
      image: productImages[2],
      alt: productAlts[2]
    }
  ];

  return (
    <section className="py-16 sm:py-20 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-white relative z-30">
      <div className="header-section text-start sm:text-center flex items-start sm:items-center justify-center flex-col space-y-2 mb-8 sm:mb-10">
        {sectionSubtitle && (
          <span className="raleway text-[#0d40a5] font-bold uppercase tracking-widest text-xs mb-2 block">
            {sectionSubtitle}
          </span>
        )}
        <h2 className="playfair text-[#0d40a5] text-2xl sm:text-3xl md:text-4xl font-serif-title">
          {sectionTitle}
        </h2>
        <p className="raleway text-[#0d40a5] max-w-lg mt-4 md:mt-0 text-sm sm:text-base">
          {sectionContent}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-8 sm:py-10 raleway">
        {products.map((product, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-square bg-ice-gray rounded-xl mb-6 overflow-hidden relative">
              <img
                alt={product.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={product.image}
              />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <p className="text-steel-blue text-sm mb-4 leading-relaxed text-[#0d40a5]">
              {product.description}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#0d40a5] font-bold text-sm uppercase tracking-wider"
            >
              Saber más
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
