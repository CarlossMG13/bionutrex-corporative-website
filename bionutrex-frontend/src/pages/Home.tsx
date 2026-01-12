import * as React from "react";

/* Components */
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero section */}
      <HeroSection />
      {/* About section */}
      <AboutSection />
    </div>
  );
}
