export interface TitleSegment {
  text: string;
  newlineBefore?: boolean;
  color?: string; // hex "#ff0000" o la palabra "accent" (usa accentColor del slide)
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface SliderStat {
  value: string; // "150K+"
  label: string; // "Athletes Fueled"
}

export interface Slider {
  id: string;
  title: string;
  titleSegments?: string; // JSON serializado de TitleSegment[]
  subtitle?: string;
  description?: string;
  label?: string;
  mediaType: string; // "image" | "video"
  imageUrl: string;
  videoUrl?: string;
  videoMuted?: boolean;
  accentColor?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  stats?: string; // JSON serializado de SliderStat[]
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  images?: SectionImage[];
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  active: boolean;
  order: number;
  // Campos hero
  titleSegments?: string; // JSON de TitleSegment[]
  accentColor?: string;
  mediaType?: string; // "image" | "video"
  videoUrl?: string;
  videoMuted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SectionImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  badge?: string;
  badgeColor?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  featuredOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
