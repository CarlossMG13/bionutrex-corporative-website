import { createContext, useContext, useState, type ReactNode } from "react";

// Estado de edicion
interface EditingSection {
  id: string;
  name: string;
  type: string;
}

// Tipos de dispositivos para preview
type DeviceType = "desktop" | "tablet" | "mobile";

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

  // Datos temporales de edicion
  editData: Record<string, any>;
  setEditData: (data: Record<string, any>) => void;
  updateEditField: (key: string, value: any) => void;
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

  // Funcion para actualizar un campo especifico
  const updateEditField = (key: string, value: any) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

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
        editData,
        setEditData,
        updateEditField,
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
