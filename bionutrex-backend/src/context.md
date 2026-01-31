
### **🎯 ¿Qué es BioNutrex?**
Es un **sitio web corporativo** para una empresa de biotecnología especializada en **suplementos naturales y nutricionales**. La empresa se posiciona como líder en biotecnología con productos de "alta potencia y estándares farmacéuticos".

---

## **🏗️ Arquitectura del Proyecto**

### **Frontend (bionutrex-frontend/)**
- **Tecnología**: React 19 + TypeScript + Vite
- **Estilos**: TailwindCSS con tema personalizado
- **Navegación**: React Router
- **Estado**: React Query para datos del servidor
- **Formularios**: React Hook Form + Zod

### **Backend (bionutrex-backend/)**
- **Tecnología**: Node.js + Express
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT + bcryptjs
- **Upload de archivos**: Multer

---

## **📁 Estructura Detallada del Frontend**

### **🌐 Páginas Públicas (`src/pages/`)**
1. **Home.tsx** - Página principal con 4 secciones:
   - **Hero**: "Ciencia Avanzada. Pureza Natural."
   - **Quality**: Información de calidad
   - **Methodology**: Metodología de la empresa
   - **Blog**: Sección de artículos

2. **`About.tsx`** - Página "Sobre nosotros" (comentada)
3. **`Blog.tsx`** - Lista de artículos del blog
4. **`BlogPostPage.tsx`** - Vista individual de artículos

### **🔐 Panel Administrativo (`src/pages/admin/`)**
1. **`Login.tsx`** - Autenticación de administradores
2. **`Dashboard.tsx`** - Panel principal (comentado)
3. **`HomeEditor.tsx`** - Editor del contenido de la página principal

### **🧩 Componentes por Categorías**

#### **🏠 Componentes de Home (`src/components/home/`)**
- HeroSection.tsx - Banner principal
- `QualitySection.tsx` - Sección de calidad
- `MethodologySection.tsx` - Metodología
- `BlogSection.tsx` - Preview del blog

#### **📰 Componentes de Blog (`src/components/blog/`)**
- `BlogCard.tsx` - Tarjeta de artículo
- `BlogList.tsx` - Lista de artículos
- `BlogPost.tsx` - Vista completa del artículo

#### **⚙️ Panel Administrativo (`src/components/Admin/`)**
- `AdminLayout.tsx` - Layout del panel
- `AdminSidebar.tsx` - Navegación lateral
- `AdminTopbar.tsx` - Barra superior
- `EditPanel.tsx` - Panel de edición

#### **🔧 Componentes Compartidos (`src/components/shared/`)**
- `Navbar.tsx` - Navegación principal
- `Footer.tsx` - Pie de página
- `Loading.tsx` - Indicador de carga

---

## **📊 Gestión de Datos**

### **Tipos de Datos (index.ts)**
1. **`Slider`** - Carrusel de imágenes del hero
2. **`HomeSection`** - Secciones editables de la página principal
3. **`BlogPost`** - Artículos del blog
4. **`Admin`** - Usuarios administradores

### **API Services (api.ts)**
- **Autenticación**: Login/registro
- **Sliders**: CRUD de carrusel
- **Home Sections**: CRUD de secciones
- **Blog Posts**: CRUD de artículos

---

## **🎨 Características de Diseño**

- **Tema**: Profesional con colores azul corporativo (`#0d40a5`)
- **Tipografía**: 
  - Playfair Display (elegante, para títulos)
  - Raleway (moderna, para texto)
- **Efectos**: 
  - Smooth scrolling con Lenis
  - Animaciones con Tailwind
  - Notificaciones con Sonner

---

## **🔄 Flujo de la Aplicación**

### **Usuario Público:**
1. Visita la página principal
2. Ve información de la empresa
3. Puede leer el blog
4. Navega entre secciones

### **Administrador:**
1. Se loguea en `/admin/login`
2. Accede al panel administrativo
3. Puede editar contenido de la página principal
4. Gestiona artículos del blog
5. Administra sliders y secciones

---

## **🚀 Estado Actual**

### **✅ Implementado:**
- Estructura básica del frontend
- Página principal con 4 secciones
- Sistema de autenticación
- Componentes base del admin
- Conexión con API backend
- Backend con Prisma

### **🚧 En Desarrollo:**
- Panel administrativo (rutas comentadas)
- Editor de contenido dinámico
- Sistema completo de blog


### **📋 Funcionalidades Planeadas:**
- Gestión de productos
- Datos clínicos
- Biblioteca de medios
- Gestión de usuarios

Este es un **CMS (Content Management System) corporativo** diseñado específicamente para que BioNutrex pueda gestionar su presencia digital y contenido de manera profesional.