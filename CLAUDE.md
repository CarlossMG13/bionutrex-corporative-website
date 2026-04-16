# CLAUDE.md — Bionutrex Corporate Website

## Visión general

Sitio web corporativo de **Bionutrex**, marca de suplementos deportivos de alto rendimiento (México). Monorepo con frontend React + backend Node.js/Express. Incluye catálogo de productos, e-commerce con Stripe, panel de administración CMS, blog y recursos técnicos.

---

## Estructura del proyecto

```
bionutrex-corporative-website/
├── bionutrex-backend/       # API REST (Node.js + Express + Prisma)
├── bionutrex-frontend/      # SPA (React 19 + Vite + TypeScript)
├── CLAUDE.md                # Este archivo
├── SETUP.md
└── start-dev.sh
```

---

## Backend (`bionutrex-backend/`)

### Stack
- **Runtime**: Node.js (ESM modules, `"type": "module"`)
- **Framework**: Express 5
- **ORM**: Prisma 5.22 + PostgreSQL (Supabase cloud)
- **Auth**: Supabase Auth — JWT verificado en `src/middleware/auth.js` vía `supabase.auth.getUser(token)`
- **Storage**: Supabase Storage, bucket `cms-assets`
- **Pagos**: Stripe (`stripe` SDK)
- **Uploads**: Multer en memoria → sube directo a Supabase Storage

### Variables de entorno (`bionutrex-backend/.env`)
```
DATABASE_URL        # Supabase connection pooler URL
DIRECT_URL          # Supabase direct connection URL
SUPABASE_URL
SUPABASE_SERVICE_KEY
STRIPE_SECRET_KEY
SESSION_SECRET
FRONTEND_URL        # http://localhost:5173 en dev
PORT                # 3001 por defecto
```

### Comandos útiles
```bash
cd bionutrex-backend
npm run dev             # nodemon src/index.js
npm run db:migrate      # prisma migrate dev
npm run db:generate     # prisma generate
npm run db:studio       # prisma studio (UI de BD)
npm run db:seed         # seed inicial
```

### Rutas registradas
| Prefijo                   | Archivo                          |
|---------------------------|----------------------------------|
| `/api/auth`               | `src/routes/auth.js`             |
| `/api/sliders`            | `src/routes/sliders.js`          |
| `/api/home-sections`      | `src/routes/homeSections.js`     |
| `/api/blog-posts`         | `src/routes/blogPosts.js`        |
| `/api/products`           | `src/routes/products.js`         |
| `/api/categories`         | `src/routes/categories.js`       |
| `/api/technical-resources`| `src/routes/technicalResources.js`|
| `/api/cart`               | `src/routes/cart.js`             |
| `/api/checkout`           | `src/routes/checkout.js`         |
| `/api/admin/orders`       | `src/routes/admin-orders.js`     |

### Middleware de autenticación
- **Admin**: `authMiddleware` en `src/middleware/auth.js` — verifica JWT Supabase y expone `req.admin`
- **Usuario cliente**: Se debe crear `userAuthMiddleware` separado que resuelva `User` de la tabla `users` por `supabase_uid` o email

### Modelos Prisma (`prisma/schema.prisma`)
| Modelo            | PK tipo  | Notas clave                                      |
|-------------------|----------|--------------------------------------------------|
| `Admin`           | `cuid`   | Sólo en BD, auth real via Supabase Auth          |
| `User`            | `Int`    | Clientes; `email`, `name`, `phone`, `image`      |
| `Order`           | `Int`    | `paymentIntentId` de Stripe, `status`, `paid`    |
| `OrderItem`       | `Int`    | FK → `Order`, `Product`; `price`, `quantity`     |
| `Cart`            | `Int`    | 1:1 con `User`                                   |
| `CartItem`        | `Int`    | FK → `Cart`, `Product`; `quantity`               |
| `Product`         | `cuid`   | `images` (JSON str), `ingredients`, `features`   |
| `ProductVariant`  | `cuid`   | `price`, `stock`, `sku`, `pieces`, `grams`        |
| `Category`        | `cuid`   | `name`, `slug`                                   |
| `Slider`          | `cuid`   | Hero sliders del home, con `titleSegments` JSON  |
| `HomeSection`     | `cuid`   | Secciones CMS del home, clave única `sectionKey` |
| `BlogPost`        | `cuid`   | `slug` único, `published`, `views`               |
| `TechnicalResource`| `cuid` | Recursos técnicos/PDFs de productos              |

> **Pendiente de agregar**: `WishlistItem` (userId + productId) y `Review` (userId + productId + rating + comment)

---

## Frontend (`bionutrex-frontend/`)

### Stack
- **Framework**: React 19 + Vite + TypeScript
- **Routing**: React Router v7 (`react-router-dom`)
- **Estilos**: Tailwind CSS v4 (config en `vite.config.ts` con `@tailwindcss/vite`)
- **UI Components**: shadcn/ui (Radix), Lucide React icons, Material Symbols (CDN en `index.html`)
- **State / Data**: TanStack Query v5 para server state, Context API para estado global
- **HTTP**: Axios — instancia en `src/services/api.ts`, interceptor agrega Bearer token de Supabase
- **Auth (admin)**: `useAuth.ts` → `supabase.auth.getSession()` / `onAuthStateChange`
- **Animaciones**: Framer Motion, Lenis smooth scroll (`useLenis.tsx`)
- **Forms**: react-hook-form + Zod
- **Notificaciones**: Sonner (`<Toaster position="top-right" />`)
- **Pagos**: `@stripe/react-stripe-js`

### Variables de entorno (`bionutrex-frontend/.env`)
```
VITE_API_URL          # http://localhost:3001/api
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
```

### Comandos útiles
```bash
cd bionutrex-frontend
npm run dev    # vite dev server :5173
npm run build  # tsc + vite build
npm run lint
```

### Rutas de la app (`src/App.tsx`)
**Públicas:**
- `/` → `Home`
- `/about` → `About`
- `/products` → `Products`
- `/categories` → `Categories`
- `/resources` → `Resources`
- `/catalogo` → `Catalog`
- `/catalogo/:id` → `ProductDetail`
- `/checkout` → `Checkout`
- `/checkout/success` → `CheckoutSuccess`

**Admin** (bajo `/admin`, requieren `ProtectedRoute`):
- `dashboard`, `home`, `products`, `clinical`, `media`, `users`, `global`, `about`, `products-editor`, `categories-editor`, `resources-editor`, `orders`

### Contexts globales
| Context         | Archivo                        | Propósito                          |
|-----------------|--------------------------------|------------------------------------|
| `CartProvider`  | `contexts/CartContext.tsx`     | Items del carrito, totales         |
| `AdminProvider` | `contexts/AdminContext.tsx`    | Estado del panel admin             |
| `HomeDataProvider`| `contexts/HomeDataContext.tsx`| Datos CMS del home (sliders, etc.) |

> **Pendiente de agregar**: `AuthUserContext` (cliente logueado), `WishlistContext`

### Design system / tokens visuales
| Token           | Valor          | Uso                                      |
|-----------------|----------------|------------------------------------------|
| Primary blue    | `#0d40a5`      | CTAs, links, ratings, bordes activos     |
| Accent cyan     | `#00e5ff`      | Highlights, logo bolt, acentos           |
| Background      | `#EEEEEE`      | Fondo global de la app                   |
| Font principal  | Raleway        | `font-family` base del proyecto          |
| Headings        | `font-black tracking-tighter uppercase italic` | Estilo de títulos |

### Convenciones de código (frontend)
- Componentes en `PascalCase`, archivos `.tsx`
- Rutas API centralizadas en `src/services/api.ts` (nunca `fetch` inline)
- Tipos globales en `src/types/index.ts`
- Constantes en `src/utils/constants.ts`
- Hooks custom en `src/hooks/`
- Páginas en `src/pages/`, componentes en `src/components/<feature>/`
- shadcn/ui components en `src/components/ui/`

---

## Flujo de checkout (Stripe)

1. Frontend arma `items[]` con `productId`, `price`, `quantity`
2. `POST /api/checkout/payment-intent` → crea PaymentIntent en Stripe (datos en `metadata`)
3. `@stripe/react-stripe-js` renderiza formulario de pago
4. Al confirmar pago exitoso: `POST /api/checkout/confirm` con `paymentIntentId`
5. Backend verifica con Stripe, crea `Order` + `OrderItem[]` en BD
6. Frontend navega a `/checkout/success` via `react-router navigate(state=...)`

---

## Implementaciones en progreso

### 1. Página de Confirmación de Pedido (`/checkout/success`)
- **Estado actual**: `CheckoutSuccess.tsx` existe pero sólo consume `location.state` (se pierde al refrescar)
- **Pendiente**: Agregar llamada a `GET /api/checkout/order/:paymentIntentId` para hidratar datos desde la BD si no hay state. Mejorar UX con más detalles del pedido.

### 2. Wishlist por cliente
- **Backend**: Agregar modelo `WishlistItem` al schema Prisma + rutas `/api/wishlist` (GET, POST, DELETE)
- **Frontend**: `WishlistContext`, página `/wishlist`, botón "Agregar a wishlist" en `ProductCard` y `ProductInfo`
- **Requisito**: Cliente debe estar autenticado (`User`)

### 3. Reseñas de productos
- **Estado actual**: `ProductReviews.tsx` usa datos mock (`MOCK_REVIEWS`)
- **Backend**: Agregar modelo `Review` al schema Prisma + rutas `/api/reviews/:productId` (GET público, POST autenticado)
- **Frontend**: Reemplazar mocks con fetch real; agregar formulario de reseña para usuarios autenticados
- **Requisito**: Solo usuarios con perfil de cliente pueden escribir reseñas

---

## Autenticación de clientes (pendiente)

Actualmente la app tiene auth de **admin** (Supabase Auth → `useAuth.ts`) pero no tiene flujo completo de auth para **clientes**. Para Wishlist y Reviews se necesita:
- Endpoint `POST /api/users/register` y `POST /api/users/login` (o integrar Supabase Auth para clientes también)
- Hook `useCustomerAuth` o `AuthUserContext` que maneje la sesión del cliente
- `userAuthMiddleware` en el backend que resuelva el `User` de la tabla `users`

---

## Skills instaladas (`.claude/`)

| Skill                              | Uso principal                                    |
|------------------------------------|--------------------------------------------------|
| `creative-design/ui-ux-pro-max`    | Diseño de componentes, UX, sistemas visuales     |
| `development/senior-security`      | Auth, validación, seguridad de endpoints         |
| `development/senior-fullstack`     | Arquitectura, patrones, scaffolding              |
| `development/skill-creator`        | Meta: creación y evaluación de skills            |
