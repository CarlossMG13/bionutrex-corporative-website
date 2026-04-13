import { supabase } from "./supabase.js";
import path from "path";

export const BUCKETS = {
  CMS: "cms-assets",      // Fotos del sitio: sliders, secciones, blog, recursos
  PRODUCTS: "products",   // Imágenes de productos: products/{productId}/img.webp
};

/**
 * Sube un archivo a Supabase Storage.
 * @param {Buffer} buffer  - Contenido del archivo en memoria
 * @param {string} bucket  - Nombre del bucket (usar BUCKETS.CMS o BUCKETS.PRODUCTS)
 * @param {string} folder  - Carpeta dentro del bucket (e.g. "sliders", "productId")
 * @param {string} originalName - Nombre original del archivo para preservar extensión
 * @param {string} mimetype - MIME type del archivo
 * @returns {string} URL pública del archivo
 */
export async function uploadFile(buffer, bucket, folder, originalName, mimetype) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
  const filename = `${base}-${Date.now()}${ext}`;
  const filePath = folder ? `${folder}/${filename}` : filename;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload error: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Elimina un archivo de Supabase Storage a partir de su URL pública.
 * @param {string} publicUrl - URL pública devuelta al subir
 */
export async function deleteFile(publicUrl) {
  try {
    // Extraer bucket y path desde la URL
    // Formato: .../storage/v1/object/public/{bucket}/{path}
    const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (!match) return; // URL no reconocida, ignorar

    const [, bucket, filePath] = match;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) console.error("Storage delete error:", error.message);
  } catch (err) {
    console.error("deleteFile error:", err.message);
  }
}
