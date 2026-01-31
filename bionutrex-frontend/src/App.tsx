import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useLenis } from "./hooks/useLenis";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/admin/Login";
/* import Dashboard from "@/pages/admin/Dashboard";
import HomeEditor from "@/pages/admin/HomeEditor"; */
/* import About from "@/pages/About"; */

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import AdminLayout from "@/components/Admin/AdminLayout";

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

          {/* Rutas del panel de admin (con AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* <Route path="dashboard" element={<Dashboard />} />
            <Route path="home" element={<HomeEditor />} /> */}
            {/* Agregar más rutas aquí conforme las necesites */}
            {/* <Route path="products" element={<ProductCatalog />} /> */}
            {/* <Route path="clinical" element={<ClinicalData />} /> */}
            {/* <Route path="media" element={<MediaLibrary />} /> */}
            {/* <Route path="users" element={<UserManagement />} /> */}
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
      <AppContent />
    </Router>
  );
}

export default App;
