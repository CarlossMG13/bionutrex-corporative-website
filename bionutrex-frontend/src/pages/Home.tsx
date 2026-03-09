import { useHomeSections } from "@/contexts/HomeDataContext";

/* Components */
import VideoHeroSection from "@/components/home/VideoHeroSection";
import QualitySection from "@/components/home/BestSellersSection";
import MethodologySection from "@/components/home/CategorySection";
import TrainerSection from "@/components/home/TrainerSection";

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

  const sortedSections = getSortedSections();

  // Componentes que se renderizan por sección del CMS (sin hero)
  const sectionComponents: Record<string, React.ComponentType> = {
    quality: QualitySection,
    methodology: MethodologySection,
    blog: TrainerSection,
  };

  return (
    <main className="home-page w-full overflow-x-hidden min-h-screen">
      <div className="flex flex-col">
        <VideoHeroSection />

        {/* Resto de secciones dinámicas desde el CMS */}
        {sortedSections.map((section) => {
          const SectionComponent = sectionComponents[section.sectionKey];
          if (SectionComponent) {
            return <SectionComponent key={section.id} />;
          }
          return null;
        })}
      </div>
    </main>
  );
}
