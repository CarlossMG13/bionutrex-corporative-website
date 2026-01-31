import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import LivePreview from '@/components/Admin/LivePreview';
import { Eye, Smartphone, Tablet, Monitor, Code, Palette } from 'lucide-react';
export function LivePreviewDemo() {
      const { isPreviewMode, setIsPreviewMode, previewDevice, setPreviewDevice } = useAdmin();
  const deviceOptions = [
        { value: 'mobile' as const, icon: Smartphone, name: 'Móvil', size: '375×812' },
        { value: 'tablet' as const, icon: Tablet, name: 'Tablet', size: '768×1024' },
        { value: 'desktop' as const, icon: Monitor, name: 'Escritorio', size: '1440×900' },

  ];
  return (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Vista Previa en Vivo</h2>
            <p className="text-gray-600">
              Previsualiza tus cambios en tiempo real en diferentes dispositivos
            </p>
          </div>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceOptions.map(({ value, icon: Icon, name, size }) => (
              <button
                key={value}
                onClick={() => {
                  setPreviewDevice(value);
                  setIsPreviewMode(true);

            }}
            className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-300 hover:-translate-y-1"
          >
                <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full transition-colors ${
                    previewDevice === value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'

              }`}>
                    <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                  Vista {name}
                </h3>
                <p className="text-sm text-gray-500">{size}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Main Preview Button */}
      <div className="text-center">
        <button
          onClick={() => setIsPreviewMode(true)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
              <Eye className="w-5 h-5" />
          <span>Abrir Vista Previa Completa</span>
        </button>
      </div>
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Code className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-900">Funciones Avanzadas</h3>
          </div>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• Simulación de diferentes dispositivos</li>
            <li>• Navegación de URLs personalizada</li>
            <li>• Modo pantalla completa</li>
            <li>• Actualización en tiempo real</li>
            <li>• Atajos de teclado</li>
          </ul>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900">Atajos de Teclado</h3>
          </div>
          <div className="space-y-2 text-sm text-purple-700">
            <div><kbd className="px-2 py-1 bg-purple-100 rounded text-xs font-mono">ESC</kbd> Cerrar preview</div>
            <div><kbd className="px-2 py-1 bg-purple-100 rounded text-xs font-mono">F5</kbd> Actualizar</div>
            <div><kbd className="px-2 py-1 bg-purple-100 rounded text-xs font-mono">Ctrl+1/2/3</kbd> Cambiar dispositivo</div>
            <div><kbd className="px-2 py-1 bg-purple-100 rounded text-xs font-mono">Ctrl+Enter</kbd> Nueva pestaña</div>
          </div>
        </div>
      </div>
      {/* Status */}
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isPreviewMode
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isPreviewMode ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          {isPreviewMode ? 'Vista previa activa' : 'Vista previa inactiva'}
        </div>
      </div>
      {/* Live Preview Component */}
      <LivePreview
        isOpen={isPreviewMode}
        device={previewDevice}
        onClose={() => setIsPreviewMode(false)}
        onDeviceChange={setPreviewDevice}
      />
    </div>
  );
}
export default LivePreviewDemo;