import axios from "axios";
import type {
  Slider,
  HomeSection,
  BlogPost,
  AuthResponse,
  Product,
  TechnicalResource,
  CustomerUser,
} from "@/types";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Config Axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de Supabase Auth
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }),

  verifyToken: () => api.get("/auth/verify"),
};

// Sliders
export const sliderAPI = {
  getAll: () => api.get<Slider[]>("/sliders"),

  getAllAdmin: () => api.get<Slider[]>("/sliders/admin/all"),

  getById: (id: string) => api.get<Slider>(`/sliders/${id}`),

  create: (formData: FormData) =>
    api.post<Slider>("/sliders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    api.put<Slider>(`/sliders/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/sliders/${id}`),
};

// Home Sections
// Key = Cada seccion de la pagina: hero, about, services, etc.
export const homeSectionAPI = {
  getAll: () => api.get<HomeSection[]>("/home-sections"),

  getAllAdmin: () => api.get<HomeSection[]>("/home-sections/admin/all"),

  getByKey: (key: string) => api.get<HomeSection>(`/home-sections/key/${key}`),

  create: (formData: FormData) =>
    api.post<HomeSection>("/home-sections", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    api.put<HomeSection>(`/home-sections/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Método específico para actualizar con JSON (incluye imágenes)
  updateWithJSON: (id: string, data: Partial<HomeSection>) =>
    api.put<HomeSection>(`/home-sections/${id}`, data),

  delete: (id: string) => api.delete(`/home-sections/${id}`),
};

// Blog Posts
export const blogPostAPI = {
  getAll: () => api.get<BlogPost[]>("/blog-posts"),

  getAllAdmin: () => api.get<BlogPost[]>("/blog-posts/admin/all"),

  getBySlug: (slug: string) => api.get<BlogPost>(`/blog-posts/slug/${slug}`),

  create: (formData: FormData) =>
    api.post<BlogPost>("/blog-posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    api.put<BlogPost>(`/blog-posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/blog-posts/${id}`),
};

export const productAPI = {
  getAll: () => api.get<Product[]>("/products"),
  getAllAdmin: () => api.get<Product[]>("/products/admin/all"),
  getFeatured: () => api.get<Product[]>("/products/featured"),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (formData: FormData) =>
    api.post<Product>("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    api.put<Product>(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get("/categories"),
  create: (data: { name: string; slug: string }) =>
    api.post("/categories", data),
};

export const technicalResourceAPI = {
  getAll: () => api.get<TechnicalResource[]>("/technical-resources"),
  getAllAdmin: () => api.get<TechnicalResource[]>("/technical-resources/admin/all"),
  create: (formData: FormData) =>
    api.post<TechnicalResource>("/technical-resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    api.put<TechnicalResource>(`/technical-resources/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/technical-resources/${id}`),
};

export const cartAPI = {
  getCart: () => api.get("/cart"),
  addItem: (productId: string) => api.post(`/cart/add/${productId}`),
  removeItem: (productId: string) => api.post(`/cart/remove/${productId}`),
  deleteItem: (productId: string) => api.delete(`/cart/item/${productId}`),
  clearCart: () => api.delete("/cart"),
};

// ─── Customer Auth API ───────────────────────────────────────────────────────

/**
 * Llama al backend con el token de Supabase ya en el interceptor.
 * El backend hace upsert del User y marca el email como verificado.
 */
export const userAPI = {
  /** Obtiene el perfil del cliente autenticado */
  getMe: () => api.get<CustomerUser>("/users/me"),

  /**
   * Sincroniza el User en la BD (llámalo después del primer SIGNED_IN post-verificación).
   * Envía el email de bienvenida la primera vez.
   */
  sync: () => api.post<{ user: CustomerUser; isNew: boolean }>("/users/sync"),

  /** Actualiza nombre, teléfono o imagen del perfil */
  updateMe: (data: { name?: string; phone?: string; image?: string }) =>
    api.put<CustomerUser>("/users/me", data),

  /** Pedidos del cliente */
  getMyOrders: () => api.get("/users/me/orders"),
};

export default api;
