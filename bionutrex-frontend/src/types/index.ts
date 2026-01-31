export interface Slider {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
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
  active: boolean;
  order: number;
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
