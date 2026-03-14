import { useEffect, useState } from "react";
import { homeSectionAPI } from "@/services/api";
import type { HomeSection } from "@/types";
import ProductsHero from "@/components/products/ProductsHero";
import ProductsFeature from "@/components/products/ProductsFeature";
import ProductsFeatureAlt from "@/components/products/ProductsFeatureAlt";
import ProductsPreWorkout from "@/components/products/ProductsPreWorkout";
import ProductsCTA from "@/components/products/ProductsCTA";

export default function Products() {
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
      {sections.products_hero && (
        <ProductsHero section={sections.products_hero} />
      )}
      {sections.products_feature && (
        <ProductsFeature section={sections.products_feature} />
      )}
      {sections.products_feature_alt && (
        <ProductsFeatureAlt section={sections.products_feature_alt} />
      )}
      {sections.products_preworkout && (
        <ProductsPreWorkout section={sections.products_preworkout} />
      )}
      {sections.products_cta && (
        <ProductsCTA section={sections.products_cta} />
      )}
    </div>
  );
}
