import { useState } from "react";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface Props {
  imageUrl: string;
  extraImages?: string; // JSON string[]
  productName: string;
}

export function ProductGallery({ imageUrl, extraImages, productName }: Props) {
  const extra: string[] = (() => {
    try { return JSON.parse(extraImages || "[]"); } catch { return []; }
  })();

  const allImages = [imageUrl, ...extra].filter(Boolean).slice(0, 4).map(resolveUrl);
  const [selected, setSelected] = useState(0);

  if (allImages.length === 0) return null;

  // Solo una imagen — ocupa todo el espacio
  if (allImages.length === 1) {
    return (
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={allImages[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 2-4 imágenes — principal grande + row de thumbnails
  const thumbCols =
    allImages.length === 2
      ? "grid-cols-2"
      : allImages.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 group">
        <img
          src={allImages[selected]}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      <div className={`grid ${thumbCols} gap-3`}>
        {allImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              selected === i
                ? "border-[#0d40a5] shadow-md"
                : "border-transparent opacity-60 hover:opacity-90"
            }`}
          >
            <img
              src={img}
              alt={`${productName} ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
