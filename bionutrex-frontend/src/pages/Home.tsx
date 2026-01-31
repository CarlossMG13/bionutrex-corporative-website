import * as React from "react";

/* Components */
import HeroSection from "@/components/home/HeroSection";
import QualitySection from "@/components/home/QualitySection";
import MethodologySection from "@/components/home/MethodologySection";
import BlogSection from "@/components/home/BlogSection";

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero section */}
      <HeroSection />
      {/* Quality Section */}
      <QualitySection />
      {/* Methodology Section */}
      <MethodologySection />
      {/* Blog section */}
      <BlogSection />
    </div>
  );
}
