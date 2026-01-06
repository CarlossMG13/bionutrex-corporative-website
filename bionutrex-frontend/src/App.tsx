import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
/* import Home from "@/pages/Home"; */

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="grow">
          <Routes>
            {/* Rutas publicas */}
            {/* <Route path="/" element={<Home />} /> */}
            {/* <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} /> */}

            {/* Rutas privadas */}
            {/* <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/home" element={<HomeEditor />} />
            <Route path="/admin/blog" element={<BlogManagerPage />} /> */}
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
