import { useState } from "react";
import {
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Copy,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  Plus,
  FolderPlus,
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio" | "archive";
  size: number;
  url: string;
  thumbnail?: string;
  uploadDate: string;
  dimensions?: {
    width: number;
    height: number;
  };
  tags: string[];
  folder: string;
}

const mockMediaFiles: MediaFile[] = [
  {
    id: "1",
    name: "omega-3-product.jpg",
    type: "image",
    size: 245760,
    url: "/api/placeholder/400/300",
    thumbnail: "/api/placeholder/400/300",
    uploadDate: "2024-01-15",
    dimensions: { width: 1920, height: 1080 },
    tags: ["producto", "omega-3", "suplemento"],
    folder: "productos",
  },
  {
    id: "2",
    name: "laboratorio-video.mp4",
    type: "video",
    size: 15728640,
    url: "/videos/laboratorio.mp4",
    thumbnail: "/api/placeholder/400/300",
    uploadDate: "2024-01-10",
    tags: ["laboratorio", "proceso", "calidad"],
    folder: "institucional",
  },
  {
    id: "3",
    name: "catalogo-productos-2024.pdf",
    type: "document",
    size: 2097152,
    url: "/documents/catalogo.pdf",
    uploadDate: "2024-01-08",
    tags: ["catálogo", "productos", "2024"],
    folder: "documentos",
  },
  {
    id: "4",
    name: "hero-background.jpg",
    type: "image",
    size: 512000,
    url: "/api/placeholder/1920/1080",
    thumbnail: "/api/placeholder/1920/1080",
    uploadDate: "2024-01-05",
    dimensions: { width: 1920, height: 1080 },
    tags: ["hero", "background", "home"],
    folder: "website",
  },
];

const folders = ["todos", "productos", "institucional", "documentos", "website", "blog"];

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("todos");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "document":
        return FileText;
      case "audio":
        return Music;
      case "archive":
        return Archive;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-green-100 text-green-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "document":
        return "bg-blue-100 text-blue-800";
      case "audio":
        return "bg-yellow-100 text-yellow-800";
      case "archive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === "todos" || file.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Medios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona imágenes, videos y documentos del sitio web
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FolderPlus className="w-4 h-4" />
            Nueva Carpeta
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Subir Archivos
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Archivos</p>
              <p className="text-xl font-bold text-gray-900">{mediaFiles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Archive className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Espacio Usado</p>
              <p className="text-xl font-bold text-gray-900">
                {formatFileSize(mediaFiles.reduce((acc, file) => acc + file.size, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Folder className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Carpetas</p>
              <p className="text-xl font-bold text-gray-900">{folders.length - 1}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Imágenes</p>
              <p className="text-xl font-bold text-gray-900">
                {mediaFiles.filter(f => f.type === "image").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">
                  {selectedFiles.length} seleccionados
                </span>
                <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  Eliminar
                </button>
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  Descargar
                </button>
              </div>
            )}
            
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Select All */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="selectAll"
            checked={selectedFiles.length === filteredFiles.length}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-[#0d40a5] focus:ring-[#0d40a5]"
          />
          <label htmlFor="selectAll" className="text-sm text-gray-600">
            Seleccionar todos ({filteredFiles.length})
          </label>
        </div>
      )}

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            const isSelected = selectedFiles.includes(file.id);
            
            return (
              <div
                key={file.id}
                className={`bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "border-[#0d40a5] shadow-md" : "border-gray-200"
                }`}
                onClick={() => handleFileSelect(file.id)}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {file.type === "image" && file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#0d40a5] bg-opacity-20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#0d40a5] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>
                      {file.type}
                    </span>
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button className="p-1 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all">
                        <Eye className="w-3 h-3 text-gray-600" />
                      </button>
                      <button className="p-1 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all">
                        <Download className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#0d40a5] focus:ring-[#0d40a5]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  const isSelected = selectedFiles.includes(file.id);
                  
                  return (
                    <tr key={file.id} className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFileSelect(file.id)}
                          className="rounded border-gray-300 text-[#0d40a5] focus:ring-[#0d40a5]"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {file.type === "image" && file.thumbnail ? (
                              <img
                                src={file.thumbnail}
                                alt={file.name}
                                className="w-10 h-10 object-cover rounded-lg"
                              />
                            ) : (
                              <FileIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.folder}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.type)}`}>
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-orange-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron archivos
          </h3>
          <p className="text-gray-600 mb-4">
            Sube algunos archivos o ajusta los filtros de búsqueda
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Subir Archivos
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Subir Archivos
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0d40a5] hover:bg-[#0d40a5]/5 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Soporta: JPG, PNG, GIF, MP4, PDF, DOC (Máx. 10MB)
                </p>
                <button className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
                  Seleccionar Archivos
                </button>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
                  Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}