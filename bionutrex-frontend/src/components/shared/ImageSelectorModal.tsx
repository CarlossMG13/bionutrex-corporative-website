import React, { useState } from 'react';
import {
  X,
  Search,
  Grid3X3,
  List,
  CheckCircle,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
} from 'lucide-react';
import useMediaLibrary, { MediaFile } from '../../hooks/useMediaLibrary';
import useImageSelector, { ImageSelectorOptions } from '../../hooks/useImageSelector';

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile[]) => void;
  options?: ImageSelectorOptions;
  title?: string;
}

export default function ImageSelectorModal({
  isOpen,
  onClose,
  onSelect,
  options = {},
  title = 'Seleccionar Imagen',
}: ImageSelectorModalProps) {
  const { files, loading, error, formatFileSize } = useMediaLibrary();

  const {
    selectedImages,
    selectImage,
    filterFiles,
    allowMultiple,
    maxSelection,
    canConfirm,
  } = useImageSelector(options);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'document':
        return FileText;
      case 'audio':
        return Music;
      case 'archive':
        return Archive;
      default:
        return FileText;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'audio':
        return 'bg-yellow-100 text-yellow-800';
      case 'archive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = filterFiles(files).filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (file: MediaFile) => {
    if (!allowMultiple) {
      onSelect([file]);
      onClose();
      return;
    }
    selectImage(file);
  };

  const handleConfirm = () => {
    onSelect(selectedImages);
    onClose();
  };

  const isSelected = (fileId: string) => selectedImages.some((f) => f.id === fileId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {allowMultiple
                  ? `Selecciona hasta ${maxSelection} archivo${maxSelection !== 1 ? 's' : ''}`
                  : 'Selecciona un archivo'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
              />
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d40a5] mx-auto mb-4" />
                <p className="text-gray-600">Cargando archivos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron archivos</h3>
              <p className="text-gray-600">{searchTerm ? 'Ajusta los términos de búsqueda' : 'No hay archivos disponibles'}</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    const selected = isSelected(file.id);

                    return (
                      <div
                        key={file.id}
                        className={`group bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                          selected ? 'border-[#0d40a5] shadow-md' : 'border-gray-200'
                        }`}
                        onClick={() => handleSelect(file)}
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          {file.type === 'image' && file.thumbnail ? (
                            <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          {selected && (
                            <div className="absolute inset-0 bg-[#0d40a5] bg-opacity-20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-[#0d40a5] rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white fill-current" />
                              </div>
                            </div>
                          )}

                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>{file.type}</span>
                          </div>
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                          {file.dimensions && (
                            <p className="text-xs text-gray-500">
                              {file.dimensions.width} × {file.dimensions.height}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFiles.map((file) => {
                          const FileIcon = getFileIcon(file.type);
                          const selected = isSelected(file.id);

                          return (
                            <tr key={file.id} className={`hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50' : ''}`} onClick={() => handleSelect(file)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center relative">
                                    {file.type === 'image' && file.thumbnail ? (
                                      <img src={file.thumbnail} alt={file.name} className="w-10 h-10 object-cover rounded-lg" />
                                    ) : (
                                      <FileIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                    {selected && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0d40a5] rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white fill-current" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.folder}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>{file.type}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(file.size)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">{selectedImages.length} de {maxSelection} seleccionados</div>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleConfirm} disabled={!canConfirm} className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50">Confirmar Selección</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
