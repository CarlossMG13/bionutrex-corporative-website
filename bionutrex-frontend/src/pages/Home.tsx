import { useHomeSections } from "@/contexts/HomeDataContext";

/* Components */
import HeroSection from "@/components/home/HeroSection";
import QualitySection from "@/components/home/QualitySection";
import MethodologySection from "@/components/home/MethodologySection";
import BlogSection from "@/components/home/BlogSection";

export default function Home() {
  const { loading, error, getSortedSections } = useHomeSections();

  if (loading) {
    return (
      <div className="home-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d40a5] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Obtener secciones ordenadas por order ascendente y alfabéticamente
  const sortedSections = getSortedSections();
  
  // Mapeo de sectionKey a componentes
  const sectionComponents = {
    hero: HeroSection,
    quality: QualitySection,
    methodology: MethodologySection,
    blog: BlogSection,
  };

  return (
    <div className="home-page">
      {/* Renderizar secciones según su orden */}
      {sortedSections.map((section) => {
        const SectionComponent = sectionComponents[section.sectionKey as keyof typeof sectionComponents];
        
        // Solo renderizar si existe el componente para esa sectionKey
        if (SectionComponent) {
          return <SectionComponent key={section.id} />;
        }
        
        return null;
      })}
    </div>
  );
}
