import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Image,
  Upload,
  Trash2,
  GripVertical,
  Plus,
} from "lucide-react";
import type { HomeSection, SectionImage, Slider, Product } from "@/types";
import { sliderAPI, productAPI } from "@/services/api";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface SectionEditModalProps {
  section: HomeSection | null;
  onSave: (section: HomeSection) => void;
  onClose: () => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SectionEditModal({
  section,
  onSave,
  onClose,
  onFileUpload,
}: SectionEditModalProps) {
  const [editingSection, setEditingSection] = useState<HomeSection | null>(
    section,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageGallery, setShowImageGallery] = useState<number | null>(null);
  const [expertGalleryIdx, setExpertGalleryIdx] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<{ src: string; name: string }[]>([]);
  // Stores the latest updateExpert fn from the about_team IIFE so the gallery modal can call it
  const expertUpdateRef = useRef<((idx: number, field: string, val: string) => void) | null>(null);

  // Slider picker (solo para hero)
  const [heroSliders, setHeroSliders] = useState<Slider[]>([]);
  const [loadingSliders, setLoadingSliders] = useState(false);
  const [sliderDragId, setSliderDragId] = useState<string | null>(null);
  const [savingSliders, setSavingSliders] = useState(false);
  const [sliderError, setSliderError] = useState<string | null>(null);

  // Product picker (solo para quality)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productDragId, setProductDragId] = useState<string | null>(null);
  const [savingProducts, setSavingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [origFeaturedIds, setOrigFeaturedIds] = useState<Set<string>>(
    new Set(),
  );

  // Para categories_goals
  const [goalTab, setGoalTab] = useState(0);
  const [goalProductGroups, setGoalProductGroups] = useState<Product[][]>([
    [],
    [],
    [],
    [],
  ]);
  const [goalAllProducts, setGoalAllProducts] = useState<Product[]>([]);
  const [loadingGoalProducts, setLoadingGoalProducts] = useState(false);
  const [goalDragId, setGoalDragId] = useState<string | null>(null);

  const getSectionImageConfig = (sectionKey: string) => {
    const configs: Record<
      string,
      {
        maxImages: number;
        imageLabels: string[];
        altLabel?: string;
        captionLabel?: string;
        altDefaults?: string[];
      }
    > = {
      hero: { maxImages: 1, imageLabels: ["Imagen de fondo"] },
      quality: { maxImages: 0, imageLabels: [] },
      methodology: {
        maxImages: 3,
        imageLabels: [
          "Tarjeta 1 — Imagen de fondo",
          "Tarjeta 2 — Imagen de fondo",
          "Tarjeta 3 — Imagen de fondo",
        ],
        altLabel: "Título de la tarjeta",
        captionLabel: "Descripción de la tarjeta",
        altDefaults: ["Ganancia\nMuscular", "Energía", "Recuperación"],
      },
      blog: {
        maxImages: 1,
        imageLabels: ["Imagen principal"],
        captionLabel: "Cita (texto sobre la imagen)",
      },
      about_story: {
        maxImages: 3,
        imageLabels: [
          "Foto pequeña 1",
          "Foto pequeña 2",
          "Imagen principal (grande)",
        ],
        altLabel: "Alt text",
        captionLabel: "Label debajo de la imagen",
      },
      about_facilities: {
        maxImages: 3,
        imageLabels: [
          "Imagen principal (grande)",
          "Imagen derecha superior",
          "Imagen derecha inferior",
        ],
        altLabel: "Label de la instalación",
        captionLabel: "Título de la instalación",
      },
      home_video_hero: {
        maxImages: 1,
        imageLabels: ["Imagen póster (fallback si no hay video)"],
        altLabel: "Alt text",
        captionLabel: "Descripción (opcional)",
      },
      products_feature: {
        maxImages: 1,
        imageLabels: ["Imagen del producto"],
        altLabel: "Alt text",
        captionLabel: "Descripción (opcional)",
      },
      products_feature_alt: {
        maxImages: 1,
        imageLabels: ["Imagen del producto"],
        altLabel: "Alt text",
        captionLabel: "Descripción (opcional)",
      },
      products_preworkout: { maxImages: 0, imageLabels: [] },
      products_cta: { maxImages: 0, imageLabels: [] },
      categories_hero: {
        maxImages: 1,
        imageLabels: ["Imagen / video de fondo"],
        altLabel: "Alt text",
        captionLabel: "Descripción (opcional)",
      },
      categories_goals: {
        maxImages: 4,
        imageLabels: [
          "Imagen Categoría 1",
          "Imagen Categoría 2",
          "Imagen Categoría 3",
          "Imagen Categoría 4",
        ],
        altLabel: "Alt text",
      },
      categories_stack: { maxImages: 0, imageLabels: [] },
      categories_why: {
        maxImages: 1,
        imageLabels: ["Imagen principal (laboratorio)"],
        altLabel: "Alt text",
      },
      resources_hero: {
        maxImages: 1,
        imageLabels: ["Imagen de fondo"],
        altLabel: "Alt text",
      },
      resources_filter: { maxImages: 0, imageLabels: [] },
      resources_catalogs: {
        maxImages: 3,
        imageLabels: [
          "Vista previa catálogo 1",
          "Vista previa catálogo 2",
          "Vista previa catálogo 3",
        ],
        altLabel: "Alt text",
      },
      resources_table: { maxImages: 0, imageLabels: [] },
      resources_cta: {
        maxImages: 1,
        imageLabels: ["Imagen decorativa (derecha)"],
        altLabel: "Alt text",
      },
    };
    return (
      configs[sectionKey] ?? { maxImages: 1, imageLabels: ["Imagen principal"] }
    );
  };

  const initializeImages = (section: HomeSection) => {
    const config = getSectionImageConfig(section.sectionKey);
    if (config.maxImages === 0) return section;

    const currentImages = section.images || [];
    const images: SectionImage[] = [];

    for (let i = 0; i < config.maxImages; i++) {
      const existingImage = currentImages[i];
      images.push({
        id: existingImage?.id || `${section.id}-img-${i}`,
        url: existingImage?.url || "",
        alt: existingImage?.alt || (config as any).altDefaults?.[i] || "",
        caption: existingImage?.caption || "",
        order: i,
      });
    }

    return { ...section, images };
  };

  useEffect(() => {
    if (section) {
      setEditingSection(initializeImages(section));
    }
  }, [section]);

  // Cargar imágenes de galería cuando se abre el picker
  useEffect(() => {
    if (showImageGallery === null && expertGalleryIdx === null) return;
    const LOCAL_IMAGES = [
      "heroSection-img.jpg",
      "MethImage.jpg",
      "img1-grid-product.jpg",
      "img2-grid-product.jpg",
      "img3-grid-product.jpg",
    ];
    const local = LOCAL_IMAGES.map((name) => ({ src: `/images/${name}`, name }));
    fetch(`${BACKEND_URL}/api/uploads/list`)
      .then((r) => r.json())
      .then((files: string[]) => {
        const uploaded = files
          .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
          .map((f) => ({ src: `${BACKEND_URL}/uploads/${f}`, name: f }));
        setGalleryImages([...local, ...uploaded]);
      })
      .catch(() => setGalleryImages(local));
  }, [showImageGallery, expertGalleryIdx]);

  // Cargar sliders para la sección hero
  useEffect(() => {
    if (section?.sectionKey !== "hero") return;
    setLoadingSliders(true);
    sliderAPI
      .getAllAdmin()
      .then((res) => setHeroSliders(res.data.sort((a, b) => a.order - b.order)))
      .catch(() => setSliderError("No se pudieron cargar los sliders"))
      .finally(() => setLoadingSliders(false));
  }, [section?.sectionKey]);

  // Cargar productos para la sección quality
  useEffect(() => {
    if (section?.sectionKey !== "quality") return;
    setLoadingProducts(true);
    productAPI
      .getAllAdmin()
      .then((res) => {
        const all = res.data;
        const feat = all
          .filter((p) => p.featured)
          .sort((a, b) => a.featuredOrder - b.featuredOrder);
        const avail = all.filter((p) => !p.featured && p.active);
        setFeaturedProducts(feat);
        setAvailableProducts(avail);
        setOrigFeaturedIds(new Set(feat.map((p) => p.id)));
      })
      .catch(() => setProductError("No se pudieron cargar los productos"))
      .finally(() => setLoadingProducts(false));
  }, [section?.sectionKey]);

  useEffect(() => {
    if (section?.sectionKey !== "categories_goals") return;
    setLoadingGoalProducts(true);
    productAPI
      .getAllAdmin()
      .then((res) => {
        const all: Product[] = res.data;
        setGoalAllProducts(all.filter((p) => p.active));

        let goals: { productIds?: string[] }[] = [];
        try {
          goals = JSON.parse(section.content ?? "[]");
        } catch {}

        const groups: Product[][] = [[], [], [], []];
        goals.slice(0, 4).forEach((goal, gi) => {
          groups[gi] = (goal.productIds ?? [])
            .map((id) => all.find((p) => p.id === id))
            .filter(Boolean) as Product[];
        });
        setGoalProductGroups(groups);
      })
      .catch(() => {})
      .finally(() => setLoadingGoalProducts(false));
  }, [section?.sectionKey]);

  if (!editingSection) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!editingSection.title?.trim())
      newErrors.title = "El título es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Si es hero, guardar orden y visibilidad de sliders
    if (editingSection.sectionKey === "hero" && heroSliders.length > 0) {
      setSavingSliders(true);
      setSliderError(null);
      try {
        await Promise.all(
          heroSliders.map((slider, index) => {
            const fd = new FormData();
            fd.append("active", slider.active ? "true" : "false");
            fd.append("order", String(index));
            return sliderAPI.update(slider.id, fd);
          }),
        );
      } catch {
        setSliderError("Error al guardar los sliders");
        setSavingSliders(false);
        return;
      }
      setSavingSliders(false);
    }

    // Si es quality, guardar productos destacados
    if (editingSection.sectionKey === "quality") {
      setSavingProducts(true);
      setProductError(null);
      try {
        const updates = featuredProducts.map((p, index) => {
          const fd = new FormData();
          fd.append("featured", "true");
          fd.append("featuredOrder", String(index));
          return productAPI.update(p.id, fd);
        });
        const removedIds = [...origFeaturedIds].filter(
          (id) => !featuredProducts.find((p) => p.id === id),
        );
        const removals = removedIds.map((id) => {
          const fd = new FormData();
          fd.append("featured", "false");
          fd.append("featuredOrder", "0");
          return productAPI.update(id, fd);
        });
        await Promise.all([...updates, ...removals]);
      } catch {
        setProductError("Error al guardar los productos");
        setSavingProducts(false);
        return;
      }
      setSavingProducts(false);
    }

    onSave(editingSection);
  };

  const handleChange = (field: keyof HomeSection, value: any) => {
    setEditingSection((prev) => (prev ? { ...prev, [field]: value } : null));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (
    imageIndex: number,
    field: keyof SectionImage,
    value: string,
  ) => {
    setEditingSection((prev) => {
      if (!prev || !prev.images) return prev;
      const updatedImages = [...prev.images];
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        [field]: value,
      };
      return { ...prev, images: updatedImages };
    });
  };

  const selectImageFromGallery = (imageIndex: number, imageSrc: string) => {
    handleImageChange(imageIndex, "url", imageSrc);
    setShowImageGallery(null);
  };

  // DnD de productos
  const handleProductDrop = (targetId: string) => {
    if (!productDragId || productDragId === targetId) return;
    setFeaturedProducts((prev) => {
      const from = prev.find((p) => p.id === productDragId)!;
      const rest = prev.filter((p) => p.id !== productDragId);
      const toIdx = rest.findIndex((p) => p.id === targetId);
      rest.splice(toIdx, 0, from);
      return rest;
    });
    setProductDragId(null);
  };

  const addToFeatured = (product: Product) => {
    if (featuredProducts.length >= 4) return;
    setFeaturedProducts((prev) => [...prev, product]);
    setAvailableProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const removeFromFeatured = (product: Product) => {
    setFeaturedProducts((prev) => prev.filter((p) => p.id !== product.id));
    setAvailableProducts((prev) => [...prev, product]);
  };

  // DnD de sliders
  const handleSliderDrop = (targetId: string) => {
    if (!sliderDragId || sliderDragId === targetId) return;
    setHeroSliders((prev) => {
      const from = prev.find((s) => s.id === sliderDragId)!;
      const rest = prev.filter((s) => s.id !== sliderDragId);
      const toIdx = rest.findIndex((s) => s.id === targetId);
      rest.splice(toIdx, 0, from);
      return rest;
    });
    setSliderDragId(null);
  };

  const toggleSliderActive = (id: string) => {
    setHeroSliders((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    );
  };

  // Subida directa por slot
  const handleSlotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${BACKEND_URL}/api/uploads`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result: { url: string } = await res.json();
      handleImageChange(imageIndex, "url", result.url);
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Sección: {editingSection.sectionKey}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={editingSection.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Título de la sección"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={editingSection.subtitle || ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="Subtítulo opcional"
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <textarea
              value={editingSection.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none resize-vertical ${
                errors.content ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Contenido de la sección"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Imágenes */}
          {(() => {
            const config = getSectionImageConfig(editingSection.sectionKey);
            if (config.maxImages === 0) return null;

            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <Image className="w-4 h-4 inline mr-2" />
                  Imágenes de la sección
                </label>
                <div className="space-y-4">
                  {editingSection.images?.map((image, index) => (
                    <div
                      key={image.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {config.imageLabels[index] || `Imagen ${index + 1}`}
                        </span>
                      </div>

                      <div className="mb-3">
                        {image.url ? (
                          <div className="relative">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() =>
                                handleImageChange(index, "url", "")
                              }
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">
                              Sin imagen seleccionada
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowImageGallery(index)}
                            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            type="button"
                          >
                            <Image className="w-4 h-4" />
                            Seleccionar de Galería
                          </button>

                          <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Subir Nueva
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSlotUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL de imagen
                          </label>
                          <input
                            type="text"
                            value={image.url}
                            onChange={(e) =>
                              handleImageChange(index, "url", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="https://ejemplo.com/imagen.jpg o /uploads/imagen.jpg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {(config as any).altLabel ??
                              "Texto alternativo (Alt)"}
                          </label>
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) =>
                              handleImageChange(index, "alt", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="Descripción de la imagen para accesibilidad"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {(config as any).captionLabel ??
                              "Descripción (opcional)"}
                          </label>
                          <input
                            type="text"
                            value={image.caption || ""}
                            onChange={(e) =>
                              handleImageChange(
                                index,
                                "caption",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="Descripción que aparecerá debajo de la imagen"
                          />
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>
            );
          })()}

          {/* ── Video URL (solo home_video_hero) ── */}
          {editingSection.sectionKey === "home_video_hero" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Video de fondo
              </label>
              <p className="text-xs text-gray-400">
                Sube un archivo de video o pega una URL directa (MP4
                recomendado). El video se reproducirá en bucle, sin sonido y a
                pantalla completa.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  URL del video
                </label>
                <input
                  type="text"
                  value={editingSection.videoUrl ?? ""}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                  placeholder="/uploads/video-marca.mp4  o  https://cdn.ejemplo.com/video.mp4"
                />
              </div>
              <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                Subir video
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    const fd = new FormData();
                    fd.append("image", file);
                    try {
                      const res = await fetch(`${BACKEND_URL}/api/uploads`, {
                        method: "POST",
                        body: fd,
                      });
                      if (!res.ok) throw new Error("Upload failed");
                      const result: { url: string } = await res.json();
                      handleChange("videoUrl", result.url);
                    } catch {
                      // silently ignore
                    }
                  }}
                  className="hidden"
                />
              </label>
              {editingSection.videoUrl && (
                <video
                  src={resolveUrl(editingSection.videoUrl)}
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full rounded-lg max-h-40 object-cover bg-slate-100"
                />
              )}
            </div>
          )}

          {/* ── Slider Picker (solo hero) ── */}
          {editingSection.sectionKey === "hero" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Slides del Hero
              </label>

              {sliderError && (
                <p className="text-red-500 text-sm mb-3">{sliderError}</p>
              )}

              {loadingSliders ? (
                <p className="text-sm text-gray-400">Cargando sliders...</p>
              ) : heroSliders.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No hay sliders creados aún. Créalos desde la pestaña "Slider
                  de Imágenes".
                </p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {heroSliders.map((slider, index) => (
                    <div
                      key={slider.id}
                      draggable
                      onDragStart={() => setSliderDragId(slider.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleSliderDrop(slider.id)}
                      onDragEnd={() => setSliderDragId(null)}
                      className={`flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing select-none ${
                        index < heroSliders.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } ${sliderDragId === slider.id ? "opacity-40" : ""}`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                      <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">
                        {index + 1}
                      </span>

                      <div className="w-14 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={resolveUrl(slider.imageUrl)}
                          alt={slider.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {slider.title}
                        </p>
                        {slider.label && (
                          <p className="text-xs text-gray-400 truncate">
                            {slider.label}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSliderActive(slider.id)}
                        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          slider.active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {slider.active ? "Visible" : "Oculto"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Arrastra para reordenar · Toca el estado para cambiar
                visibilidad
              </p>
            </div>
          )}

          {/* ── Product Picker (solo quality) ── */}
          {editingSection.sectionKey === "quality" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Productos destacados (máx. 4)
              </label>

              {productError && (
                <p className="text-red-500 text-sm mb-3">{productError}</p>
              )}

              {loadingProducts ? (
                <p className="text-sm text-gray-400">Cargando productos...</p>
              ) : (
                <>
                  {/* Featured list */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                    {featuredProducts.length === 0 ? (
                      <p className="text-sm text-gray-400 p-4">
                        Sin productos seleccionados. Añade hasta 4 desde la
                        lista de abajo.
                      </p>
                    ) : (
                      featuredProducts.map((product, index) => {
                        const imgSrc = product.imageUrl?.startsWith("/uploads/")
                          ? `${BACKEND_URL}${product.imageUrl}`
                          : product.imageUrl;
                        return (
                          <div
                            key={product.id}
                            draggable
                            onDragStart={() => setProductDragId(product.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleProductDrop(product.id)}
                            onDragEnd={() => setProductDragId(null)}
                            className={`flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing select-none ${
                              index < featuredProducts.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            } ${productDragId === product.id ? "opacity-40" : ""}`}
                          >
                            <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <div
                              className="w-10 h-12 rounded bg-gray-100 bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: `url('${imgSrc}')` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {product.variants?.[0]?.price != null ? `$${product.variants[0].price.toFixed(2)}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromFeatured(product)}
                              className="text-xs text-red-500 hover:underline flex-shrink-0"
                            >
                              Quitar
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Available products */}
                  {featuredProducts.length < 4 &&
                    availableProducts.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">
                          Productos disponibles — clic en + para añadir
                        </p>
                        <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                          {availableProducts.map((product) => {
                            const imgSrc = product.imageUrl?.startsWith(
                              "/uploads/",
                            )
                              ? `${BACKEND_URL}${product.imageUrl}`
                              : product.imageUrl;
                            return (
                              <div
                                key={product.id}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                              >
                                <div
                                  className="w-8 h-10 rounded bg-gray-100 bg-cover bg-center flex-shrink-0"
                                  style={{
                                    backgroundImage: `url('${imgSrc}')`,
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {product.variants?.[0]?.price != null ? `$${product.variants[0].price.toFixed(2)}` : ""}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addToFeatured(product)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#0d40a5] text-white hover:bg-[#0d40a5]/80 flex-shrink-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <p className="text-xs text-gray-400 mt-2">
                    Arrastra para reordenar · "Quitar" para sacar de la
                    selección
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Badge Editor (about_stats) ── */}
          {editingSection.sectionKey === "about_stats" &&
            (() => {
              let badges: {
                icon: string;
                value: string;
                label: string;
                description: string;
              }[] = [];
              try {
                const p = JSON.parse(editingSection.content);
                if (Array.isArray(p)) badges = p;
              } catch {
                badges = [];
              }

              const updateBadge = (idx: number, field: string, val: string) => {
                const updated = [...badges];
                updated[idx] = { ...updated[idx], [field]: val };
                handleChange("content", JSON.stringify(updated));
              };
              const addBadge = () => {
                if (badges.length >= 4) return;
                handleChange(
                  "content",
                  JSON.stringify([
                    ...badges,
                    {
                      icon: "star",
                      value: "NEW",
                      label: "Label",
                      description: "",
                    },
                  ]),
                );
              };
              const removeBadge = (idx: number) => {
                if (badges.length <= 1) return;
                handleChange(
                  "content",
                  JSON.stringify(badges.filter((_, i) => i !== idx)),
                );
              };

              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Badges ({badges.length}/4)
                    </label>
                    {badges.length < 4 && (
                      <button
                        type="button"
                        onClick={addBadge}
                        className="text-xs px-3 py-1 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {badges.map((badge, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">
                            Badge {i + 1}
                          </span>
                          {badges.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBadge(i)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Icono (Material Symbol)
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={badge.icon}
                              onChange={(e) =>
                                updateBadge(i, "icon", e.target.value)
                              }
                              placeholder="verified_user"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Valor
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={badge.value}
                              onChange={(e) =>
                                updateBadge(i, "value", e.target.value)
                              }
                              placeholder="100%"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Label
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={badge.label}
                              onChange={(e) =>
                                updateBadge(i, "label", e.target.value)
                              }
                              placeholder="Purity Guarantee"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Descripción
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={badge.description}
                              onChange={(e) =>
                                updateBadge(i, "description", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* ── Badge Editor (products_feature) ── */}
          {editingSection.sectionKey === "products_feature" &&
            (() => {
              let parsed: {
                description: string;
                badges: { value: string; label: string }[];
              } = { description: "", badges: [] };
              try {
                const p = JSON.parse(editingSection.content);
                parsed = {
                  description: p.description ?? editingSection.content,
                  badges: Array.isArray(p.badges) ? p.badges : [],
                };
              } catch {
                parsed = { description: editingSection.content, badges: [] };
              }

              const update = (next: typeof parsed) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido del producto destacado
                  </label>

                  {/* Descripción */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={parsed.description}
                      onChange={(e) =>
                        update({ ...parsed, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      placeholder="Descripción del producto..."
                    />
                  </div>

                  {/* Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Badges ({parsed.badges.length}/4)
                      </label>
                      {parsed.badges.length < 4 && (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              ...parsed,
                              badges: [
                                ...parsed.badges,
                                { value: "", label: "" },
                              ],
                            })
                          }
                          className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {parsed.badges.map((badge, bi) => (
                        <div
                          key={bi}
                          className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                        >
                          <input
                            value={badge.value}
                            onChange={(e) => {
                              const next = [...parsed.badges];
                              next[bi] = { ...next[bi], value: e.target.value };
                              update({ ...parsed, badges: next });
                            }}
                            placeholder="28G"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={badge.label}
                            onChange={(e) => {
                              const next = [...parsed.badges];
                              next[bi] = { ...next[bi], label: e.target.value };
                              update({ ...parsed, badges: next });
                            }}
                            placeholder="Pure Isolate"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              update({
                                ...parsed,
                                badges: parsed.badges.filter(
                                  (_, i) => i !== bi,
                                ),
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* ── Feature Editor (products_feature_alt) ── */}
          {editingSection.sectionKey === "products_feature_alt" &&
            (() => {
              let parsed: {
                description: string;
                features: { icon: string; label: string }[];
              } = { description: "", features: [] };
              try {
                const p = JSON.parse(editingSection.content);
                parsed = {
                  description: p.description ?? editingSection.content,
                  features: Array.isArray(p.features) ? p.features : [],
                };
              } catch {
                parsed = { description: editingSection.content, features: [] };
              }

              const update = (next: typeof parsed) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido del producto
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={parsed.description}
                      onChange={(e) =>
                        update({ ...parsed, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      placeholder="Descripción del producto..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Features / Bullets ({parsed.features.length}/4)
                      </label>
                      {parsed.features.length < 4 && (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              ...parsed,
                              features: [
                                ...parsed.features,
                                { icon: "verified", label: "" },
                              ],
                            })
                          }
                          className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {parsed.features.map((feat, fi) => (
                        <div
                          key={fi}
                          className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center"
                        >
                          <input
                            value={feat.icon}
                            onChange={(e) => {
                              const next = [...parsed.features];
                              next[fi] = { ...next[fi], icon: e.target.value };
                              update({ ...parsed, features: next });
                            }}
                            placeholder="verified"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={feat.label}
                            onChange={(e) => {
                              const next = [...parsed.features];
                              next[fi] = { ...next[fi], label: e.target.value };
                              update({ ...parsed, features: next });
                            }}
                            placeholder="Pharmaceutical Grade"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              update({
                                ...parsed,
                                features: parsed.features.filter(
                                  (_, i) => i !== fi,
                                ),
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Iconos: nombre de Material Symbols (verified, analytics,
                      science, bolt...)
                    </p>
                  </div>
                </div>
              );
            })()}

          {/* ── PreWorkout Editor (products_preworkout) ── */}
          {editingSection.sectionKey === "products_preworkout" &&
            (() => {
              let parsed: {
                description: string;
                icon: string;
                productName: string;
                stats: { value: string; label: string }[];
              } = {
                description: "",
                icon: "offline_bolt",
                productName: "",
                stats: [],
              };
              try {
                const p = JSON.parse(editingSection.content);
                parsed = {
                  description: p.description ?? editingSection.content,
                  icon: p.icon ?? "offline_bolt",
                  productName: p.productName ?? "",
                  stats: Array.isArray(p.stats) ? p.stats : [],
                };
              } catch {
                parsed = {
                  description: editingSection.content,
                  icon: "offline_bolt",
                  productName: "",
                  stats: [],
                };
              }

              const update = (next: typeof parsed) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido del Pre-Workout
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre del producto (subtítulo grande)
                    </label>
                    <input
                      value={parsed.productName}
                      onChange={(e) =>
                        update({ ...parsed, productName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      placeholder="Hyper-Focus Pre-Workout"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={parsed.description}
                      onChange={(e) =>
                        update({ ...parsed, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      placeholder="Descripción del producto..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Icono decorativo (Material Symbol)
                    </label>
                    <input
                      value={parsed.icon}
                      onChange={(e) =>
                        update({ ...parsed, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      placeholder="offline_bolt"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Stats ({parsed.stats.length}/4)
                      </label>
                      {parsed.stats.length < 4 && (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              ...parsed,
                              stats: [
                                ...parsed.stats,
                                { value: "", label: "" },
                              ],
                            })
                          }
                          className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {parsed.stats.map((stat, si) => (
                        <div
                          key={si}
                          className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center"
                        >
                          <input
                            value={stat.value}
                            onChange={(e) => {
                              const next = [...parsed.stats];
                              next[si] = { ...next[si], value: e.target.value };
                              update({ ...parsed, stats: next });
                            }}
                            placeholder="PUMP"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={stat.label}
                            onChange={(e) => {
                              const next = [...parsed.stats];
                              next[si] = { ...next[si], label: e.target.value };
                              update({ ...parsed, stats: next });
                            }}
                            placeholder="Nitrate Blend"
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              update({
                                ...parsed,
                                stats: parsed.stats.filter((_, i) => i !== si),
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* ── Goals Editor (categories_goals) ── */}
          {editingSection.sectionKey === "categories_goals" &&
            (() => {
              let goals: {
                title: string;
                description: string;
                link: string;
                productIds?: string[];
              }[] = [];
              try {
                const p = JSON.parse(editingSection.content);
                if (Array.isArray(p)) goals = p;
              } catch {}
              while (goals.length < 4) {
                goals.push({ title: "", description: "", link: "/" });
              }

              const GOAL_NAMES = [
                "Muscle Building",
                "Fat Loss",
                "Recovery",
                "Endurance",
              ];

              const updateGoal = (
                idx: number,
                field: string,
                value: string,
              ) => {
                const updated = goals.map((g, i) =>
                  i === idx ? { ...g, [field]: value } : g,
                );
                handleChange("content", JSON.stringify(updated));
              };

              const syncProducts = (groups: Product[][]) => {
                const updated = goals.map((g, i) => ({
                  ...g,
                  productIds: (groups[i] ?? []).map((p) => p.id),
                }));
                handleChange("content", JSON.stringify(updated));
              };

              const addProduct = (product: Product) => {
                if (
                  goalProductGroups[goalTab]?.find((p) => p.id === product.id)
                )
                  return;
                const next = goalProductGroups.map((g, i) =>
                  i === goalTab ? [...g, product] : g,
                );
                setGoalProductGroups(next);
                syncProducts(next);
              };

              const removeProduct = (productId: string) => {
                const next = goalProductGroups.map((g, i) =>
                  i === goalTab ? g.filter((p) => p.id !== productId) : g,
                );
                setGoalProductGroups(next);
                syncProducts(next);
              };

              const reorderProduct = (fromId: string, toId: string) => {
                const group = [...(goalProductGroups[goalTab] ?? [])];
                const from = group.findIndex((p) => p.id === fromId);
                const to = group.findIndex((p) => p.id === toId);
                if (from === -1 || to === -1) return;
                const [item] = group.splice(from, 1);
                group.splice(to, 0, item);
                const next = goalProductGroups.map((g, i) =>
                  i === goalTab ? group : g,
                );
                setGoalProductGroups(next);
                syncProducts(next);
              };

              const assigned = goalProductGroups[goalTab] ?? [];
              const assignedIds = new Set(assigned.map((p) => p.id));
              const available = goalAllProducts.filter(
                (p) => !assignedIds.has(p.id),
              );

              return (
                <div className="space-y-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Categorías del grid
                  </label>

                  {/* Card editors */}
                  <div className="space-y-4">
                    {goals.map((goal, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 space-y-2"
                      >
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {GOAL_NAMES[i] ?? `Categoría ${i + 1}`}
                        </span>
                        <input
                          value={goal.title}
                          onChange={(e) =>
                            updateGoal(i, "title", e.target.value)
                          }
                          placeholder="Título (ej: Muscle Building)"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                        <textarea
                          rows={2}
                          value={goal.description}
                          onChange={(e) =>
                            updateGoal(i, "description", e.target.value)
                          }
                          placeholder="Descripción..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                        />
                        <input
                          value={goal.link}
                          onChange={(e) =>
                            updateGoal(i, "link", e.target.value)
                          }
                          placeholder="Enlace (ej: /categories/muscle)"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Product assignment per category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Productos por categoría
                    </label>

                    {/* Tab selector */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
                      {GOAL_NAMES.map((name, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGoalTab(i)}
                          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                            goalTab === i
                              ? "bg-[#0d40a5] text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {name.split(" ")[0]}
                        </button>
                      ))}
                    </div>

                    {loadingGoalProducts ? (
                      <p className="text-xs text-gray-400">
                        Cargando productos...
                      </p>
                    ) : (
                      <>
                        {/* Assigned (draggable to reorder) */}
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Asignados ({assigned.length})
                        </p>
                        {assigned.length === 0 ? (
                          <p className="text-xs text-gray-400 mb-3 italic">
                            Sin productos asignados
                          </p>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {assigned.map((product) => (
                              <div
                                key={product.id}
                                draggable
                                onDragStart={() => setGoalDragId(product.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (goalDragId && goalDragId !== product.id) {
                                    reorderProduct(goalDragId, product.id);
                                  }
                                  setGoalDragId(null);
                                }}
                                onDragEnd={() => setGoalDragId(null)}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-grab"
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    {product.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(product.id)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Quitar
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Available */}
                        {available.length > 0 && (
                          <>
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Disponibles — click + para asignar
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                              {available.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50"
                                >
                                  <span className="text-sm text-gray-700">
                                    {product.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-[#0d40a5] text-white hover:bg-[#0d40a5]/80"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* ── Stack Bundle Editor (categories_stack) ── */}
          {editingSection.sectionKey === "categories_stack" &&
            (() => {
              let bundle: {
                bundleTitle: string;
                bundleText: string;
                originalPrice: string;
                salePrice: string;
                icon: string;
              } = {
                bundleTitle: "",
                bundleText: "",
                originalPrice: "",
                salePrice: "",
                icon: "inventory_2",
              };
              try {
                const p = JSON.parse(editingSection.content);
                bundle = { ...bundle, ...p };
              } catch {}

              const update = (next: typeof bundle) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Oferta de bundle
                  </label>
                  <p className="text-xs text-gray-400">
                    Los productos del stack son los marcados como "Featured" en
                    el editor de productos.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Título del bundle
                    </label>
                    <input
                      value={bundle.bundleTitle}
                      onChange={(e) =>
                        update({ ...bundle, bundleTitle: e.target.value })
                      }
                      placeholder="The Ultimate Hypertrophy Stack"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción del bundle
                    </label>
                    <input
                      value={bundle.bundleText}
                      onChange={(e) =>
                        update({ ...bundle, bundleText: e.target.value })
                      }
                      placeholder="Save 15% when you buy all three together."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Precio original
                      </label>
                      <input
                        value={bundle.originalPrice}
                        onChange={(e) =>
                          update({ ...bundle, originalPrice: e.target.value })
                        }
                        placeholder="$132.97"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Precio oferta
                      </label>
                      <input
                        value={bundle.salePrice}
                        onChange={(e) =>
                          update({ ...bundle, salePrice: e.target.value })
                        }
                        placeholder="$112.99"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Icono (Material Symbol)
                    </label>
                    <input
                      value={bundle.icon}
                      onChange={(e) =>
                        update({ ...bundle, icon: e.target.value })
                      }
                      placeholder="inventory_2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                    />
                  </div>
                </div>
              );
            })()}

          {/* ── Why Editor (categories_why) ── */}
          {editingSection.sectionKey === "categories_why" &&
            (() => {
              let parsed: {
                description: string;
                bullets: { icon: string; title: string; description: string }[];
                testimonial: {
                  name: string;
                  role: string;
                  quote: string;
                  imageUrl: string;
                };
              } = {
                description: "",
                bullets: [],
                testimonial: { name: "", role: "", quote: "", imageUrl: "" },
              };
              try {
                const p = JSON.parse(editingSection.content);
                parsed = {
                  description: p.description ?? "",
                  bullets: Array.isArray(p.bullets) ? p.bullets : [],
                  testimonial: p.testimonial ?? {
                    name: "",
                    role: "",
                    quote: "",
                    imageUrl: "",
                  },
                };
              } catch {}

              const update = (next: typeof parsed) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenido — ¿Por qué Bionutrex?
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={parsed.description}
                      onChange={(e) =>
                        update({ ...parsed, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      placeholder="Descripción general..."
                    />
                  </div>

                  {/* Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">
                        Bullets ({parsed.bullets.length}/4)
                      </label>
                      {parsed.bullets.length < 4 && (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              ...parsed,
                              bullets: [
                                ...parsed.bullets,
                                {
                                  icon: "verified",
                                  title: "",
                                  description: "",
                                },
                              ],
                            })
                          }
                          className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Agregar
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {parsed.bullets.map((b, bi) => (
                        <div
                          key={bi}
                          className="border border-gray-200 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">
                              Bullet {bi + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                update({
                                  ...parsed,
                                  bullets: parsed.bullets.filter(
                                    (_, i) => i !== bi,
                                  ),
                                })
                              }
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
                          <div className="grid grid-cols-[1fr_2fr] gap-2">
                            <input
                              value={b.icon}
                              onChange={(e) => {
                                const next = [...parsed.bullets];
                                next[bi] = {
                                  ...next[bi],
                                  icon: e.target.value,
                                };
                                update({ ...parsed, bullets: next });
                              }}
                              placeholder="verified"
                              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                            />
                            <input
                              value={b.title}
                              onChange={(e) => {
                                const next = [...parsed.bullets];
                                next[bi] = {
                                  ...next[bi],
                                  title: e.target.value,
                                };
                                update({ ...parsed, bullets: next });
                              }}
                              placeholder="Third Party Tested"
                              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                            />
                          </div>
                          <input
                            value={b.description}
                            onChange={(e) => {
                              const next = [...parsed.bullets];
                              next[bi] = {
                                ...next[bi],
                                description: e.target.value,
                              };
                              update({ ...parsed, bullets: next });
                            }}
                            placeholder="Descripción del bullet..."
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Testimonio (overlay sobre la imagen)
                    </label>
                    <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <input
                        value={parsed.testimonial.name}
                        onChange={(e) =>
                          update({
                            ...parsed,
                            testimonial: {
                              ...parsed.testimonial,
                              name: e.target.value,
                            },
                          })
                        }
                        placeholder="Dr. Elena Vance"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                      <input
                        value={parsed.testimonial.role}
                        onChange={(e) =>
                          update({
                            ...parsed,
                            testimonial: {
                              ...parsed.testimonial,
                              role: e.target.value,
                            },
                          })
                        }
                        placeholder="Head of Performance Science"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                      <textarea
                        rows={2}
                        value={parsed.testimonial.quote}
                        onChange={(e) =>
                          update({
                            ...parsed,
                            testimonial: {
                              ...parsed.testimonial,
                              quote: e.target.value,
                            },
                          })
                        }
                        placeholder="Cita del testimonio..."
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      />
                      <input
                        value={parsed.testimonial.imageUrl}
                        onChange={(e) =>
                          update({
                            ...parsed,
                            testimonial: {
                              ...parsed.testimonial,
                              imageUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="URL de la foto del testimoniante"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* ── Filter Options Editor (resources_filter) ── */}
          {editingSection.sectionKey === "resources_filter" &&
            (() => {
              let opts: {
                categories: string[];
                productLines: string[];
                dateOptions: string[];
              } = { categories: [], productLines: [], dateOptions: [] };
              try {
                const p = JSON.parse(editingSection.content);
                opts = {
                  categories: Array.isArray(p.categories) ? p.categories : [],
                  productLines: Array.isArray(p.productLines) ? p.productLines : [],
                  dateOptions: Array.isArray(p.dateOptions) ? p.dateOptions : [],
                };
              } catch {}

              const update = (next: typeof opts) =>
                handleChange("content", JSON.stringify(next));

              const EditableList = ({
                label,
                items,
                onChange,
              }: {
                label: string;
                items: string[];
                onChange: (next: string[]) => void;
              }) => (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">{label}</label>
                    <button
                      type="button"
                      onClick={() => onChange([...items, ""])}
                      className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Añadir
                    </button>
                  </div>
                  <div className="space-y-1">
                    {items.map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={item}
                          onChange={(e) => {
                            const next = [...items];
                            next[i] = e.target.value;
                            onChange(next);
                          }}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );

              return (
                <div className="space-y-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Opciones de filtros
                  </label>
                  <EditableList
                    label="Categorías (primera = 'Todos')"
                    items={opts.categories}
                    onChange={(v) => update({ ...opts, categories: v })}
                  />
                  <EditableList
                    label="Líneas de producto (primera = 'Todas')"
                    items={opts.productLines}
                    onChange={(v) => update({ ...opts, productLines: v })}
                  />
                  <EditableList
                    label="Opciones de fecha"
                    items={opts.dateOptions}
                    onChange={(v) => update({ ...opts, dateOptions: v })}
                  />
                </div>
              );
            })()}

          {/* ── Catalogs Editor (resources_catalogs) ── */}
          {editingSection.sectionKey === "resources_catalogs" &&
            (() => {
              let cards: {
                title: string;
                version: string;
                description: string;
                fileSize: string;
                fileIcon: string;
                downloadUrl: string;
              }[] = [];
              try {
                const p = JSON.parse(editingSection.content);
                if (Array.isArray(p)) cards = p;
              } catch {}
              while (cards.length < 3) {
                cards.push({
                  title: "",
                  version: "",
                  description: "",
                  fileSize: "",
                  fileIcon: "picture_as_pdf",
                  downloadUrl: "",
                });
              }

              const update = (next: typeof cards) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Catálogos destacados (3 máx.)
                  </label>
                  {cards.map((card, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 space-y-2"
                    >
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        Catálogo {i + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={card.title}
                          onChange={(e) => {
                            const n = [...cards];
                            n[i] = { ...n[i], title: e.target.value };
                            update(n);
                          }}
                          placeholder="Título"
                          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                        <input
                          value={card.version}
                          onChange={(e) => {
                            const n = [...cards];
                            n[i] = { ...n[i], version: e.target.value };
                            update(n);
                          }}
                          placeholder="Versión (ej: V2.1)"
                          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => {
                          const n = [...cards];
                          n[i] = { ...n[i], description: e.target.value };
                          update(n);
                        }}
                        placeholder="Descripción breve..."
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={card.fileSize}
                          onChange={(e) => {
                            const n = [...cards];
                            n[i] = { ...n[i], fileSize: e.target.value };
                            update(n);
                          }}
                          placeholder="Tamaño (ej: 18.5 MB)"
                          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                        <input
                          value={card.fileIcon}
                          onChange={(e) => {
                            const n = [...cards];
                            n[i] = { ...n[i], fileIcon: e.target.value };
                            update(n);
                          }}
                          placeholder="Icono (picture_as_pdf)"
                          className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                      </div>
                      <input
                        value={card.downloadUrl}
                        onChange={(e) => {
                          const n = [...cards];
                          n[i] = { ...n[i], downloadUrl: e.target.value };
                          update(n);
                        }}
                        placeholder="URL de descarga"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

          {/* ── TDS Table Editor (resources_table) ── */}
          {editingSection.sectionKey === "resources_table" &&
            (() => {
              let rows: {
                icon: string;
                iconColor: string;
                name: string;
                reference: string;
                category: string;
                date: string;
                downloadUrl: string;
              }[] = [];
              try {
                const p = JSON.parse(editingSection.content);
                if (Array.isArray(p)) rows = p;
              } catch {}

              const update = (next: typeof rows) =>
                handleChange("content", JSON.stringify(next));

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Filas TDS ({rows.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        update([
                          ...rows,
                          {
                            icon: "description",
                            iconColor: "blue",
                            name: "",
                            reference: "",
                            category: "",
                            date: "",
                            downloadUrl: "",
                          },
                        ])
                      }
                      className="flex items-center gap-1 text-xs text-[#0d40a5] hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Añadir fila
                    </button>
                  </div>
                  <div className="space-y-3">
                    {rows.map((row, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">
                            Fila {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => update(rows.filter((_, idx) => idx !== i))}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                        <input
                          value={row.name}
                          onChange={(e) => {
                            const n = [...rows];
                            n[i] = { ...n[i], name: e.target.value };
                            update(n);
                          }}
                          placeholder="Nombre del documento"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={row.reference}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], reference: e.target.value };
                              update(n);
                            }}
                            placeholder="Referencia (TDS-001)"
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={row.category}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], category: e.target.value };
                              update(n);
                            }}
                            placeholder="Categoría (CLÍNICO)"
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={row.date}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], date: e.target.value };
                              update(n);
                            }}
                            placeholder="Fecha (12 Oct 2024)"
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={row.downloadUrl}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], downloadUrl: e.target.value };
                              update(n);
                            }}
                            placeholder="URL descarga"
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <input
                            value={row.icon}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], icon: e.target.value };
                              update(n);
                            }}
                            placeholder="Icono (picture_as_pdf)"
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                          />
                          <select
                            value={row.iconColor}
                            onChange={(e) => {
                              const n = [...rows];
                              n[i] = { ...n[i], iconColor: e.target.value };
                              update(n);
                            }}
                            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none bg-white"
                          >
                            <option value="red">Rojo</option>
                            <option value="green">Verde</option>
                            <option value="blue">Azul</option>
                            <option value="yellow">Amarillo</option>
                            <option value="purple">Morado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* ── Expert Editor (about_team) ── */}
          {editingSection.sectionKey === "about_team" &&
            (() => {
              let experts: {
                name: string;
                role: string;
                description: string;
                imageUrl: string;
              }[] = [];
              try {
                const p = JSON.parse(editingSection.content);
                if (Array.isArray(p)) experts = p;
              } catch {
                experts = [];
              }

              const updateExpert = (
                idx: number,
                field: string,
                val: string,
              ) => {
                const updated = [...experts];
                updated[idx] = { ...updated[idx], [field]: val };
                handleChange("content", JSON.stringify(updated));
              };
              // Keep ref fresh so gallery modal can call it
              expertUpdateRef.current = updateExpert;

              const uploadExpertImage = async (
                e: React.ChangeEvent<HTMLInputElement>,
                idx: number,
              ) => {
                const file = e.target.files?.[0];
                if (!file) return;
                e.target.value = "";
                const fd = new FormData();
                fd.append("image", file);
                try {
                  const res = await fetch(`${BACKEND_URL}/api/uploads`, {
                    method: "POST",
                    body: fd,
                  });
                  if (!res.ok) throw new Error();
                  const result: { url: string } = await res.json();
                  const fullUrl = result.url.startsWith("/uploads/")
                    ? `${BACKEND_URL}${result.url}`
                    : result.url;
                  updateExpert(idx, "imageUrl", fullUrl);
                } catch {
                  /* silently ignore */
                }
              };

              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Expertos del equipo
                  </label>
                  <div className="space-y-5">
                    {experts.map((expert, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <span className="text-xs font-semibold text-gray-600">
                          Experto {i + 1}
                        </span>
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {expert.imageUrl ? (
                              <img
                                src={expert.imageUrl}
                                alt={expert.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-slate-400 text-[10px]">
                                  Sin foto
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex gap-2 flex-wrap">
                              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Upload className="w-3 h-3" /> Subir foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => uploadExpertImage(e, i)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setExpertGalleryIdx(i)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <Image className="w-3 h-3" /> Galería
                              </button>
                            </div>
                            <input
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg"
                              value={expert.imageUrl}
                              onChange={(e) =>
                                updateExpert(i, "imageUrl", e.target.value)
                              }
                              placeholder="URL de la imagen"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Nombre
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={expert.name}
                              onChange={(e) =>
                                updateExpert(i, "name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Cargo
                            </label>
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                              value={expert.role}
                              onChange={(e) =>
                                updateExpert(i, "role", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Descripción
                          </label>
                          <textarea
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg resize-none"
                            rows={2}
                            value={expert.description}
                            onChange={(e) =>
                              updateExpert(i, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* ── Mission Segments (about_mission) ── */}
          {editingSection.sectionKey === "about_mission" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto de misión con colores
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Array JSON de segmentos:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {`[{"text":"...","color":"#hex o accent"}]`}
                </code>
                . Omitir <code className="bg-gray-100 px-1 rounded">color</code>{" "}
                para texto blanco/heredado.
              </p>
              <textarea
                rows={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                value={editingSection.titleSegments ?? ""}
                onChange={(e) => handleChange("titleSegments", e.target.value)}
              />
            </div>
          )}

          {/* Texto del botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto del botón
            </label>
            <input
              type="text"
              value={editingSection.buttonText || ""}
              onChange={(e) => handleChange("buttonText", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="Texto del botón (opcional)"
            />
          </div>

          {/* Enlace del botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace del botón
            </label>
            <input
              type="text"
              value={editingSection.buttonLink || ""}
              onChange={(e) => handleChange("buttonLink", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="URL del enlace (opcional)"
            />
          </div>

          {/* Botón 2 */}
          {[
            "products_hero",
            "home_video_hero",
            "about_hero",
            "products_cta",
            "categories_hero",
            "resources_hero",
            "resources_cta",
          ].includes(editingSection.sectionKey) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto Botón 2
                </label>
                <input
                  type="text"
                  value={editingSection.button2Text || ""}
                  onChange={(e) => handleChange("button2Text", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                  placeholder="Ej: La Ciencia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Botón 2
                </label>
                <input
                  type="text"
                  value={editingSection.button2Link || ""}
                  onChange={(e) => handleChange("button2Link", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                  placeholder="/about"
                />
              </div>
            </>
          )}

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden
            </label>
            <input
              type="number"
              value={editingSection.order}
              onChange={(e) =>
                handleChange("order", parseInt(e.target.value) || 0)
              }
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
            />
          </div>

          {/* Activo */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingSection.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="w-4 h-4 text-[#0d40a5] border-gray-300 rounded focus:ring-[#0d40a5]"
              />
              <span className="text-sm font-medium text-gray-700">
                Sección visible
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={savingSliders || savingProducts}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingSliders || savingProducts
              ? "Guardando..."
              : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Modal de galería de imágenes */}
      {(showImageGallery !== null || expertGalleryIdx !== null) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Seleccionar Imagen
              </h3>
              <button
                onClick={() => {
                  setShowImageGallery(null);
                  setExpertGalleryIdx(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      if (expertGalleryIdx !== null) {
                        expertUpdateRef.current?.(expertGalleryIdx, "imageUrl", image.src);
                        setExpertGalleryIdx(null);
                      } else {
                        selectImageFromGallery(showImageGallery!, image.src);
                      }
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-lg border group-hover:border-[#0d40a5] transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm truncate">
                        {image.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {galleryImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Cargando imágenes...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
