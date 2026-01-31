# BioNutrex Backend API

Backend API para la página corporativa de BioNutrex, construido con Node.js, Express, Prisma y PostgreSQL.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
cd bionutrex-backend
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:
```env
PORT=3001
JWT_SECRET=tu-clave-secreta-muy-segura
DATABASE_URL="postgresql://usuario:password@localhost:5432/bionutrex_db?schema=public"
```

### 3. Configurar PostgreSQL

#### Opción A: PostgreSQL local
1. Instala PostgreSQL en tu sistema
2. Crea una base de datos llamada `bionutrex_db`
3. Configura la URL en `.env`

#### Opción B: PostgreSQL con Docker
```bash
docker run --name bionutrex-postgres \
  -e POSTGRES_DB=bionutrex_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Configurar Prisma
```bash
# Generar el cliente de Prisma
npm run db:generate

# Sincronizar la base de datos con el schema
npm run db:push

# Ejecutar seed para datos iniciales
node prisma/seed.js
```

### 5. Iniciar el servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📁 Estructura del Proyecto

```
bionutrex-backend/
├── src/
│   ├── routes/           # Rutas de la API
│   │   ├── auth.js       # Autenticación
│   │   ├── sliders.js    # Sliders del hero
│   │   ├── homeSections.js # Secciones de la página principal
│   │   └── blogPosts.js  # Posts del blog
│   ├── middleware/       # Middlewares
│   │   ├── auth.js       # Middleware de autenticación
│   │   └── upload.js     # Middleware para subir archivos
│   ├── utils/           # Utilidades
│   │   ├── db.js        # Cliente de Prisma
│   │   └── helpers.js   # Funciones auxiliares
│   └── index.js         # Archivo principal del servidor
├── prisma/
│   ├── schema.prisma    # Schema de la base de datos
│   └── seed.js          # Datos iniciales
├── uploads/             # Archivos subidos
└── .env                 # Variables de entorno
```

## 🔗 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar admin
- `GET /verify` - Verificar token

### Sliders (`/api/sliders`)
- `GET /` - Obtener sliders activos (público)
- `GET /admin/all` - Obtener todos los sliders (admin)
- `GET /:id` - Obtener slider por ID
- `POST /` - Crear slider (admin)
- `PUT /:id` - Actualizar slider (admin)
- `DELETE /:id` - Eliminar slider (admin)

### Secciones de Home (`/api/home-sections`)
- `GET /` - Obtener secciones activas (público)
- `GET /admin/all` - Obtener todas las secciones (admin)
- `GET /key/:key` - Obtener sección por key
- `POST /` - Crear sección (admin)
- `PUT /:id` - Actualizar sección (admin)
- `DELETE /:id` - Eliminar sección (admin)

### Posts del Blog (`/api/blog-posts`)
- `GET /` - Obtener posts publicados (público)
- `GET /admin/all` - Obtener todos los posts (admin)
- `GET /slug/:slug` - Obtener post por slug
- `POST /` - Crear post (admin)
- `PUT /:id` - Actualizar post (admin)
- `DELETE /:id` - Eliminar post (admin)

## 🔒 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos:

1. Haz login en `/api/auth/login`
2. Incluye el token en el header: `Authorization: Bearer <token>`

## 📤 Subida de Archivos

Los endpoints que permiten subir archivos esperan `multipart/form-data` con el campo `image`:

```javascript
const formData = new FormData();
formData.append('title', 'Mi título');
formData.append('image', file);
// ... otros campos
```

Los archivos se guardan en `/uploads` y son accesibles via HTTP.

## 🗄️ Base de Datos

### Modelos principales:
- **Admin**: Usuarios administradores
- **Slider**: Carrusel de imágenes del hero
- **HomeSection**: Secciones editables de la página principal
- **BlogPost**: Artículos del blog

## 🛠️ Scripts disponibles

- `npm run dev` - Servidor de desarrollo
- `npm start` - Servidor de producción
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:push` - Sincronizar schema con BD
- `npm run db:migrate` - Crear migración
- `npm run db:studio` - Abrir Prisma Studio

## 🔑 Credenciales por defecto

Después del seed inicial:
- **Email**: admin@bionutrex.com
- **Password**: admin123

⚠️ **¡Cambia estas credenciales en producción!**

## 🌐 Integración con Frontend

El frontend React está configurado para conectarse a esta API. Asegúrate de que:

1. El backend esté corriendo en `http://localhost:3001`
2. Las variables de entorno del frontend apunten a la URL correcta
3. CORS esté configurado correctamente

## 📝 Notas de Desarrollo

- Las imágenes se sirven desde `/uploads`
- Los slugs se generan automáticamente para los posts del blog
- Las fechas se manejan en formato ISO
- La autenticación expira en 7 días
- Los archivos de imagen tienen un límite de 5MB