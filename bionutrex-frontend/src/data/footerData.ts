export interface FooterNavLink {
  label: string;
  href: string;
}

export interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

export interface FooterSocialLink {
  platform: string; // "instagram" | "twitter" | "youtube" | "facebook" | "tiktok"
  href: string;
}

export interface FooterNewsletter {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
}

export interface FooterData {
  tagline: string;
  socialLinks: FooterSocialLink[];
  navColumns: FooterNavColumn[];
  newsletter: FooterNewsletter;
  certifications: string[];
  copyright: string;
}

export const DEFAULT_FOOTER: FooterData = {
  tagline:
    "Science-backed nutrition engineered for peak performance athletes. Pharma-grade formulas, clinically validated.",
  socialLinks: [
    { platform: "instagram", href: "/" },
    { platform: "youtube", href: "/" },
    { platform: "twitter", href: "/" },
  ],
  navColumns: [
    {
      title: "Protocolos",
      links: [
        { label: "Activación Pre-Entreno", href: "/" },
        { label: "Combustible Intra-Entreno", href: "/" },
        { label: "Serie de Hipertrofia", href: "/" },
        { label: "Resíntesis & Sueño", href: "/" },
      ],
    },
    {
      title: "The Hub",
      links: [
        { label: "Resultados de Laboratorio", href: "/" },
        { label: "Equipo de Élite", href: "/about" },
        { label: "Blog de Rendimiento", href: "/" },
        { label: "Alianza Mayorista", href: "/" },
      ],
    },
  ],
  newsletter: {
    title: "Actualizaciones de Élite",
    subtitle: "Únete a +40K atletas. Protocolos, ciencia y lanzamientos exclusivos.",
    placeholder: "tu@email.com",
    buttonLabel: "Unirse",
  },
  certifications: ["GMP Certificado", "NSF Certificado", "ISO 9001", "Pharma Grade"],
  copyright: `© ${new Date().getFullYear()} Bionutrex. Todos los derechos reservados.`,
};

const STORAGE_KEY = "bionutrex_footer";

export function loadFooter(): FooterData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_FOOTER;
    return { ...DEFAULT_FOOTER, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_FOOTER;
  }
}

export function saveFooter(data: FooterData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
