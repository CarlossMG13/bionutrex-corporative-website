import { useHomeSections } from "@/contexts/HomeDataContext";

export default function MethodologySection() {
  const { getSectionByKey } = useHomeSections();
  
  const methodologySection = getSectionByKey('methodology');
  
  // Contenido dinámico o por defecto
  const sectionTitle = methodologySection?.title || "Manufactura guíada por la ciencia";
  const sectionContent = methodologySection?.content || "Controlamos toda la cadena de suministro, desde la selección del cultivar específico de ingredientes botánicos hasta la encapsulación molecular final.";
  const sectionSubtitle = methodologySection?.subtitle || "Nuestra metodología";
  
  // Imagen configurable
  const mainImage = methodologySection?.images?.[0]?.url || methodologySection?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBK9y955Ko1Nefm9TJwmPBX1KfmDtPe-CJnpqoRL600xNDWCsT3Sez7XbBaq2y1U0EMgEQT5qCjcJsDuhkpg-suJSmnyonuBaOK64xYvKr2SoJbqQh-Xa7H2UDdu0TukJoXh2L9W1wUZJzwjW1QutdpZLGvekN52aPk2MllgWy9T3xOD6kTIqXj4tMjbduDsgi8ZAexkyB6wKwkaZELHrD491RAbgsM5T8jOvxeUzad7YfyhZXIUFnbjamttApQAYxKPEvpAJanLEE";
  const imageAlt = methodologySection?.images?.[0]?.alt || "Pharmaceutical scientist working in cleanroom";

  return (
    <section className="bg-[#f6f6f8] py-16 sm:py-20 w-full overflow-x-hidden relative z-20 mb-8 sm:mb-16">
      <div className="flex flex-col lg:flex-row lg:gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex flex-col">
          <div className="title-section">
            <span className="raleway text-[#0d40a5] font-bold uppercase tracking-widest text-xs mb-2 block">
              {sectionSubtitle}
            </span>
            <h2 className="playfair text-[#0d40a5] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif-title py-2 leading-tight">
              {sectionTitle}
            </h2>
            <p className="raleway text-[#0d40a5] max-w-md mt-4 md:mt-0 text-sm sm:text-base">
              {sectionContent}
            </p>
          </div>
          <div className="space-y-8 sm:space-y-12 relative raleway mt-8 sm:mt-10 pb-10">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[#0d40a5]/20"></div>
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#0d40a5] text-white flex items-center justify-center font-bold z-10">
                1
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2">Abastecimiento Ético</h4>
              <p className="text-[#0d40a5]">
                Alianzas directas con cultivadores orgánicos que aseguran la
                potencia y sostenibilidad de la materia prima.
              </p>
            </div>
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#0d40a5] text-white flex items-center justify-center font-bold z-10">
                2
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2">Extracción Molecular</h4>
              <p className="text-[#0d40a5]">
                Métodos de prensado en frío y extracción por CO2 que preservan
                los perfiles fitoquímicos delicados.
              </p>
            </div>
            <div className="relative pl-12">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#0d40a5] text-white flex items-center justify-center font-bold z-10">
                3
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2">Síntesis Clínica</h4>
              <p className="text-[#0d40a5]">
                Formulación en salas limpias estériles utilizando tecnología
                avanzada de mezcla farmacéutica.
              </p>
            </div>
          </div>
        </div>
        {/* Right */}
        <div className="mt-8 lg:mt-0 lg:flex-shrink-0 lg:w-1/2">
          <div className="relative">
            <div className="aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto lg:max-w-none">
              <img
                alt={imageAlt}
                className="w-full h-full object-cover"
                data-alt="Professional scientist in sterile white lab environment"
                src={mainImage}
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-xl shadow-xl max-w-xs hidden lg:block border-l-4 border-[#0d40a5]">
              <p className="italic text-[#0d40a5] font-serif-title text-lg">
                "La intersección entre la biología molecular y la herbología
                tradicional es donde encontramos la verdadera sanación."
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#0d40a5]">
                — Dr. Aris Thorne, CSO
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
