import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { homeSectionAPI, sliderAPI } from '@/services/api';
import type { HomeSection, Slider } from '@/types';
import type { PendingChange } from './AdminContext';

interface HomeDataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  sections: HomeSection[];
  sliders: Slider[];
  loading: boolean;
  error: string | null;
  getSectionByKey: (key: string) => HomeSection | undefined;
  getActiveSliders: () => Slider[];
  getSortedSections: () => HomeSection[];
  applyPendingChanges: (pendingChanges: PendingChange[]) => void;
}

const HomeDataContext = createContext<HomeDataContextType | undefined>(undefined);

interface HomeDataProviderProps {
  children: ReactNode;
}

export function HomeDataProvider({ children }: HomeDataProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [baseSections, setBaseSections] = useState<HomeSection[]>([]);
  const [baseSliders, setBaseSliders] = useState<Slider[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos desde la API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [sectionsResponse, slidersResponse] = await Promise.all([
        homeSectionAPI.getAll().catch(() => ({ data: [] })),
        sliderAPI.getAll().catch(() => ({ data: [] })),
      ]);

      setBaseSections(sectionsResponse.data);
      setBaseSliders(slidersResponse.data);
      setSections(sectionsResponse.data);
      setSliders(slidersResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Error al cargar los datos de la página principal');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y cuando cambie refreshTrigger
  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Función para aplicar cambios pendientes sobre los datos base
  const applyPendingChanges = (pendingChanges: PendingChange[]) => {
    let updatedSections = [...baseSections];
    let updatedSliders = [...baseSliders];

    pendingChanges.forEach(change => {
      if (change.type === 'section') {
        switch (change.action) {
          case 'update':
          case 'visibility':
            updatedSections = updatedSections.map(section => 
              section.id === change.id ? { ...section, ...change.data } : section
            );
            break;
          case 'delete':
            updatedSections = updatedSections.filter(section => section.id !== change.id);
            break;
          case 'create':
            // Solo agregar si no existe ya
            if (!updatedSections.some(s => s.id === change.data.id)) {
              updatedSections.push(change.data);
            }
            break;
        }
      } else if (change.type === 'slider') {
        switch (change.action) {
          case 'update':
            updatedSliders = updatedSliders.map(slider => 
              slider.id === change.id ? { ...slider, ...change.data } : slider
            );
            break;
          case 'delete':
            updatedSliders = updatedSliders.filter(slider => slider.id !== change.id);
            break;
          case 'create':
            // Solo agregar si no existe ya
            if (!updatedSliders.some(s => s.id === change.data.id)) {
              updatedSliders.push(change.data);
            }
            break;
        }
      }
    });

    setSections(updatedSections);
    setSliders(updatedSliders);
  };

  const getSectionByKey = (key: string): HomeSection | undefined => {
    return sections.find(section => section.sectionKey === key && section.active);
  };

  const getActiveSliders = (): Slider[] => {
    return sliders.filter(slider => slider.active).sort((a, b) => a.order - b.order);
  };

  const getSortedSections = (): HomeSection[] => {
    return sections
      .filter(section => section.active)
      .sort((a, b) => {
        // Ordenar por order ascendente
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        // Si tienen el mismo order, ordenar alfabéticamente por title
        return a.title.localeCompare(b.title);
      });
  };

  return (
    <HomeDataContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh, 
      sections, 
      sliders, 
      loading, 
      error, 
      getSectionByKey, 
      getActiveSliders,
      getSortedSections,
      applyPendingChanges 
    }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeDataRefresh() {
  const context = useContext(HomeDataContext);
  if (context === undefined) {
    throw new Error('useHomeDataRefresh must be used within a HomeDataProvider');
  }
  return context;
}

// Hook simplificado para compatibilidad con componentes existentes
export function useHomeSections() {
  const context = useContext(HomeDataContext);
  if (context === undefined) {
    // Fallback si no hay contexto disponible
    return {
      sections: [],
      sliders: [],
      loading: true,
      error: null,
      getSectionByKey: () => undefined,
      getActiveSliders: () => [],
      getSortedSections: () => [],
      refetch: () => Promise.resolve()
    };
  }
  
  const { sections, sliders, loading, error, getSectionByKey, getActiveSliders, getSortedSections, triggerRefresh } = context;
  
  return {
    sections,
    sliders,
    loading,
    error,
    getSectionByKey,
    getActiveSliders,
    getSortedSections,
    refetch: triggerRefresh
  };
}