import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  FlaskConical,
  Image,
  Users,
  ExternalLink,
  Navigation2,
  Package,
  ShoppingCart,
  ShoppingBag,
  UserRound,
  UsersRound,
  Grid2X2,
  BookOpen,
} from "lucide-react";

const menuGroups = [
  {
    label: "PÁGINAS",
    items: [
      { label: "Home Editor", path: "/admin/home", icon: Home },
      { label: "About Editor", path: "/admin/about", icon: UsersRound },
      {
        label: "Productos Editor",
        path: "/admin/products-editor",
        icon: ShoppingBag,
      },
      {
        label: "Categorías Editor",
        path: "/admin/categories-editor",
        icon: Grid2X2,
      },
      {
        label: "Recursos Editor",
        path: "/admin/resources-editor",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "GLOBAL",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Datos Clínicos", path: "/admin/clinical", icon: FlaskConical },
      { label: "Navbar & Footer", path: "/admin/global", icon: Navigation2 },
      { label: "Media Library", path: "/admin/media", icon: Image },
      { label: "Usuarios", path: "/admin/users", icon: Users },
    ],
  },
  {
    label: "TIENDA",
    items: [
      { label: "Catálogo", path: "/admin/products", icon: Package },
      { label: "Movimientos", path: "/admin/orders", icon: ShoppingCart },
      { label: "Clientes", path: "/admin/customers", icon: UserRound },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#1a2b3c] text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0d40a5] rounded-lg flex items-center justify-center">
            <FlaskConical size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg canada">BIONUTREX</h1>
            <span className="text-xs text-white/50">SISTEMAS BIOTECH</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-5">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-extrabold tracking-[0.2em] text-white/30 uppercase px-4 mb-2">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-[#0d40a5] text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-gray-500 rounded-full overflow-hidden">
            <img src="" alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold">Lic. Angela</p>
            <p className="text-xs text-white/50">CEO Bionutrex</p>
          </div>
        </div>
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full bg-[#0d9488] hover:bg-[#0f766e] text-white py-3 rounded-lg transition-colors duration-300"
        >
          <ExternalLink size={16} />
          <span className="text-sm font-medium">Ver Sitio en Vivo</span>
        </Link>
      </div>
    </aside>
  );
}
