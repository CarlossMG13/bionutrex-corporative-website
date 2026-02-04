import { useState, useEffect } from 'react';
import { homeSectionAPI, sliderAPI } from '@/services/api';
import type { HomeSection, Slider } from '@/types';
import { useHomeDataRefresh } from '@/contexts/HomeDataContext';

export function useHomeSections() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el contexto de manera segura
  let refreshTrigger = 0;
  try {
    const context = useHomeDataRefresh();
    refreshTrigger = context.refreshTrigger;
  } catch (err) {
    // Si no hay contexto disponible, usar valor por defecto
    console.warn('useHomeDataRefresh context not available, using default value');
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [sectionsResponse, slidersResponse] = await Promise.all([
        homeSectionAPI.getAll().catch(() => ({ data: [] })),
        sliderAPI.getAll().catch(() => ({ data: [] })),
      ]);

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

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]); // Se actualiza cuando cambia refreshTrigger

  const getSectionByKey = (key: string): HomeSection | undefined => {
    return sections.find(section => section.sectionKey === key && section.active);
  };

  const getActiveSliders = (): Slider[] => {
    return sliders.filter(slider => slider.active).sort((a, b) => a.order - b.order);
  };

  return {
    sections,
    sliders,
    loading,
    error,
    getSectionByKey,
    getActiveSliders,
    refetch: fetchData
  };
}