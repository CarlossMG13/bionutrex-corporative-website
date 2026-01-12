import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";

// Components
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#EEEEEE] flex flex-col">
        <Navbar />
        <main className="grow">
          <Routes>
            {/* Rutas publicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* <Route path="/blog/:slug" element={<BlogPostPage />} /> */}

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
