import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useLenis } from "./hooks/useLenis";
import { AdminProvider } from "@/contexts/AdminContext";
import { HomeDataProvider } from "@/contexts/HomeDataContext";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import HomeEditor from "@/pages/admin/HomeEditor";
import ProductCatalog from "@/pages/admin/ProductCatalog";
import ClinicalData from "@/pages/admin/ClinicalData";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import UserManagement from "@/pages/admin/UserManagement";
/* import About from "@/pages/About"; */

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import AdminLayout from "@/components/Admin/AdminLayout";
import { ProtectedRoute } from "@/components/Admin/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="grow">
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Home />} />

          {/* Ruta de Login (sin layout de admin) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Rutas del panel de admin (con AdminLayout y protección) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="home" element={<HomeEditor />} />
            <Route path="products" element={<ProductCatalog />} />
            <Route path="clinical" element={<ClinicalData />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  useLenis();
  return (
    <Router>
      <HomeDataProvider>
        <AdminProvider>
          <AppContent />
        </AdminProvider>
      </HomeDataProvider>
    </Router>
  );
}

export default App;
