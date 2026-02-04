import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings
} from 'lucide-react';
import './LivePreview.css';

// Configuraciones de dispositivos
const DEVICE_CONFIGS = {
  desktop: {
    width: 1440,
    height: 900,
    name: "Desktop",
    icon: Monitor,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    scale: 0.9,
    showStatusBar: false
  },
  tablet: {
    width: 768,
    height: 1024,
    name: "iPad",
    icon: Tablet,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    scale: 0.85,
    showStatusBar: false
  },
  mobile: {
    width: 375,
    height: 812,
    name: "Phone",
    icon: Smartphone,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    scale: 1,
    showStatusBar: true
  },
  
};

interface LivePreviewProps {
  isOpen: boolean;
  device: 'mobile' | 'tablet' | 'desktop';
  onClose: () => void;
  onDeviceChange: (device: 'mobile' | 'tablet' | 'desktop') => void;
}

export default function LivePreview({ isOpen, device, onClose, onDeviceChange }: LivePreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('/');
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const deviceConfig = DEVICE_CONFIGS[device];

  // Manejar el refresh del preview
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setIsLoading(true);
    setPreviewKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  // Manejar cambio de URL
  const handleUrlChange = useCallback((url: string) => {
    setCurrentUrl(url);
    setIsLoading(true);
    setPreviewKey(prev => prev + 1);
  }, []);

  // Escuchar teclas de acceso rápido
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC para cerrar
      if (e.key === 'Escape') {
        onClose();
      }
      // F5 o Ctrl+R para refrescar
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        handleRefresh();
      }
      // Ctrl+1/2/3 para cambiar dispositivos
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const devices: ('mobile' | 'tablet' | 'desktop')[] = ['mobile', 'tablet', 'desktop'];
        onDeviceChange(devices[parseInt(e.key) - 1]);
      }
      // Ctrl+Enter para abrir en nueva pestaña
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        window.open(currentUrl, '_blank');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onDeviceChange, handleRefresh]);

  // Calcular dimensiones del preview
  const scale = isFullscreen ? 1 : deviceConfig.scale;
  const transformedWidth = deviceConfig.width * scale;
  const transformedHeight = deviceConfig.height * scale;

  if (!isOpen) return null;

  return (
    <div className={`live-preview-container fixed inset-0 z-50 flex flex-col ${
      isFullscreen ? 'preview-fullscreen bg-black' : 'bg-gray-900/95 backdrop-blur-sm'
    }`}>
      {/* Header del preview */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa en Tiempo Real</h2>
          </div>
          
          {/* Selector de dispositivos */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {Object.entries(DEVICE_CONFIGS).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => onDeviceChange(key as 'mobile' | 'tablet' | 'desktop')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    device === key
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={`${config.name} (Ctrl+${Object.keys(DEVICE_CONFIGS).indexOf(key) + 1})`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              );
            })}         </div>
          
          
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="hidden sm:inline">Cargando...</span>
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar (F5)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Restaurar' : 'Maximizar'}</span>
          </button>
          
          <button
            onClick={() => window.open(currentUrl, '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva pestaña</span>
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cerrar (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Contenedor del preview */}
      <div className={`flex-1 flex items-center justify-center overflow-auto ${
        isFullscreen 
          ? 'bg-white p-0' 
          : 'p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200'
      }`}>
        <div className="relative flex items-center justify-center">
          {/* Loading indicator */}
          {isLoading && !isFullscreen && (
            <div className="preview-loading-overlay">
              <div className="preview-loading-spinner"></div>
            </div>
          )}
          
          {/* Marco del dispositivo */}
          <div
            className={`device-frame ${
              isFullscreen 
                ? 'w-full h-full' 
                : `${deviceConfig.containerClass} relative overflow-hidden`
            }`}
            style={isFullscreen ? {} : {
              width: `${transformedWidth}px`,
              height: `${transformedHeight}px`,
            }}
          >
            {/* Barra de estado simulada para móvil */}
            {device === 'mobile' && deviceConfig.showStatusBar && !isFullscreen && (
              <div className="device-status-bar bg-black text-white px-4 py-1 text-xs flex justify-between items-center">
                <span className="font-medium">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="signal-bars flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
                  </div>
                  <div className="w-6 h-3 border border-white rounded-sm ml-1">
                    <div className="w-4 h-full bg-white rounded-sm m-0.5"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Iframe con el contenido */}
            <div className={`${isFullscreen ? 'w-full h-full' : 'w-full h-full'} overflow-hidden`}>
              <iframe
                ref={iframeRef}
                key={previewKey}
                src={currentUrl}
                className="w-full h-full border-0"
                style={isFullscreen ? { 
                  width: '100vw', 
                  height: '100vh' 
                } : {
                  width: `${deviceConfig.width}px`,
                  height: `${deviceConfig.height - (device === 'mobile' && deviceConfig.showStatusBar ? 24 : 0)}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left'
                }}
                title={`Vista previa ${deviceConfig.name}`}
                onLoad={() => setIsLoading(false)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-navigation"
              />
            </div>
          </div>
          
          {/* Etiqueta del dispositivo - solo en modo normal */}
          {!isFullscreen && (
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg">
              <div className="flex items-center gap-2">
                <deviceConfig.icon className="w-3 h-3" />
                <span>{deviceConfig.name}</span>
                <span className="opacity-70">•</span>
                <span className="opacity-70">{deviceConfig.width}×{deviceConfig.height}</span>
                <span className="opacity-70">•</span>
                <span className="opacity-70">{Math.round(scale * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Atajos de teclado */}
      {!isFullscreen && (
        <div className="keyboard-shortcuts">
          <div className="space-y-1">
            <div><kbd>ESC</kbd> Cerrar</div>
            <div><kbd>F5</kbd> Actualizar</div>
            <div><kbd>Ctrl+1/2/3</kbd> Dispositivos</div>
            <div><kbd>Ctrl+Enter</kbd> Nueva pestaña</div>
          </div>
        </div>
      )}
    </div>
  );
}