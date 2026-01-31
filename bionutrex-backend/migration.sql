-- Crear tabla para imágenes de sección
CREATE TABLE IF NOT EXISTS "section_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "section_images_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "home_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insertar imágenes de ejemplo para las secciones existentes
-- Asumiendo que ya hay secciones con estos IDs en tu base de datos

-- Para la sección hero (asumiendo ID 1)
-- INSERT INTO "section_images" ("id", "url", "alt", "caption", "order", "sectionId") 
-- VALUES ('hero-img-1', '/images/heroSection-img.jpg', 'Imagen de fondo hero', '', 0, '1')
-- ON CONFLICT DO NOTHING;

-- Para la sección methodology (asumiendo ID 3)
-- INSERT INTO "section_images" ("id", "url", "alt", "caption", "order", "sectionId") 
-- VALUES ('methodology-img-1', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBK9y955Ko1Nefm9TJwmPBX1KfmDtPe-CJnpqoRL600xNDWCsT3Sez7XbBaq2y1U0EMgEQT5qCjcJsDuhkpg-suJSmnyonuBaOK64xYvKr2SoJbqQh-Xa7H2UDdu0TukJoXh2L9W1wUZJzwjW1QutdpZLGvekN52aPk2MllgWy9T3xOD6kTIqXj4tMjbduDsgi8ZAexkyB6wKwkaZELHrD491RAbgsM5T8jOvxeUzad7YfyhZXIUFnbjamttApQAYxKPEvpAJanLEE', 'Científico farmacéutico trabajando en sala limpia', '', 0, '3')
-- ON CONFLICT DO NOTHING;

-- Para la sección blog (asumiendo ID 4)
-- INSERT INTO "section_images" ("id", "url", "alt", "caption", "order", "sectionId") 
-- VALUES 
-- ('blog-img-1', '/images/img1-grid-product.jpg', 'Suplementos de salud celular', '', 0, '4'),
-- ('blog-img-2', '/images/img2-grid-product.jpg', 'Productos de mejora cognitiva', '', 1, '4'),
-- ('blog-img-3', '/images/img3-grid-product.jpg', 'Fórmulas de apoyo metabólico', '', 2, '4')
-- ON CONFLICT DO NOTHING;