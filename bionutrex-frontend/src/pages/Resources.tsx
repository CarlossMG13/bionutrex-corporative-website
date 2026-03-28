import { useEffect, useState } from "react";
import { homeSectionAPI, technicalResourceAPI } from "@/services/api";
import type { HomeSection, TechnicalResource } from "@/types";
import ResourcesHero from "@/components/resources/ResourcesHero";
import ResourcesFilter from "@/components/resources/ResourcesFilter";
import ResourcesCatalogs from "@/components/resources/ResourcesCatalogs";
import ResourcesTable from "@/components/resources/ResourcesTable";
import ResourcesCTA from "@/components/resources/ResourcesCTA";

export default function Resources() {
  const [sections, setSections] = useState<Record<string, HomeSection>>({});
  const [dbResources, setDbResources] = useState<TechnicalResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductLine, setSelectedProductLine] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    homeSectionAPI.getAll().then((res) => {
      const map: Record<string, HomeSection> = {};
      res.data.forEach((s: HomeSection) => {
        map[s.sectionKey] = s;
      });
      setSections(map);
    });

    technicalResourceAPI.getAll().then((res) => {
      setDbResources(res.data);
    }).catch(() => {});
  }, []);

  const filters = { searchQuery, selectedCategory, selectedProductLine };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedProductLine("");
    setSelectedDate("");
  };

  return (
    <div className="w-full overflow-x-hidden min-h-screen" style={{ background: "#f8f9fb" }}>
      {/* Hero — full bleed, no container */}
      {sections.resources_hero && (
        <ResourcesHero
          section={sections.resources_hero}
          searchProps={{ value: searchQuery, onChange: setSearchQuery }}
        />
      )}

      {/* Rest of content — contained */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {sections.resources_filter && (
          <ResourcesFilter
            section={sections.resources_filter}
            selectedCategory={selectedCategory}
            selectedProductLine={selectedProductLine}
            selectedDate={selectedDate}
            onCategoryChange={setSelectedCategory}
            onProductLineChange={setSelectedProductLine}
            onDateChange={setSelectedDate}
            onClear={handleClear}
          />
        )}
        {sections.resources_catalogs && (
          <ResourcesCatalogs section={sections.resources_catalogs} filters={filters} />
        )}
        <ResourcesTable
          section={sections.resources_table}
          dbResources={dbResources}
          filters={filters}
        />
        {sections.resources_cta && (
          <ResourcesCTA section={sections.resources_cta} />
        )}
      </div>
    </div>
  );
}
