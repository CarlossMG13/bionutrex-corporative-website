import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { HomeSection } from '@/types';

interface SectionEditModalProps {
  section: HomeSection | null;
  onSave: (section: HomeSection) => void;
  onClose: () => void;
}

export function SectionEditModal({ section, onSave, onClose }: SectionEditModalProps) {
  const [editingSection, setEditingSection] = useState<HomeSection | null>(section);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditingSection(section);
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
    </div>
  );
}