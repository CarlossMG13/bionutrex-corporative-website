import { useEffect, useState } from "react";
import { homeSectionAPI } from "@/services/api";
import type { HomeSection } from "@/types";
import ResourcesHero from "@/components/resources/ResourcesHero";
import ResourcesFilter from "@/components/resources/ResourcesFilter";
import ResourcesCatalogs from "@/components/resources/ResourcesCatalogs";
import ResourcesTable from "@/components/resources/ResourcesTable";
import ResourcesCTA from "@/components/resources/ResourcesCTA";

export default function Resources() {
  const [sections, setSections] = useState<Record<string, HomeSection>>({});
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
  }, []);

  const filters = { searchQuery, selectedCategory, selectedProductLine };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedProductLine("");
    setSelectedDate("");
  };

  return (
    <div className="w-full overflow-x-hidden bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
        {sections.resources_hero && (
          <ResourcesHero
            section={sections.resources_hero}
            searchProps={{ value: searchQuery, onChange: setSearchQuery }}
          />
        )}
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
        {sections.resources_table && (
          <ResourcesTable section={sections.resources_table} filters={filters} />
        )}
        {sections.resources_cta && (
          <ResourcesCTA section={sections.resources_cta} />
        )}
      </div>
    </div>
  );
}
