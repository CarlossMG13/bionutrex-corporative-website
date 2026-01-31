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
    <div className="main my-20 flex flex-col max-w-300 mx-auto px-6">
      <div className="flex flex-col w-full md:flex-row md:items-center justify-between mb-12 border-b border-ice-gray pb-8">
        <div>
          <span className="raleway text-[#0d40a5] font-bold uppercase tracking-widest text-xs mb-2 block">
            {sectionSubtitle}
          </span>
          <h2 className="playfair text-[#0d40a5] text-4xl font-serif-title">
            {sectionTitle}
          </h2>
        </div>
        <p className="raleway text-[#0d40a5] max-w-md mt-4 md:mt-0">
          {sectionContent}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="flex flex-col gap-4 p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <ShieldCheck className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">ISO 9001:2015</h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Estándar global para sistemas de gestión de calidad.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
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
        <div className="flex flex-col gap-4 p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
          <GlobeLock className="text-[#0d40a5] text-4xl group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="raleway font-bold text-lg mb-1">Registro FDA</h3>
            <p className="raleway text-sm font-medium text-[#0d40a5]">
              Instalaciones de producción totalmente registradas y auditadas.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-8 rounded-xl bg-[#f6f6f8] border border-transparent hover:border-primary/20 transition-all group">
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
    </div>
  );
}
