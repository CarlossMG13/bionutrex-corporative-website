import { Outlet } from "react-router-dom";
import { AdminProvider } from "@/contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import EditPanel from "./EditPanel";

export default function AdminLayout() {
  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Sidebar izquierdo */}
        <AdminSidebar />

        {/* Contenido Principal */}
        <div className="flex-1 ml-64 flex flex-col">
          {/* Topbar */}
          <AdminTopbar />

          {/* Area de contenido central (preview) */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-xl shadow-sm min-h-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Panel de edicion */}
        <EditPanel />
      </div>
    </AdminProvider>
  );
}
