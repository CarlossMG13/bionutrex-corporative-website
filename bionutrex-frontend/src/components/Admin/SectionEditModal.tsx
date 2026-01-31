import { useState, useEffect } from 'react';
import { X, Save, Image, Upload, Trash2 } from 'lucide-react';
import type { HomeSection, SectionImage } from '@/types';

interface SectionEditModalProps {
  section: HomeSection | null;
  onSave: (section: HomeSection) => void;
  onClose: () => void;
  availableImages?: {src: string, name: string, type: 'local' | 'upload'}[];
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SectionEditModal({ section, onSave, onClose, availableImages = [], onFileUpload }: SectionEditModalProps) {
  const [editingSection, setEditingSection] = useState<HomeSection | null>(section);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageGallery, setShowImageGallery] = useState<number | null>(null);

  // Configuración de imágenes por tipo de sección
  const getSectionImageConfig = (sectionKey: string) => {
    const configs = {
      hero: { maxImages: 1, imageLabels: ['Imagen de fondo'] },
      quality: { maxImages: 0, imageLabels: [] }, // Solo iconos, no necesita imágenes
      methodology: { maxImages: 1, imageLabels: ['Imagen principal'] },
      blog: { maxImages: 3, imageLabels: ['Imagen del producto 1', 'Imagen del producto 2', 'Imagen del producto 3'] }
    };
    return configs[sectionKey as keyof typeof configs] || { maxImages: 1, imageLabels: ['Imagen principal'] };
  };

  const initializeImages = (section: HomeSection) => {
    const config = getSectionImageConfig(section.sectionKey);
    if (config.maxImages === 0) return section;

    const currentImages = section.images || [];
    const images: SectionImage[] = [];

    for (let i = 0; i < config.maxImages; i++) {
      const existingImage = currentImages[i];
      images.push({
        id: existingImage?.id || `${section.id}-img-${i}`,
        url: existingImage?.url || '',
        alt: existingImage?.alt || config.imageLabels[i] || `Imagen ${i + 1}`,
        caption: existingImage?.caption || '',
        order: i
      });
    }

    return { ...section, images };
  };

  useEffect(() => {
    if (section) {
      setEditingSection(initializeImages(section));
    }
  }, [section]);

  if (!editingSection) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editingSection.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!editingSection.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editingSection);
    }
  };

  const handleChange = (field: keyof HomeSection, value: any) => {
    setEditingSection(prev => prev ? { ...prev, [field]: value } : null);
    // Limpiar errores al modificar el campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (imageIndex: number, field: keyof SectionImage, value: string) => {
    setEditingSection(prev => {
      if (!prev || !prev.images) return prev;
      
      const updatedImages = [...prev.images];
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        [field]: value
      };
      
      return { ...prev, images: updatedImages };
    });
  };

  const selectImageFromGallery = (imageIndex: number, imageSrc: string) => {
    handleImageChange(imageIndex, 'url', imageSrc);
    setShowImageGallery(null);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Sección: {editingSection.sectionKey}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={editingSection.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Título de la sección"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={editingSection.subtitle || ''}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="Subtítulo opcional"
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <textarea
              value={editingSection.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none resize-vertical ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Contenido de la sección"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Imágenes */}
          {(() => {
            const config = getSectionImageConfig(editingSection.sectionKey);
            if (config.maxImages === 0) return null;

            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <Image className="w-4 h-4 inline mr-2" />
                  Imágenes de la sección
                </label>
                <div className="space-y-4">
                  {editingSection.images?.map((image, index) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {config.imageLabels[index] || `Imagen ${index + 1}`}
                        </span>
                      </div>
                      
                      {/* Vista previa de imagen */}
                      <div className="mb-3">
                        {image.url ? (
                          <div className="relative">
                            <img 
                              src={image.url} 
                              alt={image.alt}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => handleImageChange(index, 'url', '')}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Sin imagen seleccionada</span>
                          </div>
                        )}
                      </div>

                      {/* Controles de imagen */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowImageGallery(index)}
                            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            type="button"
                          >
                            <Image className="w-4 h-4" />
                            Seleccionar de Galería
                          </button>
                          
                          {onFileUpload && (
                            <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                              <Upload className="w-4 h-4" />
                              Subir Nueva
                              <input
                                type="file"
                                accept="image/*"
                                onChange={onFileUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* URL manual */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL de imagen
                          </label>
                          <input
                            type="text"
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="https://ejemplo.com/imagen.jpg o /uploads/imagen.jpg"
                          />
                        </div>

                        {/* Alt text */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Texto alternativo (Alt)
                          </label>
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="Descripción de la imagen para accesibilidad"
                          />
                        </div>

                        {/* Caption opcional */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Descripción (opcional)
                          </label>
                          <input
                            type="text"
                            value={image.caption || ''}
                            onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
                            placeholder="Descripción que aparecerá debajo de la imagen"
                          />
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>
            );
          })()}

          {/* Texto del botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto del botón
            </label>
            <input
              type="text"
              value={editingSection.buttonText || ''}
              onChange={(e) => handleChange('buttonText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="Texto del botón (opcional)"
            />
          </div>

          {/* Enlace del botón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace del botón
            </label>
            <input
              type="text"
              value={editingSection.buttonLink || ''}
              onChange={(e) => handleChange('buttonLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
              placeholder="URL del enlace (opcional)"
            />
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden
            </label>
            <input
              type="number"
              value={editingSection.order}
              onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-transparent outline-none"
            />
          </div>

          {/* Activo */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingSection.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="w-4 h-4 text-[#0d40a5] border-gray-300 rounded focus:ring-[#0d40a5]"
              />
              <span className="text-sm font-medium text-gray-700">
                Sección visible
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>
      
      {/* Modal de galería de imágenes */}
      {showImageGallery !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Seleccionar Imagen
              </h3>
              <button
                onClick={() => setShowImageGallery(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableImages.map((image, index) => (
                  <div
                    key={index}
                    className="group relative cursor-pointer"
                    onClick={() => selectImageFromGallery(showImageGallery!, image.src)}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-lg border group-hover:border-[#0d40a5] transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {image.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {availableImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay imágenes disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}