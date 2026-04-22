import { useState, useCallback, useEffect } from 'react';

export interface LivePreviewState {
  isOpen: boolean;
  device: 'mobile' | 'tablet' | 'desktop';
  currentUrl: string;
  isFullscreen: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
}

export function useLivePreview(initialState?: Partial<LivePreviewState>) {
  const [state, setState] = useState<LivePreviewState>({
    isOpen: false,
    device: 'desktop',
    currentUrl: '/',
    isFullscreen: false,
    isLoading: true,
    isRefreshing: false,
    ...initialState,
  });

  const updateState = useCallback((updates: Partial<LivePreviewState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const openPreview = useCallback((device?: 'mobile' | 'tablet' | 'desktop', url?: string) => {
    updateState({
      isOpen: true,
      ...(device && { device }),
      ...(url && { currentUrl: url }),
      isLoading: true,
    });
  }, [updateState]);

  const closePreview = useCallback(() => {
    updateState({ isOpen: false });
  }, [updateState]);

  const changeDevice = useCallback((device: 'mobile' | 'tablet' | 'desktop') => {
    updateState({ device, isLoading: true });
  }, [updateState]);

  const changeUrl = useCallback((url: string) => {
    updateState({ currentUrl: url, isLoading: true });
  }, [updateState]);

  const toggleFullscreen = useCallback(() => {
    updateState({ isFullscreen: !state.isFullscreen });
  }, [updateState, state.isFullscreen]);

  const startRefresh = useCallback(() => {
    updateState({ isRefreshing: true, isLoading: true });
    // Simular tiempo de refresh
    setTimeout(() => {
      updateState({ isRefreshing: false });
    }, 1000);
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  // Keyboard shortcuts handler
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if (!state.isOpen) return;

    switch (true) {
      case e.key === 'Escape':
        closePreview();
        break;
      case e.key === 'F5' || (e.ctrlKey && e.key === 'r'):
        e.preventDefault();
        startRefresh();
        break;
      case e.ctrlKey && ['1', '2', '3'].includes(e.key):
        e.preventDefault();
        const devices: ('mobile' | 'tablet' | 'desktop')[] = ['mobile', 'tablet', 'desktop'];
        changeDevice(devices[parseInt(e.key) - 1]);
        break;
      case e.ctrlKey && e.key === 'Enter':
        e.preventDefault();
        window.open(state.currentUrl, '_blank');
        break;
    }
  }, [state.isOpen, state.currentUrl, closePreview, startRefresh, changeDevice]);

  // Setup keyboard event listener
  useEffect(() => {
    if (state.isOpen) {
      window.addEventListener('keydown', handleKeyboard);
      return () => window.removeEventListener('keydown', handleKeyboard);
    }
  }, [state.isOpen, handleKeyboard]);

  return {
    state,
    actions: {
      openPreview,
      closePreview,
      changeDevice,
      changeUrl,
      toggleFullscreen,
      startRefresh,
      setLoading,
    },
    // Quick access to commonly used state
    isOpen: state.isOpen,
    device: state.device,
    currentUrl: state.currentUrl,
    isFullscreen: state.isFullscreen,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
  };
}

export default useLivePreview;
