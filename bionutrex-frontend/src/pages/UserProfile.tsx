import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  User,
  LogOut,
  Zap,
  ShoppingBag,
  Phone,
  Mail,
  Save,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { userAPI } from "@/services/api";
import type { Order, CustomerUser } from "@/types";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pendiente",  cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  processing: { label: "Procesando", cls: "bg-blue-50 text-blue-600 border border-blue-200" },
  shipped:    { label: "Enviado",    cls: "bg-violet-50 text-violet-600 border border-violet-200" },
  delivered:  { label: "Entregado",  cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  cancelled:  { label: "Cancelado",  cls: "bg-red-50 text-red-500 border border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: "bg-gray-50 text-gray-500 border border-gray-200" };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const orderId = order.paymentIntentId?.slice(-8).toUpperCase() ?? String(order.id);
  const date = new Date(order.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 hover:border-[#0d40a5]/20 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#0d40a5] font-black text-base tracking-wider">#{orderId}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-gray-300" />
            <p className="text-gray-400 text-xs">{date}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2.5">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.product?.imageUrl ? (
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-10 h-10 object-cover rounded-xl shrink-0 bg-gray-50"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
            )}
            <p className="text-gray-700 text-sm truncate flex-1 font-semibold">
              {item.product?.name ?? "Producto"}{" "}
              <span className="text-gray-400 font-normal">×{item.quantity}</span>
            </p>
            <p className="text-gray-800 text-sm font-black shrink-0">
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-gray-400 text-xs pl-[52px]">
            +{order.items.length - 2} producto{order.items.length - 2 !== 1 ? "s" : ""} más
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Total</p>
        <p className="text-[#0d40a5] font-black text-base">${Number(order.total).toFixed(2)} MXN</p>
      </div>
    </div>
  );
}

// ─── Profile form ─────────────────────────────────────────────────────────────
function ProfileForm({ user, onUpdate }: { user: CustomerUser; onUpdate: (u: CustomerUser) => void }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateMe({ name, phone });
      onUpdate(data);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al actualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Nombre completo
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-gray-300 shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm
                         text-gray-800 outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                         transition-all bg-gray-50 hover:border-gray-300"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Teléfono
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 w-4 h-4 text-gray-300 shrink-0" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10 dígitos"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm
                         text-gray-800 outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                         transition-all bg-gray-50 hover:border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
          Correo electrónico
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 w-4 h-4 text-gray-300 shrink-0" />
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm
                       text-gray-400 bg-gray-50 cursor-not-allowed select-none"
          />
        </div>
        <p className="text-[10px] text-gray-400 ml-1">El correo no puede modificarse</p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 px-8 py-3 bg-[#0d40a5] hover:bg-[#0d40a5]/90
                   disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest
                   rounded-xl transition-colors cursor-pointer"
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar cambios
          </>
        )}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "pedidos" | "datos";

export default function UserProfile() {
  const { user: ctxUser, logout, loading } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === "datos" ? "datos" : "pedidos");

  // Sync tab with URL
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "pedidos" ? {} : { tab });
  };

  useEffect(() => {
    if (ctxUser) setUser(ctxUser);
  }, [ctxUser]);

  useEffect(() => {
    if (!loading && !ctxUser) navigate("/");
  }, [ctxUser, loading, navigate]);

  useEffect(() => {
    if (ctxUser) fetchOrders();
  }, [ctxUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await userAPI.getMyOrders();
      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#EEEEEE] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (user.name ?? user.email)
    .split(" ")
    .filter(Boolean)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "pedidos", label: "Mis Pedidos", icon: Package, count: orders.length },
    { id: "datos",   label: "Mi Perfil",   icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f6]">
      {/* ── Profile banner ── */}
      <div className="bg-[#0d40a5] pt-16 lg:pt-20">
        <div className="max-w-4xl mx-auto px-5 py-8 lg:py-10">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70
                       transition-colors text-[11px] font-bold uppercase tracking-widest mb-7"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Inicio
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/15 ring-2 ring-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <span className="font-black text-2xl tracking-tight text-white">{initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="font-black text-xl lg:text-2xl uppercase italic tracking-tight text-white truncate">
                {user.name ?? "Mi cuenta"}
              </h1>
              <p className="text-white/50 text-sm mt-0.5 truncate">{user.email}</p>

              <div className="flex items-center justify-center sm:justify-start gap-5 mt-4">
                <div className="text-center sm:text-left">
                  <p className="text-[#00e5ff] font-black text-xl leading-none">{orders.length}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">Pedidos</p>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center sm:text-left">
                  <p className="text-white/70 text-sm font-bold leading-none">{memberSince}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">Miembro desde</p>
                </div>
              </div>
            </div>

            {/* Logo (desktop only) + logout */}
            <div className="hidden sm:flex flex-col items-end gap-6 shrink-0">
              <Link to="/" className="flex items-center gap-1.5 opacity-30 hover:opacity-60 transition-opacity">
                <Zap className="w-4 h-4 text-[#00e5ff] fill-[#00e5ff]" />
                <span className="text-white font-black text-sm uppercase italic tracking-tight">Bionutrex</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/30 hover:text-white/70 text-[11px]
                           font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex gap-1">
            {tabs.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-[11px] font-black
                            uppercase tracking-widest transition-colors cursor-pointer rounded-t-xl ${
                  activeTab === id
                    ? "bg-[#f4f4f6] text-[#0d40a5]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === id
                      ? "bg-[#0d40a5] text-white"
                      : "bg-white/20 text-white/70"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* ── Pedidos ── */}
            {activeTab === "pedidos" && (
              <>
                {loadingOrders ? (
                  <div className="flex justify-center py-20">
                    <span className="w-8 h-8 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="font-black text-lg uppercase italic tracking-tight text-gray-700 mb-2">
                      Sin pedidos aún
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs">
                      Cuando realices tu primer pedido, aparecerá aquí.
                    </p>
                    <Link
                      to="/catalogo"
                      className="inline-block mt-7 bg-[#0d40a5] hover:bg-[#0d40a5]/90 text-white
                                 font-black text-[11px] uppercase tracking-widest px-7 py-3 rounded-xl
                                 transition-colors"
                    >
                      Explorar productos
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Datos / Perfil ── */}
            {activeTab === "datos" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="font-black text-base uppercase italic tracking-tight text-gray-800">
                    Información personal
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">Actualiza tus datos de contacto</p>
                </div>
                <ProfileForm user={user} onUpdate={setUser} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Logout mobile */}
        <div className="sm:hidden mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                       bg-red-50 hover:bg-red-100 text-red-500 font-black text-xs
                       uppercase tracking-widest transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
