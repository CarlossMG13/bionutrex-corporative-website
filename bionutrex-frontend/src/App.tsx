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
import { CartProvider } from "@/contexts/CartContext";
import { AuthUserProvider } from "@/contexts/AuthUserContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthDrawer } from "@/components/auth/AuthDrawer";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/admin/Login";
import About from "./pages/About";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import VerifyEmail from "./pages/auth/VerifyEmail";
import UserProfile from "./pages/UserProfile";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import HomeEditor from "@/pages/admin/HomeEditor";
import ProductCatalog from "@/pages/admin/ProductCatalog";
import ClinicalData from "@/pages/admin/ClinicalData";
import MediaLibrary from "@/pages/admin/MediaLibrary";
import UserManagement from "@/pages/admin/UserManagement";
import GlobalEditor from "@/pages/admin/GlobalEditor";
import AboutEditor from "./pages/admin/AboutEditor";
import ProductsEditor from "./pages/admin/ProductsEditor";
import CategoriesEditor from "./pages/admin/CategoriesEditor";
import Resources from "./pages/Resources";
import ResourcesEditor from "./pages/admin/ResourcesEditor";
import OrdersManager from "./pages/admin/OrdersManager";

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import AdminLayout from "@/components/Admin/AdminLayout";
import { ProtectedRoute } from "@/components/Admin/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Lenis smooth scroll solo en rutas públicas
  useLenis(!isAdminRoute);

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col">
      {!isAdminRoute && <Navbar />}

      <main
        className={
          isAdminRoute
            ? "w-full"
            : "home-page w-full overflow-x-hidden min-h-screen pt-16 lg:pt-20"
        }
      >
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/catalogo/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/auth/verify" element={<VerifyEmail />} />
          <Route path="/perfil" element={<UserProfile />} />

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
            <Route path="global" element={<GlobalEditor />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="products-editor" element={<ProductsEditor />} />
            <Route path="categories-editor" element={<CategoriesEditor />} />
            <Route path="resources-editor" element={<ResourcesEditor />} />
            <Route path="orders" element={<OrdersManager />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* ── Fixed overlay drawers — rendered outside normal flow ── */}
      {!isAdminRoute && <AuthDrawer />}
      {!isAdminRoute && <CartDrawer />}

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <HomeDataProvider>
        <AdminProvider>
          <AuthUserProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthUserProvider>
        </AdminProvider>
      </HomeDataProvider>
    </Router>
  );
}

export default App;
