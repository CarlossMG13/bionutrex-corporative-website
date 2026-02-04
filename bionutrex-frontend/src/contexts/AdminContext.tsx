import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Estado de edicion
interface EditingSection {
  id: string;
  name: string;
  type: string;
}

// Tipos de dispositivos para preview
type DeviceType = "desktop" | "tablet" | "mobile";

// Tipos de cambios pendientes
export interface PendingChange {
  id: string;
  type: 'section' | 'slider';
  action: 'update' | 'create' | 'delete' | 'visibility';
  data: any;
  timestamp: number;
}

interface AdminContexType {
  // Seccion que esta editando actualmente
  editingSection: EditingSection | null;
  setEditingSection: (section: EditingSection | null) => void;

  // Panel derecho abierto/cerrado
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;

  // Preview de dispositivos
  previewDevice: DeviceType;
  setPreviewDevice: (device: DeviceType) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;

  // Datos temporales de edicion
  editData: Record<string, any>;
  setEditData: (data: Record<string, any>) => void;
  updateEditField: (key: string, value: any) => void;

  // Cambios pendientes
  pendingChanges: PendingChange[];
  addPendingChange: (change: Omit<PendingChange, 'timestamp'>) => void;
  removePendingChange: (id: string) => void;
  clearPendingChanges: () => void;
  hasUnsavedChanges: boolean;
  isPublishing: boolean;
  setIsPublishing: (publishing: boolean) => void;
}

// Crear el contexto
const AdminContext = createContext<AdminContexType | undefined>(undefined);

// Provider del contexto
export function AdminProvider({ children }: { children: ReactNode }) {
  const [editingSection, setEditingSection] = useState<EditingSection | null>(
    null
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [previewDevice, setPreviewDevice] = useState<DeviceType>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Funcion para alternar el modo preview
  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  // Funcion para actualizar un campo especifico
  const updateEditField = (key: string, value: any) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  // Funciones para manejar cambios pendientes
  const addPendingChange = (change: Omit<PendingChange, 'timestamp'>) => {
    const newChange = {
      ...change,
      timestamp: Date.now()
    };
    setPendingChanges((prev) => {
      // Reemplazar si ya existe un cambio para el mismo item
      const filtered = prev.filter(c => c.id !== change.id || c.type !== change.type);
      return [...filtered, newChange];
    });
  };

  const removePendingChange = (id: string) => {
    setPendingChanges((prev) => prev.filter(c => c.id !== id));
  };

  const clearPendingChanges = () => {
    setPendingChanges([]);
  };

  const hasUnsavedChanges = pendingChanges.length > 0;

  return (
    <AdminContext.Provider
      value={{
        editingSection,
        setEditingSection,
        isPanelOpen,
        setIsPanelOpen,
        previewDevice,
        setPreviewDevice,
        isPreviewMode,
        setIsPreviewMode,
        togglePreviewMode,
        editData,
        setEditData,
        updateEditField,
        pendingChanges,
        addPendingChange,
        removePendingChange,
        clearPendingChanges,
        hasUnsavedChanges,
        isPublishing,
        setIsPublishing,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin debe usarse dentro de un AdminProvider");
  }
  return context;
}
