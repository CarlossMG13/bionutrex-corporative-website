import axios from "axios";
import type { Slider, HomeSection, BlogPost, AuthResponse } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Config Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

export default api;
