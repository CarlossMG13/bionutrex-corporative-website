# 🚀 BioNutrex - Setup Instructions

## Requisitos Previos
- PostgreSQL debe estar ejecutándose en `localhost:5432`
- Base de datos `bionutrex_db` debe existir

## Pasos para Iniciar la Aplicación

### 1️⃣ Iniciar el Backend

Abre una terminal y ejecuta:

```bash
cd /home/andres/dev/bionutrex-corporative-website/bionutrex-backend
npm run dev
```

Deberías ver este mensaje:
```
✅ BioNutrex API server running on port 3001
📱 Health check: http://localhost:3001/api/health
🎉 Server is ready to receive requests!
```

**NO CIERRES ESTA TERMINAL**

### 2️⃣ Iniciar el Frontend

Abre OTRA terminal (nueva ventana o tab) y ejecuta:

```bash
cd /home/andres/dev/bionutrex-corporative-website/bionutrex-frontend
npm run dev
```

Deberías ver algo como:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 3️⃣ Acceder a la Aplicación

Abre tu navegador y ve a:
- **Sitio principal**: http://localhost:5173/
- **Admin Panel**: http://localhost:5173/admin

### 4️⃣ Credenciales de Prueba

```
Email: admin@bionutrex.com
Password: admin123
```

## Variables de Entorno

### Backend (.env)
```
PORT=3001
JWT_SECRET=bionutrex-secret-key-development-2024
DATABASE_URL="postgresql://postgres:password@localhost:5432/bionutrex_db?schema=public"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### El backend se cuelga al iniciar
- Verifica que PostgreSQL está corriendo: `ps aux | grep postgres`
- Verifica la conexión a la BD: `psql postgresql://postgres:password@localhost:5432/bionutrex_db`
- Si faltan tablas, ejecuta: `npx prisma db seed`

### El frontend muestra "Cargando..."
- Abre la consola del navegador (F12 → Console)
- Verifica que dice `VITE_API_URL` en el network tab
- Confirma que el backend está respondiendo en http://localhost:3001/api/health

### Login no funciona
- Verifica en el navegador: F12 → Network tab
- Mira si las peticiones a `/api/auth/login` retornan 200
- Revisa el backend log para errores de Prisma

## Funcionalidades Implementadas

✅ **Autenticación**
- Login seguro con JWT
- Validación de tokens

✅ **Gestión de Productos** (Admin)
- CRUD completo de productos
- Galería visual de imágenes
- Gestión de variantes (precios, stock, dimensiones)
- Categorías de productos
- Búsqueda y filtrado

✅ **Gestión de Contenido**
- Sliders
- Secciones del home
- Blog posts

## Próximas Mejoras

- [ ] Autenticación con 2FA
- [ ] Roles y permisos granulares
- [ ] Exportación de datos
- [ ] Sistema de comentarios en blog
- [ ] Recomendaciones de productos
