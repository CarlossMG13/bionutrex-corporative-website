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
/* import About from "@/pages/About"; */

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

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

          {/* Rutas privadas */}
          <Route path="/admin/login" element={<Login />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  useLenis(); // Smooth scroll
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
