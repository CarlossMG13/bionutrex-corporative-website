import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  User,
  LogOut,
  ChevronDown,
  Zap,
  ShoppingBag,
  ArrowLeft,
  Phone,
  Mail,
  Save,
  Calendar,
} from "lucide-react";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { userAPI } from "@/services/api";
import type { Order, CustomerUser } from "@/types";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pendiente",  cls: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Procesando", cls: "bg-blue-100 text-blue-700" },
  shipped:    { label: "Enviado",    cls: "bg-purple-100 text-purple-700" },
  delivered:  { label: "Entregado",  cls: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelado",  cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.cls}`}>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#0d40a5] font-black text-lg tracking-wider">#{orderId}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-gray-400" />
            <p className="text-gray-400 text-xs">{date}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items preview */}
      <div className="space-y-2.5">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.product?.imageUrl ? (
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-10 h-10 object-cover rounded-lg shrink-0 bg-gray-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            )}
            <p className="text-gray-700 text-sm truncate flex-1 font-medium">
              {item.product?.name ?? "Producto"}{" "}
              <span className="text-gray-400 font-normal">×{item.quantity}</span>
            </p>
            <p className="text-gray-600 text-sm font-bold shrink-0">
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

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Total pagado</p>
        <p className="text-[#0d40a5] font-black text-base">${Number(order.total).toFixed(2)} MXN</p>
      </div>
    </div>
  );
}

// ─── Accordion section (mobile) ───────────────────────────────────────────────
function AccordionSection({
  id,
  open,
  onToggle,
  icon,
  label,
  count,
  children,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#0d40a5]">{icon}</span>
          <span className="font-black text-sm uppercase tracking-wider text-gray-800">
            {label}
          </span>
          {count !== undefined && count > 0 && (
            <span className="bg-[#0d40a5] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`accordion-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <form onSubmit={handleSubmit} className="space-y-4 pt-3">
      {/* Name field */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Nombre completo
        </label>
        <div className="relative flex items-center">
          <User className="absolute left-3.5 w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                       text-gray-800 outline-none focus:border-[#0d40a5] transition-colors bg-gray-50"
          />
        </div>
      </div>

      {/* Phone field */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Teléfono
        </label>
        <div className="relative flex items-center">
          <Phone className="absolute left-3.5 w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10 dígitos"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm
                       text-gray-800 outline-none focus:border-[#0d40a5] transition-colors bg-gray-50"
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Correo electrónico
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 w-4 h-4 text-gray-300 shrink-0" />
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm
                       text-gray-400 bg-gray-50 cursor-not-allowed"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 ml-1">El correo no se puede cambiar</p>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#0d40a5] hover:bg-[#0d40a5]/90
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
export default function UserProfile() {
  const { user: ctxUser, logout, loading } = useAuthUser();
  const navigate = useNavigate();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<"pedidos" | "datos">("pedidos");
  const [openAccordion, setOpenAccordion] = useState<string | null>("pedidos");

  // Sync local user state with context user
  useEffect(() => {
    if (ctxUser) setUser(ctxUser);
  }, [ctxUser]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !ctxUser) {
      navigate("/");
    }
  }, [ctxUser, loading, navigate]);

  // Load orders
  useEffect(() => {
    if (ctxUser) fetchOrders();
  }, [ctxUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await userAPI.getMyOrders();
      setOrders(data);
    } catch {
      // silent fail
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const toggleAccordion = (key: string) =>
    setOpenAccordion((prev) => (prev === key ? null : key));

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

  // ── Shared avatar block ────────────────────────────────────────────────────
  const AvatarBlock = ({ dark = false }: { dark?: boolean }) => (
    <div className={`flex flex-col items-center text-center gap-4 ${dark ? "" : ""}`}>
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-[#0d40a5] flex items-center justify-center shadow-xl shadow-[#0d40a5]/30 ring-4 ring-white/10">
        <span className={`font-black text-2xl tracking-tight ${dark ? "text-white" : "text-white"}`}>
          {initials}
        </span>
      </div>
      {/* Info */}
      <div>
        <h2 className={`font-black text-lg uppercase italic tracking-tight ${dark ? "text-white" : "text-[#1a1a2e]"}`}>
          {user.name ?? "Mi cuenta"}
        </h2>
        <p className={`text-sm mt-0.5 ${dark ? "text-white/50" : "text-gray-500"}`}>
          {user.email}
        </p>
      </div>
      {/* Stats */}
      <div className={`flex items-center gap-5 mt-1 px-5 py-3 rounded-xl ${dark ? "bg-white/5" : "bg-gray-100"}`}>
        <div className="text-center">
          <p className="text-[#00e5ff] font-black text-xl leading-none">{orders.length}</p>
          <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${dark ? "text-white/40" : "text-gray-400"}`}>
            Pedidos
          </p>
        </div>
        <div className={`w-px h-8 ${dark ? "bg-white/10" : "bg-gray-200"}`} />
        <div className="text-center">
          <p className={`text-xs font-bold ${dark ? "text-white/70" : "text-gray-600"}`}>
            {memberSince}
          </p>
          <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${dark ? "text-white/40" : "text-gray-400"}`}>
            Miembro desde
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EEEEEE]">

      {/* ══════════════════════════════════════
          MOBILE layout (< lg)
      ══════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Hero oscuro */}
        <div className="bg-[#1a1a2e] px-6 pt-6 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-8 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <AvatarBlock dark />
        </div>

        {/* Acordeones */}
        <div className="px-4 py-6 space-y-3">
          {/* Pedidos */}
          <AccordionSection
            id="pedidos"
            open={openAccordion === "pedidos"}
            onToggle={() => toggleAccordion("pedidos")}
            icon={<Package className="w-4 h-4" />}
            label="Mis Pedidos"
            count={orders.length}
          >
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <span className="w-6 h-6 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-bold text-gray-400">Sin pedidos aún</p>
                <Link
                  to="/catalogo"
                  className="inline-block mt-4 text-xs font-black text-[#0d40a5] uppercase tracking-wider hover:underline"
                >
                  Explorar productos →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </AccordionSection>

          {/* Datos */}
          <AccordionSection
            id="datos"
            open={openAccordion === "datos"}
            onToggle={() => toggleAccordion("datos")}
            icon={<User className="w-4 h-4" />}
            label="Mis Datos"
          >
            <ProfileForm user={user} onUpdate={setUser} />
          </AccordionSection>

          {/* Sesión */}
          <AccordionSection
            id="sesion"
            open={openAccordion === "sesion"}
            onToggle={() => toggleAccordion("sesion")}
            icon={<LogOut className="w-4 h-4" />}
            label="Sesión"
          >
            <div className="pt-3 space-y-4">
              <p className="text-sm text-gray-500">
                Sesión activa como{" "}
                <strong className="text-gray-800">{user.email}</strong>
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP layout (≥ lg)
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen">

        {/* ── Sidebar ── */}
        <aside className="w-80 bg-[#1a1a2e] flex flex-col p-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto shrink-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <Zap className="w-5 h-5 text-[#00e5ff] fill-[#00e5ff]" />
            <span className="text-white font-black text-base uppercase italic tracking-tight">
              Bionutrex
            </span>
          </Link>

          <AvatarBlock dark />

          {/* Nav */}
          <nav className="mt-8 space-y-1">
            {(
              [
                { id: "pedidos", Icon: Package, label: "Mis Pedidos", count: orders.length },
                { id: "datos",   Icon: User,    label: "Mis Datos"   },
              ] as { id: "pedidos" | "datos"; Icon: React.ElementType; label: string; count?: number }[]
            ).map(({ id, Icon, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
                            transition-colors cursor-pointer text-left ${
                  activeTab === id
                    ? "bg-[#0d40a5] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {count !== undefined && count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === id ? "bg-white/20 text-white" : "bg-[#0d40a5]/50 text-white/70"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold
                         text-red-400/60 hover:text-red-400 hover:bg-red-500/10
                         rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 px-10 py-10 overflow-y-auto">
          <div className="max-w-3xl">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-[#1a1a2e]">
                {activeTab === "pedidos" ? "Mis Pedidos" : "Mis Datos"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === "pedidos"
                  ? `${orders.length} pedido${orders.length !== 1 ? "s" : ""} realizados`
                  : "Actualiza tu información de perfil"}
              </p>
            </div>

            {/* Animated content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "pedidos" ? (
                  loadingOrders ? (
                    <div className="flex justify-center py-16">
                      <span className="w-8 h-8 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-black uppercase italic text-gray-400">
                        Sin pedidos aún
                      </h3>
                      <p className="text-gray-400 text-sm mt-2">
                        Cuando realices tu primer pedido, aparecerá aquí.
                      </p>
                      <Link
                        to="/catalogo"
                        className="inline-block mt-8 bg-[#0d40a5] text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-[#0d40a5]/80 transition-colors"
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
                  )
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <ProfileForm user={user} onUpdate={setUser} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
