import React from "react";
import { Check } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  url: string;
}

interface ImageGallerySelectorProps {
  files: MediaFile[];
  selectedUrl: string;
  onSelect: (url: string) => void;
}

const ImageGallerySelector: React.FC<ImageGallerySelectorProps> = ({
  files,
  selectedUrl,
  onSelect,
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay imágenes en la biblioteca de medios
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative cursor-pointer group"
          onClick={() => onSelect(file.url)}
        >
          {/* Contenedor de imagen */}
          <div
            className={`relative overflow-hidden rounded-lg border-2 transition-all ${
              selectedUrl === file.url
                ? "border-blue-600 ring-2 ring-blue-400"
                : "border-gray-300 group-hover:border-blue-400"
            }`}
          >
            {/* Imagen */}
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/128x128?text=Error";
              }}
            />

            {/* Overlay oscuro en hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />

            {/* Checkmark cuando está seleccionada */}
            {selectedUrl === file.url && (
              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                <div className="bg-blue-600 rounded-full p-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Nombre del archivo */}
          <p className="text-xs text-gray-600 mt-1 truncate text-center">
            {file.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ImageGallerySelector;
