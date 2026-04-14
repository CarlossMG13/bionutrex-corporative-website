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

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  pieces?: number;
  grams?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface TechnicalResource {
  id: string;
  title: string;
  reference?: string;
  category: string;
  productLine?: string;
  description?: string;
  fileUrl?: string;
  icon: string;
  iconColor: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  createdAt: string;
  _count?: { orders: number };
}

export interface OrderItem {
  id: number;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: number;
  paymentIntentId?: string;
  status: string;
  paid: boolean;
  total: number;
  fullName: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  reviewCount?: number;
  images?: string;
  ingredients?: string;
  longDescription?: string;
  features?: string;
  featured: boolean;
  featuredOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
}
