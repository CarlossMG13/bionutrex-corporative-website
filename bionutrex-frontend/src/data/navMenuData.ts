export interface NavSubItem {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface NavFeatured {
  image: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

export interface NavMenuSection {
  key: string;
  label: string;
  subcategories: NavSubItem[];
  featured: NavFeatured[];
}

export const DEFAULT_NAV_MENU: NavMenuSection[] = [
  {
    key: "nosotros",
    label: "Nosotros",
    subcategories: [
      {
        id: "n1",
        label: "Nuestra Historia",
        description: "Cómo nació BioNutrex",
        href: "/",
      },
      {
        id: "n2",
        label: "Equipo Científico",
        description: "Los investigadores detrás de cada fórmula",
        href: "/",
      },
      {
        id: "n3",
        label: "Certificaciones",
        description: "Estándares de grado farmacéutico",
        href: "/",
      },
      {
        id: "n4",
        label: "Instalaciones",
        description: "Laboratorios de última generación",
        href: "/",
      },
    ],
    featured: [
      {
        image: "/images/heroSection-img.jpg",
        badge: "Sobre nosotros",
        title: "Ciencia al servicio de tu bienestar",
        description: "Más de 10 años de investigación biotecnológica.",
        cta: "Conocer más",
        href: "/",
      },
    ],
  },
  {
    key: "productos",
    label: "Productos",
    subcategories: [
      {
        id: "p1",
        label: "Proteínas",
        description: "Alta pureza y máxima absorción",
        href: "/",
      },
      {
        id: "p2",
        label: "Pre-Entreno",
        description: "Energía y rendimiento explosivo",
        href: "/",
      },
      {
        id: "p3",
        label: "Recuperación",
        description: "Post-entreno de nivel avanzado",
        href: "/",
      },
      {
        id: "p4",
        label: "Vitaminas & Minerales",
        description: "Micronutrientes esenciales",
        href: "/",
      },
    ],
    featured: [
      {
        image: "/images/img1-grid-product.jpg",
        badge: "Destacados",
        title: "Fórmulas de grado farmacéutico",
        description: "Cada producto, respaldado por ciencia sólida.",
        cta: "Ver catálogo",
        href: "/",
      },
    ],
  },
  {
    key: "categorias",
    label: "Categorías",
    subcategories: [
      {
        id: "c1",
        label: "Ganancia Muscular",
        description: "Fórmulas para hipertrofia",
        href: "/",
      },
      {
        id: "c2",
        label: "Energía",
        description: "Rendimiento óptimo todo el día",
        href: "/",
      },
      {
        id: "c3",
        label: "Recuperación",
        description: "Vuelve más fuerte cada vez",
        href: "/",
      },
      {
        id: "c4",
        label: "Bienestar General",
        description: "Salud desde adentro hacia afuera",
        href: "/",
      },
    ],
    featured: [
      {
        image: "/images/MethImage.jpg",
        badge: "Categorías",
        title: "Encuentra tu fórmula ideal",
        description: "Líneas diseñadas para cada objetivo.",
        cta: "Explorar",
        href: "/",
      },
    ],
  },
  {
    key: "recursos",
    label: "Recursos",
    subcategories: [
      {
        id: "r1",
        label: "Guías de Nutrición",
        description: "Aprende a optimizar tu dieta",
        href: "/",
      },
      {
        id: "r2",
        label: "Protocolos de Suplementación",
        description: "Cuándo y cómo tomar cada suplemento",
        href: "/",
      },
      {
        id: "r3",
        label: "Estudios Clínicos",
        description: "Ciencia detrás de nuestros productos",
        href: "/",
      },
      {
        id: "r4",
        label: "Calculadora de Proteína",
        description: "Calcula tu necesidad diaria",
        href: "/",
      },
    ],
    featured: [
      {
        image: "/images/img2-grid-product.jpg",
        badge: "Recursos",
        title: "Conocimiento que transforma resultados",
        description: "Guías científicas para maximizar tu rendimiento.",
        cta: "Ver recursos",
        href: "/",
      },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    subcategories: [
      {
        id: "b1",
        label: "Últimas Publicaciones",
        description: "Artículos científicos recientes",
        href: "/",
      },
      {
        id: "b2",
        label: "Nutrición Deportiva",
        description: "Todo sobre suplementación avanzada",
        href: "/",
      },
      {
        id: "b3",
        label: "Biotecnología",
        description: "Innovación en suplementos naturales",
        href: "/",
      },
      {
        id: "b4",
        label: "Casos de Éxito",
        description: "Resultados reales de nuestros usuarios",
        href: "/",
      },
    ],
    featured: [
      {
        image: "/images/img3-grid-product.jpg",
        badge: "Blog",
        title: "Ciencia en cada artículo",
        description:
          "Las últimas investigaciones en biotecnología nutricional.",
        cta: "Leer blog",
        href: "/",
      },
    ],
  },
];

const STORAGE_KEY = "bionutrex_nav_menu";

export function loadNavMenu(): NavMenuSection[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_NAV_MENU;
    const parsed: NavMenuSection[] = JSON.parse(saved);
    // Migrate: if featured is a plain object (not array), wrap it
    return parsed.map((section) => ({
      ...section,
      featured: Array.isArray(section.featured)
        ? section.featured
        : [section.featured as unknown as NavFeatured],
    }));
  } catch {
    return DEFAULT_NAV_MENU;
  }
}

export function saveNavMenu(data: NavMenuSection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
