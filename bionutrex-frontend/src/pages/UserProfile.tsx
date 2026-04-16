import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Package,
  User,
  LogOut,
  ShoppingBag,
  Phone,
  Mail,
  Save,
  Calendar,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Home,
  Briefcase,
  Check,
  Truck,
  ClipboardList,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useAuthUser } from "@/contexts/AuthUserContext";
import { userAPI } from "@/services/api";
import type { Order, CustomerUser, UserAddress } from "@/types";

// ─── IVA helpers ──────────────────────────────────────────────────────────────
// El precio YA incluye IVA — se desglosa, no se suma
function extractIVA(totalWithIVA: number) {
  const base = totalWithIVA / 1.16;
  const iva  = totalWithIVA - base;
  return { base, iva };
}

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

// ─── Order progress bar ───────────────────────────────────────────────────────
const ORDER_STEPS = [
  { key: "pending",    label: "Recibido",   icon: ClipboardList },
  { key: "processing", label: "Preparando", icon: Package },
  { key: "shipped",    label: "Enviado",    icon: Truck },
  { key: "delivered",  label: "Entregado",  icon: Check },
];

function OrderProgressBar({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        <div>
          <p className="text-red-500 font-black text-xs uppercase tracking-wider">Pedido cancelado</p>
          <p className="text-red-400 text-xs mt-0.5">Este pedido fue cancelado</p>
        </div>
      </div>
    );
  }

  const currentIdx = ORDER_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative">
      {/* Connector line behind */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" style={{ zIndex: 0 }} />
      <div
        className="absolute top-5 left-5 h-0.5 bg-[#0d40a5] transition-all duration-500"
        style={{
          zIndex: 0,
          width: currentIdx === 0
            ? "0%"
            : `calc(${(currentIdx / (ORDER_STEPS.length - 1)) * 100}% - 0px)`,
        }}
      />

      <div className="relative flex justify-between" style={{ zIndex: 1 }}>
        {ORDER_STEPS.map((step, i) => {
          const Icon = step.icon;
          const done    = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-[#0d40a5] border-[#0d40a5]"
                    : current
                    ? "bg-white border-[#0d40a5] shadow-md shadow-[#0d40a5]/20"
                    : "bg-white border-gray-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    done ? "text-white" : current ? "text-[#0d40a5]" : "text-gray-300"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-wider text-center ${
                  done || current ? "text-[#0d40a5]" : "text-gray-300"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order detail drawer ──────────────────────────────────────────────────────
// Always mounted — CSS transform/opacity transitions for zero-latency GPU animation.
// Never use AnimatePresence/motion here: same issue as other drawers in this project.
function OrderDetailDrawer({
  isOpen,
  order,
  onClose,
}: {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  // Keep last non-null order so content stays visible during the close animation
  const lastOrderRef = useRef<Order | null>(null);
  if (order) lastOrderRef.current = order;
  const o = lastOrderRef.current;

  if (!o) return null;

  const orderId = o.paymentIntentId?.slice(-8).toUpperCase() ?? String(o.id);
  const date = new Date(o.createdAt).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
  const total = Number(o.total ?? 0);
  const { base, iva } = extractIVA(total);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-screen w-full sm:w-[480px] bg-white z-50 flex flex-col shadow-2xl"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[#0d40a5] font-black text-lg tracking-wider">#{orderId}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-gray-300" />
              <p className="text-gray-400 text-xs">{date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={o.status} />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* Progress bar */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-5">
              Estado del pedido
            </p>
            <OrderProgressBar status={o.status} />
          </div>

          {/* Products */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Productos
            </p>
            <div className="space-y-3">
              {o.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                >
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-bold truncate">
                      {item.product?.name ?? "Producto"}
                    </p>
                    <p className="text-gray-400 text-xs">×{item.quantity}</p>
                  </div>
                  <p className="text-gray-800 text-sm font-black shrink-0">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Desglose de pago
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal (sin IVA)</span>
                <span>${base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>IVA (16%)</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between font-black text-gray-900">
                <span>Total pagado</span>
                <span className="text-[#0d40a5]">${total.toFixed(2)} MXN</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {(o.address || o.city) && (
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Dirección de envío
              </p>
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <MapPin className="w-4 h-4 text-[#0d40a5] shrink-0 mt-0.5" />
                <div>
                  {o.fullName && (
                    <p className="text-gray-800 text-sm font-bold">{o.fullName}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-0.5">
                    {[o.address, o.city, o.state, o.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Order card (clickable) ───────────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const orderId = order.paymentIntentId?.slice(-8).toUpperCase() ?? String(order.id);
  const date = new Date(order.createdAt).toLocaleDateString("es-MX", {
    year: "numeric", month: "short", day: "numeric",
  });
  const total = Number(order.total ?? 0);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-5 space-y-4
                 hover:border-[#0d40a5]/25 hover:shadow-md transition-all duration-200 cursor-pointer
                 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#0d40a5] font-black text-base tracking-wider">#{orderId}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-gray-300" />
            <p className="text-gray-400 text-xs">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0d40a5] transition-colors" />
        </div>
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
        <p className="text-[#0d40a5] font-black text-base">${total.toFixed(2)} MXN</p>
      </div>
    </button>
  );
}

// ─── Address modal ────────────────────────────────────────────────────────────
// Always mounted — CSS opacity/scale transitions.
// Never use AnimatePresence/motion here.
const LABEL_OPTIONS = [
  { value: "Casa",    icon: Home },
  { value: "Trabajo", icon: Briefcase },
  { value: "Otro",    icon: MapPin },
];

function AddressModal({
  isOpen,
  address,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  address?: UserAddress | null;
  onClose: () => void;
  onSave: (addr: UserAddress) => void;
}) {
  const [label,     setLabel]     = useState(address?.label    ?? "Casa");
  const [street,    setStreet]    = useState(address?.address  ?? "");
  const [city,      setCity]      = useState(address?.city     ?? "");
  const [state,     setState]     = useState(address?.state    ?? "");
  const [zip,       setZip]       = useState(address?.zip      ?? "");
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [saving,    setSaving]    = useState(false);

  // Reset fields when the modal opens with a different address
  useEffect(() => {
    if (isOpen) {
      setLabel(address?.label    ?? "Casa");
      setStreet(address?.address ?? "");
      setCity(address?.city      ?? "");
      setState(address?.state    ?? "");
      setZip(address?.zip        ?? "");
      setIsDefault(address?.isDefault ?? false);
    }
  }, [isOpen, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) return;
    setSaving(true);
    try {
      if (address) {
        const { data } = await userAPI.updateAddress(address.id, { label, address: street, city, state, zip, isDefault });
        onSave(data);
        toast.success("Dirección actualizada");
      } else {
        const { data } = await userAPI.createAddress({ label, address: street, city, state, zip, isDefault });
        onSave(data);
        toast.success("Dirección agregada");
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? "Error al guardar dirección");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        style={{
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-800">
            {address ? "Editar dirección" : "Nueva dirección"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              {LABEL_OPTIONS.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLabel(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2
                              text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    label === value
                      ? "border-[#0d40a5] bg-[#0d40a5]/5 text-[#0d40a5]"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Calle y número
            </label>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Calle, número, colonia"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                         outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                         transition-all bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Ciudad
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad de México"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800
                           outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                           transition-all bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Estado
              </label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CDMX"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-800
                           outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                           transition-all bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
              Código postal
            </label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="06600"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                         outline-none focus:border-[#0d40a5] focus:ring-2 focus:ring-[#0d40a5]/10
                         transition-all bg-gray-50"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsDefault((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                isDefault ? "bg-[#0d40a5]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isDefault ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-xs font-bold text-gray-600">Establecer como predeterminada</span>
          </label>

          <button
            type="submit"
            disabled={saving || !street || !city || !state || !zip}
            className="w-full py-3.5 bg-[#0d40a5] hover:bg-[#0d40a5]/90 disabled:opacity-50
                       text-white font-black text-xs uppercase tracking-widest rounded-xl
                       transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar dirección
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Profile form ─────────────────────────────────────────────────────────────
function ProfileForm({ user, onUpdate }: { user: CustomerUser; onUpdate: (u: CustomerUser) => void }) {
  const [name,  setName]  = useState(user.name  ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const hasChanges = name !== (user.name ?? "") || phone !== (user.phone ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
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
        disabled={saving || !hasChanges}
        className={`flex items-center justify-center gap-2 px-8 py-3 font-black text-xs uppercase
                   tracking-widest rounded-xl transition-colors cursor-pointer ${
          hasChanges && !saving
            ? "bg-[#0d40a5] hover:bg-[#0d40a5]/90 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
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

// ─── Addresses section ────────────────────────────────────────────────────────
function AddressesSection() {
  const [addresses,    setAddresses]    = useState<UserAddress[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<UserAddress | null>(null);
  const [deletingId,   setDeletingId]   = useState<number | null>(null);

  useEffect(() => {
    userAPI.getAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (saved: UserAddress) => {
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      let next = exists
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved];
      if (saved.isDefault) {
        next = next.map((a) => (a.id === saved.id ? a : { ...a, isDefault: false }));
      }
      return next;
    });
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await userAPI.deleteAddress(id);
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        const wasDefault = prev.find((a) => a.id === id)?.isDefault;
        if (wasDefault && filtered.length > 0) filtered[0] = { ...filtered[0], isDefault: true };
        return filtered;
      });
      toast.success("Dirección eliminada");
    } catch {
      toast.error("Error al eliminar dirección");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await userAPI.setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success("Dirección predeterminada actualizada");
    } catch {
      toast.error("Error al actualizar dirección predeterminada");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="w-6 h-6 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">Sin direcciones guardadas</p>
            <p className="text-xs mt-1">Agrega hasta 3 direcciones para agilizar tus pedidos</p>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`flex items-start gap-3 px-4 py-4 rounded-xl border-2 transition-colors ${
              addr.isDefault ? "border-[#0d40a5]/30 bg-[#0d40a5]/3" : "border-gray-100"
            }`}
          >
            <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${addr.isDefault ? "text-[#0d40a5]" : "text-gray-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-black uppercase tracking-wider ${addr.isDefault ? "text-[#0d40a5]" : "text-gray-600"}`}>
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[9px] font-black bg-[#0d40a5]/10 text-[#0d40a5] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Predeterminada
                  </span>
                )}
              </div>
              <p className="text-gray-800 text-sm font-medium">{addr.address}</p>
              <p className="text-gray-400 text-xs">{addr.city}, {addr.state} {addr.zip}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  title="Establecer como predeterminada"
                  className="text-gray-300 hover:text-[#0d40a5] transition-colors cursor-pointer"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => { setEditing(addr); setModalOpen(true); }}
                className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deletingId === addr.id}
                className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingId === addr.id
                  ? <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin block" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        ))}

        {addresses.length < 3 && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed
                       border-gray-200 text-gray-400 hover:border-[#0d40a5]/30 hover:text-[#0d40a5]
                       transition-colors text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar dirección ({addresses.length}/3)
          </button>
        )}
      </div>

      {/* Always mounted — CSS transitions handle open/close */}
      <AddressModal
        isOpen={modalOpen}
        address={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = "pedidos" | "datos";

export default function UserProfile() {
  const { user: ctxUser, logout, loading } = useAuthUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user,          setUser]          = useState<CustomerUser | null>(null);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabParam   = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === "datos" ? "datos" : "pedidos");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "pedidos" ? {} : { tab });
  };

  useEffect(() => { if (ctxUser) setUser(ctxUser); }, [ctxUser]);
  useEffect(() => { if (!loading && !ctxUser) navigate("/"); }, [ctxUser, loading, navigate]);
  useEffect(() => { if (ctxUser) fetchOrders(); }, [ctxUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await userAPI.getMyOrders();
      setOrders(data);
    } catch { /* silent */ }
    finally { setLoadingOrders(false); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#0d40a5]/30 border-t-[#0d40a5] rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (user.name ?? user.email)
    .split(" ").filter(Boolean)
    .map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString("es-MX", {
    year: "numeric", month: "long",
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "pedidos", label: "Mis Pedidos", count: orders.length },
    { id: "datos",   label: "Mi Perfil" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f6]">

      {/* ── Profile banner ── */}
      <div className="bg-[#0d40a5] pt-16 lg:pt-20">
        <div className="max-w-4xl mx-auto px-5 py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/15 ring-2 ring-white/20 flex items-center
                            justify-center shrink-0 backdrop-blur-sm">
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
                    activeTab === id ? "bg-[#0d40a5] text-white" : "bg-white/20 text-white/70"
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
        {/* Pedidos */}
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
                             font-black text-[11px] uppercase tracking-widest px-7 py-3 rounded-xl transition-colors"
                >
                  Explorar productos
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Mi Perfil */}
        {activeTab === "datos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-black text-base uppercase italic tracking-tight text-gray-800">
                  Información personal
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">Actualiza tus datos de contacto</p>
              </div>
              <ProfileForm user={user} onUpdate={setUser} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="font-black text-base uppercase italic tracking-tight text-gray-800">
                  Direcciones de envío
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Guarda hasta 3 direcciones para agilizar tus compras
                </p>
              </div>
              <AddressesSection />
            </div>

            {/* Logout en Mi Perfil */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           bg-red-50 hover:bg-red-100 text-red-500 font-black text-xs
                           uppercase tracking-widest transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order detail drawer — always mounted, CSS transitions */}
      <OrderDetailDrawer
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
