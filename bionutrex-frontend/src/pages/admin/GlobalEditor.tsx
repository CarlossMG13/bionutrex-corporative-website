import { useState } from "react";
import {
  Navigation2,
  Footprints,
  Save,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  loadNavMenu,
  saveNavMenu,
  type NavMenuSection,
  type NavFeatured,
} from "@/data/navMenuData";
import {
  loadFooter,
  saveFooter,
  type FooterData,
} from "@/data/footerData";

type Tab = "navbar" | "footer";

const EMPTY_FEATURED: NavFeatured = {
  image: "",
  badge: "",
  title: "",
  description: "",
  cta: "",
  href: "/",
};

export default function GlobalEditor() {
  const [activeTab, setActiveTab] = useState<Tab>("navbar");
  const [navSections, setNavSections] = useState<NavMenuSection[]>(loadNavMenu);
  const [selectedKey, setSelectedKey] = useState<string>(
    navSections[0]?.key ?? "",
  );
  const [footer, setFooter] = useState<FooterData>(loadFooter);

  const selectedSection = navSections.find((s) => s.key === selectedKey);

  const updateSection = (updatedSection: NavMenuSection) => {
    setNavSections((prev) =>
      prev.map((s) => (s.key === updatedSection.key ? updatedSection : s)),
    );
  };

  const handleSave = () => {
    if (activeTab === "navbar") {
      saveNavMenu(navSections);
    } else {
      saveFooter(footer);
    }
    toast.success("Cambios guardados. Recarga el sitio para verlos.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor Global</h1>
          <p className="text-gray-500 mt-1">
            Gestiona el contenido del Navbar y Footer
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("navbar")}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "navbar"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Navigation2 className="w-4 h-4" />
            Navbar
          </button>
          <button
            onClick={() => setActiveTab("footer")}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "footer"
                ? "border-[#0d40a5] text-[#0d40a5]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Footprints className="w-4 h-4" />
            Footer
          </button>
        </nav>
      </div>

      {/* NAVBAR TAB */}
      {activeTab === "navbar" && (
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Left: Nav sections list */}
          <div className="space-y-1">
            <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-3 px-3">
              Secciones
            </p>
            {navSections.map((section) => (
              <button
                key={section.key}
                onClick={() => setSelectedKey(section.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedKey === section.key
                    ? "bg-[#0d40a5] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {section.label}
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Right: Edit form for selected section */}
          {selectedSection && (
            <div className="space-y-6">
              {/* Subcategorías */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Subcategorías — {selectedSection.label}
                </h3>
                <div className="space-y-3">
                  {selectedSection.subcategories.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center"
                    >
                      <input
                        value={item.label}
                        onChange={(e) => {
                          const updated = { ...selectedSection };
                          updated.subcategories = updated.subcategories.map(
                            (s, i) =>
                              i === idx ? { ...s, label: e.target.value } : s,
                          );
                          updateSection(updated);
                        }}
                        placeholder="Título"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                      <input
                        value={item.description}
                        onChange={(e) => {
                          const updated = { ...selectedSection };
                          updated.subcategories = updated.subcategories.map(
                            (s, i) =>
                              i === idx
                                ? { ...s, description: e.target.value }
                                : s,
                          );
                          updateSection(updated);
                        }}
                        placeholder="Descripción"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                      <input
                        value={item.href}
                        onChange={(e) => {
                          const updated = { ...selectedSection };
                          updated.subcategories = updated.subcategories.map(
                            (s, i) =>
                              i === idx ? { ...s, href: e.target.value } : s,
                          );
                          updateSection(updated);
                        }}
                        placeholder="URL (ej. /productos)"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = { ...selectedSection };
                          updated.subcategories = updated.subcategories.filter(
                            (_, i) => i !== idx,
                          );
                          updateSection(updated);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const updated = { ...selectedSection };
                    updated.subcategories = [
                      ...updated.subcategories,
                      {
                        id: `${Date.now()}`,
                        label: "",
                        description: "",
                        href: "/",
                      },
                    ];
                    updateSection(updated);
                  }}
                  className="mt-3 flex items-center gap-2 text-sm text-[#0d40a5] hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Agregar subcategoría
                </button>
              </div>

              {/* Contenidos Destacados — array de hasta 3 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Contenidos Destacados (derecha) —{" "}
                    <span className="text-gray-400 font-normal">
                      {selectedSection.featured.length}/3
                    </span>
                  </h3>
                  {selectedSection.featured.length < 3 && (
                    <button
                      onClick={() => {
                        const updated = { ...selectedSection };
                        updated.featured = [
                          ...updated.featured,
                          { ...EMPTY_FEATURED },
                        ];
                        updateSection(updated);
                      }}
                      className="flex items-center gap-1.5 text-sm text-[#0d40a5] hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar destacado
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedSection.featured.map((feat, fi) => (
                    <div
                      key={fi}
                      className="border border-gray-100 rounded-lg p-4 relative"
                    >
                      {/* Remove button */}
                      {selectedSection.featured.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = { ...selectedSection };
                            updated.featured = updated.featured.filter(
                              (_, i) => i !== fi,
                            );
                            updateSection(updated);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <p className="text-xs font-semibold text-gray-500 mb-3">
                        Destacado #{fi + 1}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        {(
                          [
                            {
                              key: "badge",
                              label: "Badge / etiqueta",
                              placeholder: "Ej. Destacados",
                            },
                            {
                              key: "title",
                              label: "Título",
                              placeholder: "Título del panel",
                            },
                            {
                              key: "description",
                              label: "Descripción",
                              placeholder: "Texto breve",
                            },
                            {
                              key: "cta",
                              label: "Texto del botón",
                              placeholder: "Ej. Ver catálogo",
                            },
                            {
                              key: "href",
                              label: "URL del botón",
                              placeholder: "/productos",
                            },
                            {
                              key: "image",
                              label: "URL de imagen",
                              placeholder: "/images/foto.jpg",
                            },
                          ] as {
                            key: keyof NavFeatured;
                            label: string;
                            placeholder: string;
                          }[]
                        ).map(({ key, label, placeholder }) => (
                          <div
                            key={key}
                            className={key === "image" ? "col-span-2" : ""}
                          >
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {label}
                            </label>
                            <input
                              value={feat[key]}
                              onChange={(e) => {
                                const updated = { ...selectedSection };
                                updated.featured = updated.featured.map(
                                  (f, i) =>
                                    i === fi
                                      ? { ...f, [key]: e.target.value }
                                      : f,
                                );
                                updateSection(updated);
                              }}
                              placeholder={placeholder}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Preview thumbnail */}
                      {feat.image && (
                        <div className="mt-4 relative rounded-lg overflow-hidden h-28 bg-slate-100">
                          <img
                            src={feat.image}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-4">
                            <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#00e5ff]">
                              {feat.badge}
                            </span>
                            <p className="text-white text-sm font-black uppercase italic">
                              {feat.title}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER TAB */}
      {activeTab === "footer" && (
        <div className="space-y-6">
          {/* Tagline */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Tagline de Marca</h3>
            <textarea
              value={footer.tagline}
              onChange={(e) => setFooter((f) => ({ ...f, tagline: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
            />
          </div>

          {/* Social links */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Redes Sociales</h3>
              <button
                onClick={() =>
                  setFooter((f) => ({
                    ...f,
                    socialLinks: [...f.socialLinks, { platform: "", href: "/" }],
                  }))
                }
                className="flex items-center gap-1.5 text-sm text-[#0d40a5] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="space-y-3">
              {footer.socialLinks.map((social, si) => (
                <div key={si} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                  <input
                    value={social.platform}
                    onChange={(e) =>
                      setFooter((f) => ({
                        ...f,
                        socialLinks: f.socialLinks.map((s, i) =>
                          i === si ? { ...s, platform: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder="instagram / youtube / twitter / facebook"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                  />
                  <input
                    value={social.href}
                    onChange={(e) =>
                      setFooter((f) => ({
                        ...f,
                        socialLinks: f.socialLinks.map((s, i) =>
                          i === si ? { ...s, href: e.target.value } : s,
                        ),
                      }))
                    }
                    placeholder="https://instagram.com/bionutrex"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                  />
                  <button
                    onClick={() =>
                      setFooter((f) => ({
                        ...f,
                        socialLinks: f.socialLinks.filter((_, i) => i !== si),
                      }))
                    }
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footer.navColumns.map((col, ci) => (
            <div key={ci} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <input
                  value={col.title}
                  onChange={(e) =>
                    setFooter((f) => ({
                      ...f,
                      navColumns: f.navColumns.map((c, i) =>
                        i === ci ? { ...c, title: e.target.value } : c,
                      ),
                    }))
                  }
                  className="font-semibold text-gray-900 border-b border-gray-300 focus:border-[#0d40a5] outline-none text-sm w-48 pb-0.5"
                  placeholder="Título columna"
                />
                <span className="text-gray-400 text-xs">— Columna {ci + 1}</span>
              </div>
              <div className="space-y-2">
                {col.links.map((link, li) => (
                  <div key={li} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                    <input
                      value={link.label}
                      onChange={(e) =>
                        setFooter((f) => ({
                          ...f,
                          navColumns: f.navColumns.map((c, i) =>
                            i === ci
                              ? {
                                  ...c,
                                  links: c.links.map((l, j) =>
                                    j === li ? { ...l, label: e.target.value } : l,
                                  ),
                                }
                              : c,
                          ),
                        }))
                      }
                      placeholder="Texto del enlace"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                    />
                    <input
                      value={link.href}
                      onChange={(e) =>
                        setFooter((f) => ({
                          ...f,
                          navColumns: f.navColumns.map((c, i) =>
                            i === ci
                              ? {
                                  ...c,
                                  links: c.links.map((l, j) =>
                                    j === li ? { ...l, href: e.target.value } : l,
                                  ),
                                }
                              : c,
                          ),
                        }))
                      }
                      placeholder="URL"
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                    />
                    <button
                      onClick={() =>
                        setFooter((f) => ({
                          ...f,
                          navColumns: f.navColumns.map((c, i) =>
                            i === ci
                              ? { ...c, links: c.links.filter((_, j) => j !== li) }
                              : c,
                          ),
                        }))
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  setFooter((f) => ({
                    ...f,
                    navColumns: f.navColumns.map((c, i) =>
                      i === ci
                        ? { ...c, links: [...c.links, { label: "", href: "/" }] }
                        : c,
                    ),
                  }))
                }
                className="mt-3 flex items-center gap-2 text-sm text-[#0d40a5] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Agregar enlace
              </button>
            </div>
          ))}

          {/* Newsletter */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Newsletter</h3>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { key: "title", label: "Título" },
                  { key: "buttonLabel", label: "Texto del botón" },
                  { key: "placeholder", label: "Placeholder del campo" },
                ] as { key: keyof typeof footer.newsletter; label: string }[]
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    value={footer.newsletter[key]}
                    onChange={(e) =>
                      setFooter((f) => ({
                        ...f,
                        newsletter: { ...f.newsletter, [key]: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subtítulo
                </label>
                <textarea
                  value={footer.newsletter.subtitle}
                  onChange={(e) =>
                    setFooter((f) => ({
                      ...f,
                      newsletter: { ...f.newsletter, subtitle: e.target.value },
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Certificaciones</h3>
              <button
                onClick={() =>
                  setFooter((f) => ({
                    ...f,
                    certifications: [...f.certifications, ""],
                  }))
                }
                className="flex items-center gap-1.5 text-sm text-[#0d40a5] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {footer.certifications.map((cert, ci) => (
                <div key={ci} className="flex items-center gap-1">
                  <input
                    value={cert}
                    onChange={(e) =>
                      setFooter((f) => ({
                        ...f,
                        certifications: f.certifications.map((c, i) =>
                          i === ci ? e.target.value : c,
                        ),
                      }))
                    }
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none w-36"
                  />
                  <button
                    onClick={() =>
                      setFooter((f) => ({
                        ...f,
                        certifications: f.certifications.filter((_, i) => i !== ci),
                      }))
                    }
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Texto de Copyright</h3>
            <input
              value={footer.copyright}
              onChange={(e) => setFooter((f) => ({ ...f, copyright: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
