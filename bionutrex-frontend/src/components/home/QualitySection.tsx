import { ShieldCheck, ShieldPlus, GlobeLock, CircleStar } from "lucide-react";
import { useHomeSections } from "@/contexts/HomeDataContext";

export default function QualitySection() {
  const { getSectionByKey } = useHomeSections();
  
  const qualitySection = getSectionByKey('quality');
  
  // Contenido dinámico o por defecto
  const sectionTitle = qualitySection?.title || "Certificaciones Industriales";
  const sectionContent = qualitySection?.content || "Nuestras instalaciones superan los requisitos regulatorios globales para la fabricación, prueba y distribución de extractos biológicos.";
  const sectionSubtitle = qualitySection?.subtitle || "Estándares de Calidad";

  return (
    <section className="main py-16 sm:py-20 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-white relative z-10">
      <div className="flex flex-col w-full lg:flex-row lg:items-center justify-between mb-8 sm:mb-12 border-b border-ice-gray pb-6 sm:pb-8">
        <div className="mb-4 lg:mb-0">
          <span className="raleway text-[#0d40a5] font-bold uppercase tracking-widest text-xs mb-2 block">
            {sectionSubtitle}
          </span>
          <h2 className="playfair text-[#0d40a5] text-2xl sm:text-3xl md:text-4xl font-serif-title">
            {sectionTitle}
          </h2>
        </div>
        <p className="raleway text-[#0d40a5] max-w-md mt-4 lg:mt-0 text-sm sm:text-base">
          {sectionContent}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <ShieldCheck className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">ISO 9001:2015</h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Estándar global para sistemas de gestión de calidad.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <ShieldPlus className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">
              Certificación GMP
            </h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Adherencia estricta a buenas Prácticas de Manufactura.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <GlobeLock className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">Registro FDA</h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Instalaciones de producción totalmente registradas y auditadas.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <CircleStar className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">
              Pureza Garantizada
            </h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Pruebas de laboratorio extremas para metales pesados y toxinas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
