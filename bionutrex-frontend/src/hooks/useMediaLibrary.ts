import { useState, useEffect, useCallback } from 'react';
export interface MediaFile {
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
    export interface MediaFolder {
      id: string;
      name: string;
      count: number;
      size: number;
      created: string;
    }
    interface MediaLibraryState {
      files: MediaFile[];
      folders: MediaFolder[];
      loading: boolean;
      error: string | null;
      uploading: boolean;
      uploadProgress: number;
    }
    const BACKEND_URL = 'http://localhost:3001';
    export function useMediaLibrary() {
      const [state, setState] = useState<MediaLibraryState>({
        files: [],
        folders: [],
        loading: true,
        error: null,
        uploading: false,
        uploadProgress: 0,
      });
      const updateState = useCallback((updates: Partial<MediaLibraryState>) => {
        setState(prev => ({ ...prev, ...updates }));
      }, []);
/*        Función para obtener el tipo de archivo basado en la extensión
 */   const getFileType = useCallback((fileName: string): MediaFile['type'] => {
     const ext = fileName.toLowerCase().split('.').pop() || '';
     
     if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
       return 'image';
     }
     if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
       return 'video';
     }
     if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
       return 'document';
     }
     if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
       return 'audio';
     }
     if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
       return 'archive';
     }
     return 'document';
   }, []);
/*     Función para obtener dimensiones de imagen
 */   const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number } | null> => {
     return new Promise((resolve) => {
       if (!file.type.startsWith('image/')) {
         resolve(null);
         return;
       }
       const img = new Image();
       img.onload = () => {
         resolve({ width: img.width, height: img.height });
       };
       img.onerror = () => resolve(null);
       img.src = URL.createObjectURL(file);
     });
   }, []);
/*     Cargar archivos desde el servidor
 */   const loadFiles = useCallback(async () => {
     try {
       updateState({ loading: true, error: null });
       
       const allFiles: MediaFile[] = [];
       let fileIndex = 0;
       
       // Cargar archivos del backend (/uploads)
       try {
         console.log('🔄 Loading files from backend uploads...');
         const response = await fetch(`${BACKEND_URL}/api/uploads/list`);
         if (response.ok) {
           const text = await response.text();
           if (text.trim()) {
             try {
               const fileNames: string[] = JSON.parse(text);
               console.log(`📁 Found ${fileNames.length} files in backend uploads`);
               
               const uploadsFiles: MediaFile[] = await Promise.all(
                 fileNames.map(async (fileName) => {
                   const filePath = `${BACKEND_URL}/uploads/${fileName}`;
                   const type = getFileType(fileName);
                   
                   let dimensions: { width: number; height: number } | undefined;
                   
                   try {
                     if (type === 'image') {
                       const img = new Image();
                       const loadPromise = new Promise<void>((resolve) => {
                         img.onload = () => {
                           dimensions = { width: img.width, height: img.height };
                           resolve();
                         };
                         img.onerror = () => resolve();
                         img.src = filePath;
                       });
                       await Promise.race([loadPromise, new Promise(resolve => setTimeout(resolve, 1000))]);
                     }
                   } catch (err) {
                     console.warn(`Error loading metadata for ${fileName}:`, err);
                   }
                   
                   return {
                     id: `uploads-${fileIndex++}`,
                     name: fileName,
                     type,
                     size: 0, // El backend debería proporcionar el tamaño
                     url: filePath,
                     thumbnail: type === 'image' ? filePath : undefined,
                     uploadDate: new Date().toISOString(),
                     dimensions,
                     tags: [],
                     folder: 'uploads',
                   };
                 })
               );
               
               allFiles.push(...uploadsFiles);
               console.log(`✅ Loaded ${uploadsFiles.length} files from backend uploads`);
             } catch (parseError) {
               console.warn('Error parsing uploads response:', parseError);
             }
           }
         }
       } catch (error) {
         console.warn('Error loading backend uploads:', error);
       }
       
       // Cargar archivos estáticos (/assets y /public)
       console.log('🔄 Loading files from public assets...');
       const assetsImages = [
         // Imágenes que existen en public/images/
         '/images/MethImage.jpg',
         '/images/heroSection-img.jpg', 
         '/images/img1-grid-product.jpg',
         '/images/img2-grid-product.jpg',
         '/images/img3-grid-product.jpg'
       ];
       
       const assetsFiles: MediaFile[] = [];
       
       for (let i = 0; i < assetsImages.length; i++) {
         const assetPath = assetsImages[i];
         const fileName = assetPath.split('/').pop() || '';
         const type = getFileType(fileName);
         const fullPath = assetPath;
         
         let dimensions: { width: number; height: number } | undefined;
         
         try {
           if (type === 'image') {
             const img = new Image();
             const loadPromise = new Promise<void>((resolve, reject) => {
               img.onload = () => {
                 dimensions = { width: img.width, height: img.height };
                 console.log(`✅ Loaded public image: ${fileName} (${dimensions.width}x${dimensions.height})`);
                 resolve();
               };
               img.onerror = (e) => {
                 console.warn(`❌ Failed to load public image: ${fileName}`, e);
                 resolve(); // No rechazamos para no bloquear otros archivos
               };
               img.src = fullPath;
             });
             
             await Promise.race([
               loadPromise, 
               new Promise(resolve => setTimeout(() => {
                 console.warn(`⏱️ Timeout loading ${fileName}`);
                 resolve();
               }, 5000))
             ]);
           }
         } catch (err) {
           console.warn(`Error loading metadata for ${fileName}:`, err);
         }
         
         const fileItem = {
           id: `public-${fileIndex++}`,
           name: fileName,
           type,
           size: 0,
           url: fullPath,
           thumbnail: type === 'image' ? fullPath : undefined,
           uploadDate: new Date().toISOString(),
           dimensions,
           tags: [],
           folder: 'public',
         };
         
         assetsFiles.push(fileItem);
         console.log(`📄 Added file: ${fileName} [${fullPath}]`);
       }
       
       allFiles.push(...assetsFiles);
       console.log(`🖼️ Loaded ${assetsFiles.length} files from public assets`);
       console.log(`📋 Total files: ${allFiles.length}`);
       
       const files = allFiles;
       
/*         Calcular carpetas
 */       const folderMap = new Map<string, { count: number; size: number }>();
       
       files.forEach(file => {
         const folderData = folderMap.get(file.folder) || { count: 0, size: 0 };
         folderData.count++;
         folderData.size += file.size;
         folderMap.set(file.folder, folderData);
       });
       
       const folders: MediaFolder[] = Array.from(folderMap.entries()).map(([name, data]) => ({
         id: `folder-${name}`,
         name,
         count: data.count,
         size: data.size,
         created: new Date().toISOString(),
       }));
       
       updateState({ 
         files, 
         folders, 
         loading: false 
       });
       
     } catch (error) {
       console.error('Error loading files:', error);
       updateState({ 
         error: error instanceof Error ? error.message : 'Error desconocido',
         loading: false 
       });
     }
   }, [getFileType]);
  /*   Subir archivos */
   const uploadFiles = useCallback(async (files: FileList | File[]) => {
     const fileArray = Array.from(files);
     
     try {
       updateState({ uploading: true, uploadProgress: 0, error: null });
       
       /* Validar archivos */
       for (const file of fileArray) {
         if (file.size > 10 * 1024 * 1024) { 
           throw new Error(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
         }
       }
       
       /* Crear FormData */
       const formData = new FormData();
       fileArray.forEach(file => {
         formData.append('files', file);
       });
       
       /* Subir archivos */
       const response = await fetch(`${BACKEND_URL}/api/uploads/multiple`, {
         method: 'POST',
         body: formData,
       });
       
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
         throw new Error(errorData.error || 'Error al subir archivos');
       }
       
       const result = await response.json();
       updateState({ uploadProgress: 100 });
       
       /* Recargar archivos */
       await loadFiles();
       
       updateState({ uploading: false, uploadProgress: 0 });
       
       return result;
       
     } catch (error) {
       console.error('Error uploading files:', error);
       updateState({ 
         error: error instanceof Error ? error.message : 'Error al subir archivos',
         uploading: false,
         uploadProgress: 0
       });
       throw error;
     }
   }, [loadFiles]);
/*     Eliminar archivo
 */   const deleteFile = useCallback(async (fileId: string) => {
     try {
       const file = state.files.find(f => f.id === fileId);
       if (!file) {
         throw new Error('Archivo no encontrado');
       }
       
        /* Aquí iría la lógica para eliminar del servidor
        Por ahora solo eliminamos del estado local */
       const updatedFiles = state.files.filter(f => f.id !== fileId);
       updateState({ files: updatedFiles });
       
     } catch (error) {
       console.error('Error deleting file:', error);
       updateState({ 
         error: error instanceof Error ? error.message : 'Error al eliminar archivo'
       });
       throw error;
     }
   }, [state.files]);
/*     Eliminar múltiples archivos
 */   const deleteFiles = useCallback(async (fileIds: string[]) => {
     try {
/*         Eliminar múltiples archivos
 */       const updatedFiles = state.files.filter(f => !fileIds.includes(f.id));
       updateState({ files: updatedFiles });
       
     } catch (error) {
       console.error('Error deleting files:', error);
       updateState({ 
         error: error instanceof Error ? error.message : 'Error al eliminar archivos'
       });
       throw error;
     }
   }, [state.files]);
/*     Crear carpeta
 */   const createFolder = useCallback(async (folderName: string) => {
     try {
       const newFolder: MediaFolder = {
         id: `folder-${Date.now()}`,
         name: folderName,
         count: 0,
         size: 0,
         created: new Date().toISOString(),
       };
       
       const updatedFolders = [...state.folders, newFolder];
       updateState({ folders: updatedFolders });
       
       return newFolder;
       
     } catch (error) {
       console.error('Error creating folder:', error);
       updateState({ 
         error: error instanceof Error ? error.message : 'Error al crear carpeta'
       });
       throw error;
     }
   }, [state.folders]);
/*     Obtener estadísticas
 */   const getStats = useCallback(() => {
     const totalFiles = state.files.length;
     const totalSize = state.files.reduce((acc, file) => acc + file.size, 0);
     const imageCount = state.files.filter(f => f.type === 'image').length;
     const videoCount = state.files.filter(f => f.type === 'video').length;
     const documentCount = state.files.filter(f => f.type === 'document').length;
     
     return {
       totalFiles,
       totalSize,
       imageCount,
       videoCount,
       documentCount,
       folderCount: state.folders.length,
     };
   }, [state.files, state.folders]);
    /* Formatear tamaño de archivo */
   const formatFileSize = useCallback((bytes: number) => {
     if (bytes === 0) return '0 Bytes';
     const k = 1024;
     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   }, []);
/*     Inicializar cargando archivos */
   useEffect(() => {
     loadFiles();
   }, [loadFiles]);
   return {
     files: state.files,
     folders: state.folders,
     loading: state.loading,
     error: state.error,
     uploading: state.uploading,
     uploadProgress: state.uploadProgress,
     
     loadFiles,
     uploadFiles,
     deleteFile,
     deleteFiles,
     createFolder,
     
     getStats,
     formatFileSize,
     getFileType,
     
     stats: getStats(),
   };
 }
 export default useMediaLibrary;