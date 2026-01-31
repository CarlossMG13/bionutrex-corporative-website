import React, { useState, useRef } from "react";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Eye,
  Trash2,
  Download,
  Copy,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  FolderPlus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import useMediaLibrary from "../../hooks/useMediaLibrary";

export default function MediaLibrary() {
  const {
    files,
    folders,
    loading,
    error,
    uploading,
    uploadProgress,
    stats,
    loadFiles,
    uploadFiles,
    deleteFile,
    deleteFiles,
    createFolder,
    formatFileSize,
  } = useMediaLibrary();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("todos");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener lista de carpetas únicas
  const folderNames = ["todos", ...new Set(folders.map(f => f.name))];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return ImageIcon;
      case "video": return Video;
      case "document": return FileText;
      case "audio": return Music;
      case "archive": return Archive;
      default: return FileText;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-green-100 text-green-800";
      case "video": return "bg-purple-100 text-purple-800";
      case "document": return "bg-blue-100 text-blue-800";
      case "audio": return "bg-yellow-100 text-yellow-800";
      case "archive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Filtrar archivos
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === "todos" || file.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Handlers
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

  // Manejo de archivos
  const handleFileUpload = async (fileList: FileList) => {
    try {
      await uploadFiles(fileList);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    if (confirm(`¿Estás seguro de eliminar ${selectedFiles.length} archivo(s)?`)) {
      try {
        await deleteFiles(selectedFiles);
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error deleting files:', error);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === '') return;
    
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDownloadSelected = () => {
    selectedFiles.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0d40a5]" />
          <span className="ml-3 text-lg text-gray-600">Cargando biblioteca de medios...</span>
        </div>
      </div>
    );
  }

  const renderFilePreview = (file: any) => {
    if (file.type === 'image') {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-[80vh] object-contain"
        />
      );
    }

    const FileIcon = getFileIcon(file.type);
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FileIcon className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
        <p className="text-gray-600 mb-4">{formatFileSize(file.size)}</p>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Abrir archivo
        </a>
      </div>
    );
  };

  return (
    <div 
      className="p-6 space-y-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button 
            onClick={loadFiles}
            className="ml-auto text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800 font-medium">Subiendo archivos...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-blue-600 mt-1">{Math.round(uploadProgress)}% completado</p>
        </div>
      )}

      {/* Global Drag Overlay */}
      {dragOver && (
        <div className="fixed inset-0 bg-[#0d40a5] bg-opacity-20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-dashed border-[#0d40a5]">
            <Upload className="w-16 h-16 text-[#0d40a5] mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 text-center">
              Suelta los archivos para subirlos
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Medios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona imágenes, videos y documentos del sitio web
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Nueva Carpeta
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors"
            disabled={uploading}
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
              <p className="text-xl font-bold text-gray-900">{stats.totalFiles}</p>
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
                {formatFileSize(stats.totalSize)}
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
              <p className="text-xl font-bold text-gray-900">{stats.folderCount}</p>
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
              <p className="text-xl font-bold text-gray-900">{stats.imageCount}</p>
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
              {folderNames.map(folder => (
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
                <button 
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Eliminar
                </button>
                <button 
                  onClick={handleDownloadSelected}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
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
            
            <button 
              onClick={loadFiles}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Recargar"
            >
              <RefreshCw className="w-4 h-4" />
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
            checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
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
                className={`group bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "border-[#0d40a5] shadow-md" : "border-gray-200"
                }`}
              >
                <div 
                  className="aspect-square bg-gray-100 relative"
                  onClick={() => handleFileSelect(file.id)}
                >
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
                        <CheckCircle className="w-4 h-4 text-white fill-current" />
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file.id);
                        }}
                        className="p-1 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all"
                      >
                        <Eye className="w-3 h-3 text-gray-600" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = file.url;
                          link.download = file.name;
                          link.click();
                        }}
                        className="p-1 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all"
                      >
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
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
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
                          <button 
                            onClick={() => setPreviewFile(file.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.url;
                              link.download = file.name;
                              link.click();
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(file.url);
                            }}
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
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
      {filteredFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron archivos
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedFolder !== 'todos' 
              ? 'Ajusta los filtros de búsqueda o sube algunos archivos'
              : 'Sube algunos archivos para comenzar'
            }
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Subir Archivos
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0d40a5] hover:bg-[#0d40a5]/5 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Soporta: JPG, PNG, GIF, MP4, PDF, DOC (Máx. 10MB por archivo)
                </p>
                <button 
                  disabled={uploading}
                  className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Seleccionar Archivos'}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploading}
              />
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Crear Nueva Carpeta
                </h2>
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la carpeta
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ej: productos, documentos..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d40a5] focus:border-[#0d40a5]"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-[#0d40a5] text-white rounded-lg hover:bg-[#0d40a5]/90 transition-colors disabled:opacity-50"
                >
                  Crear Carpeta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              {previewFile && renderFilePreview(files.find(f => f.id === previewFile))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}