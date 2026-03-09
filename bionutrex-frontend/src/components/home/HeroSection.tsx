import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { useHomeSections } from "@/contexts/HomeDataContext";
import HeroSectionImg from "../../assets/images/heroSection-img.jpg";
import type { Slider, TitleSegment, SliderStat } from "@/types";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

// --- Render de título segmentado ---
function renderSegments(segments: TitleSegment[], accentColor: string) {
  return segments.map((seg, i) => (
    <React.Fragment key={i}>
      {seg.newlineBefore && <br />}
      <span
        style={{
          color: seg.color === "accent" ? accentColor : seg.color || "inherit",
          fontWeight: seg.bold ? 900 : undefined,
          fontStyle: seg.italic ? "italic" : undefined,
          textDecoration: seg.underline ? "underline" : undefined,
        }}
      >
        {seg.text}
      </span>
    </React.Fragment>
  ));
}

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// --- Slides por defecto (se usan si hay menos de 2 en el CMS) ---
const DEFAULT_SLIDES: Slider[] = [
  {
    id: "default-1",
    title: "POWER DEFINED.",
    titleSegments: JSON.stringify([
      { text: "POWER", bold: true },
      {
        text: "DEFINED.",
        newlineBefore: true,
        color: "accent",
        bold: true,
        italic: true,
      },
    ]),
    label: "Human-Centric Performance",
    mediaType: "image",
    imageUrl: HeroSectionImg,
    description:
      "Designed for the high-intensity human machine. We don't just sell supplements; we engineer the fuel for your next breakthrough.",
    accentColor: "#00e5ff",
    buttonText: "Comprar Ahora",
    buttonLink: "/blog",
    button2Text: "The Science",
    button2Link: "/about",
    stats: JSON.stringify([
      { value: "150K+", label: "Athletes Fueled" },
      { value: "99.9%", label: "Purity Grade" },
    ]),
    order: 0,
    active: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "default-2",
    title: "SCIENCE DRIVEN.",
    titleSegments: JSON.stringify([
      { text: "SCIENCE", bold: true },
      {
        text: "DRIVEN.",
        newlineBefore: true,
        color: "accent",
        bold: true,
        italic: true,
      },
    ]),
    label: "Pharmaceutical Grade",
    mediaType: "image",
    imageUrl: HeroSectionImg,
    description:
      "Every formula backed by clinical research and manufactured to the highest pharmaceutical standards.",
    accentColor: "#00e5ff",
    buttonText: "Comprar Ahora",
    buttonLink: "/blog",
    button2Text: "The Science",
    button2Link: "/about",
    stats: JSON.stringify([
      { value: "25+", label: "Clinical Studies" },
      { value: "GMP", label: "Certified" },
    ]),
    order: 1,
    active: true,
    createdAt: "",
    updatedAt: "",
  },
];

export default function HeroSection() {
  const { getActiveSliders } = useHomeSections();
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const swiperRef = useRef<SwiperType | null>(null);

  const rawSliders = getActiveSliders();
  // Si hay menos de 2 slides en CMS, usa los hardcodeados
  const slides = rawSliders.length >= 2 ? rawSliders : DEFAULT_SLIDES;

  return (
    <section className="relative w-full h-[95vh]">
      <Swiper
        className="hero-swiper w-full h-full"
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slides.map((slide) => {
          const segments = parseJSON<TitleSegment[]>(slide.titleSegments, [
            { text: slide.title, bold: true },
          ]);
          const stats = parseJSON<SliderStat[]>(slide.stats, []);
          const accent = slide.accentColor || "#00e5ff";
          const isVideo = slide.mediaType === "video" && !!slide.videoUrl;
          const isMuted =
            mutedMap[slide.id] !== undefined
              ? mutedMap[slide.id]
              : slide.videoMuted !== false;

          const toggleMute = () =>
            setMutedMap((prev) => ({ ...prev, [slide.id]: !isMuted }));

          return (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full flex items-center overflow-hidden">
                {/* ---- Media Background ---- */}
                <div className="absolute inset-0 z-0">
                  {isVideo ? (
                    <video
                      src={resolveUrl(slide.videoUrl ?? "")}
                      poster={resolveUrl(slide.imageUrl)}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={resolveUrl(slide.imageUrl)}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                  {/* Gradient: izquierda blanca, derecha transparente */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                </div>

                {/* ---- Contenido ---- */}
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 relative z-10 w-full py-16 lg:py-0">
                  <div className="flex flex-col justify-center space-y-5 lg:space-y-8">
                    {/* Label badge */}
                    {slide.label && (
                      <div
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border px-4 py-2 rounded-full w-fit shadow-sm"
                        style={{ borderColor: `${accent}40` }}
                      >
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: accent }}
                        />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-black">
                          {slide.label}
                        </span>
                      </div>
                    )}

                    {/* Título */}
                    <div>
                      <h1 className="font-black leading-[0.85] tracking-tighter uppercase text-black mb-6 text-6xl md:text-8xl lg:text-9xl">
                        {renderSegments(segments, accent)}
                      </h1>
                      {(slide.description || slide.subtitle) && (
                        <p className="text-slate-700 max-w-lg text-lg lg:text-xl font-medium leading-relaxed">
                          {slide.description || slide.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Botones */}
                    {(slide.buttonText || slide.button2Text) && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {slide.buttonText && (
                          <Link
                            to={slide.buttonLink || "/"}
                            className="min-w-[180px] text-center px-8 py-4 text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-all duration-300 text-black"
                            style={{ backgroundColor: accent }}
                          >
                            {slide.buttonText}
                          </Link>
                        )}
                        {slide.button2Text && (
                          <Link
                            to={slide.button2Link || "/"}
                            className="min-w-[180px] text-center border-2 border-black text-black bg-white/50 backdrop-blur-sm px-8 py-4 text-sm font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
                          >
                            {slide.button2Text}
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {stats.length > 0 && (
                      <div className="flex items-center gap-8 pt-6 border-t border-slate-200 w-fit">
                        {stats.map((stat, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && (
                              <div className="w-px h-10 bg-slate-200" />
                            )}
                            <div>
                              <p className="text-2xl font-black text-black">
                                {stat.value}
                              </p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                {stat.label}
                              </p>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de sonido (solo en slides de video con sonido habilitado) */}
                {isVideo && slide.videoMuted === false && (
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-24 right-6 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Volume2 className="w-4 h-4" style={{ color: accent }} />
                    )}
                  </button>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Flechas de navegación — solo desde 1024px, esquina inferior derecha */}
      <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-center gap-2">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="w-11 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-300"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="w-11 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-black hover:border-black hover:text-white transition-all duration-300"
          aria-label="Slide siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
