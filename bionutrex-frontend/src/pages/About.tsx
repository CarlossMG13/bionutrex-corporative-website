import { useHomeSections } from "@/contexts/HomeDataContext";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import AboutStats from "@/components/about/AboutStats";
import AboutFacilities from "@/components/about/AboutFacilities";
import AboutTeam from "@/components/about/AboutTeam";
import AboutMission from "@/components/about/AboutMission";

export default function About() {
  const { loading, error, getSectionByKey } = useHomeSections();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d40a5] mx-auto mb-4" />
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <main className="about-page w-full overflow-x-hidden min-h-screen">
      <div className="flex flex-col">
        <AboutHero section={getSectionByKey("about_hero")} />
        <AboutStory section={getSectionByKey("about_story")} />
        <AboutStats section={getSectionByKey("about_stats")} />
        <AboutFacilities section={getSectionByKey("about_facilities")} />
        <AboutTeam section={getSectionByKey("about_team")} />
        <AboutMission section={getSectionByKey("about_mission")} />
      </div>
    </main>
  );
}
