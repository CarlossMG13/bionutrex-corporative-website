import { useEffect, useState } from "react";
import { homeSectionAPI } from "@/services/api";
import type { HomeSection } from "@/types";
import CategoriesHero from "@/components/categories/CategoriesHero";
import CategoriesGoals from "@/components/categories/CategoriesGoals";
import CategoriesStack from "@/components/categories/CategoriesStack";
import CategoriesWhy from "@/components/categories/CategoriesWhy";

export default function Categories() {
  const [sections, setSections] = useState<Record<string, HomeSection>>({});

  useEffect(() => {
    homeSectionAPI.getAll().then((res) => {
      const map: Record<string, HomeSection> = {};
      res.data.forEach((s: HomeSection) => {
        map[s.sectionKey] = s;
      });
      setSections(map);
    });
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {sections.categories_hero && (
        <CategoriesHero section={sections.categories_hero} />
      )}
      {sections.categories_goals && (
        <CategoriesGoals section={sections.categories_goals} />
      )}
      {sections.categories_stack && (
        <CategoriesStack section={sections.categories_stack} />
      )}
      {sections.categories_why && (
        <CategoriesWhy section={sections.categories_why} />
      )}
    </div>
  );
}
