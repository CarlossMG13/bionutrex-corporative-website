import { useState, useCallback } from 'react';
import { MediaFile } from './useMediaLibrary';

export interface ImageSelectorOptions {
  allowMultiple?: boolean;
  filterByType?: 'image' | 'video' | 'document' | 'all';
  maxSelection?: number;
}

export function useImageSelector(options: ImageSelectorOptions = {}) {
  const {
    allowMultiple = false,
    filterByType = 'image',
    maxSelection = 1
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([]);
  const [onSelectionComplete, setOnSelectionComplete] = useState<((files: MediaFile[]) => void) | null>(null);

  const openSelector = useCallback((callback?: (files: MediaFile[]) => void) => {
    setSelectedImages([]);
    setOnSelectionComplete(() => callback || null);
    setIsOpen(true);
  }, []);

  const closeSelector = useCallback(() => {
    setIsOpen(false);
    setSelectedImages([]);
    setOnSelectionComplete(null);
  }, []);

  const selectImage = useCallback((file: MediaFile) => {
    if (!allowMultiple) {
      setSelectedImages([file]);
      return;
    }

    setSelectedImages(prev => {
      const isAlreadySelected = prev.find(f => f.id === file.id);

      if (isAlreadySelected) {
        return prev.filter(f => f.id !== file.id);
      }

      if (prev.length >= maxSelection) {
        return prev;
      }

      return [...prev, file];
    });
  }, [allowMultiple, maxSelection]);

  const confirmSelection = useCallback(() => {
    if (onSelectionComplete && selectedImages.length > 0) {
      onSelectionComplete(selectedImages);
    }
    closeSelector();
  }, [selectedImages, onSelectionComplete, closeSelector]);

  const filterFiles = useCallback((files: MediaFile[]) => {
    if (filterByType === 'all') {
      return files;
    }
    return files.filter(file => file.type === filterByType);
  }, [filterByType]);

  return {
    // Estado
    isOpen,
    selectedImages,
    canConfirm: selectedImages.length > 0,
    
    // Acciones
    openSelector,
    closeSelector,
    selectImage,
    confirmSelection,
    filterFiles,
    
    // Configuración
    allowMultiple,
    maxSelection,
    filterByType,
  };
}

export default useImageSelector;
