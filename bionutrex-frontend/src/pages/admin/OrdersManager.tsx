import { useEffect, useState } from "react";
import { Search, X, Package, ChevronDown } from "lucide-react";
import api from "@/services/api";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: string; name: string; imageUrl: string; badge?: string };
}

interface Order {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  total?: number;
  paid: boolean;
  status: string;
  paymentIntentId?: string;
  createdAt: string;
  items: OrderItem[];
}

interface Stats { status: string; _count: { id: number } }

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: "Pendiente",   bg: "bg-yellow-100", text: "text-yellow-700" },
  paid:       { label: "Pagado",      bg: "bg-blue-100",   text: "text-blue-700"   },
  processing: { label: "Preparando",  bg: "bg-purple-100", text: "text-purple-700" },
  shipped:    { label: "Enviado",     bg: "bg-orange-100", text: "text-orange-700" },
  delivered:  { label: "Entregado",   bg: "bg-green-100",  text: "text-green-700"  },
  cancelled:  { label: "Cancelado",   bg: "bg-red-100",    text: "text-red-700"    },
};

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeStatus !== "all") params.status = activeStatus;
      if (search) params.search = search;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.orders);
      setStats(res.data.stats);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeStatus, search]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status, paid: ["paid","processing","shipped","delivered"].includes(status) } : o)
      );
      if (selected?.id === orderId) setSelected((s) => s ? { ...s, status } : s);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const totalCount = stats.reduce((s, st) => s + st._count.id, 0);
  const getCount = (st: string) => stats.find((s) => s.status === st)?._count.id ?? 0;

  const paidOrders = orders.filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status)
  );
  const grossRevenue = paidOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const paidCount = paidOrders.length;
  // Comisión estimada de Stripe MX: 3.6% + $3 MXN por transacción
  const stripeFees = grossRevenue * 0.036 + paidCount * 3;
  const netRevenue = grossRevenue - stripeFees;

  const TABS = [
    { key: "all", label: "Todos", count: totalCount },
    ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({ key, label: cfg.label, count: getCount(key) })),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Movimientos</h1>
        <p className="text-gray-400 text-sm mt-1">Pedidos generados en la tienda</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total pedidos", value: totalCount, color: "text-gray-900", sub: null },
          { label: "Pendientes", value: getCount("pending"), color: "text-yellow-600", sub: null },
          { label: "Enviados", value: getCount("shipped"), color: "text-orange-500", sub: null },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}

        {/* Ingreso Bruto */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ingreso Bruto</p>
          <p className="text-2xl font-black text-green-600">${grossRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Total cobrado (IVA incl.)</p>
        </div>

        {/* Ingreso Neto */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ingreso Neto</p>
          <p className="text-2xl font-black text-emerald-700">${netRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            Después de comisiones Stripe (~${stripeFees.toFixed(2)})
          </p>
        </div>

        {/* Entregados */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Entregados</p>
          <p className="text-2xl font-black text-blue-600">{getCount("delivered")}</p>
          <p className="text-[10px] text-gray-400 mt-1">Pedidos completados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-[#0d40a5] outline-none"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 px-4 py-3 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === tab.key
                  ? "bg-[#0d40a5] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeStatus === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-300">
              <Package className="w-8 h-8 animate-pulse" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-300">
              <Package className="w-10 h-10" />
              <p className="text-sm font-medium">No hay pedidos</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Pedido", "Cliente", "Productos", "Total", "Status", "Fecha", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-5 py-4 font-black text-[#0d40a5]">#{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">{order.fullName}</p>
                      <p className="text-gray-400 text-xs">{order.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item) => (
                          <img
                            key={item.id}
                            src={resolveUrl(item.product.imageUrl)}
                            alt={item.product.name}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-black text-gray-900">
                      ${Number(order.total ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="appearance-none text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 pr-7 focus:border-[#0d40a5] outline-none bg-white cursor-pointer disabled:opacity-50"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900">Pedido #{selected.id}</h2>
                <p className="text-gray-400 text-sm">{formatDate(selected.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                  <p className="font-bold text-gray-900">{selected.fullName}</p>
                  <p className="text-gray-500 text-sm">{selected.email}</p>
                  {selected.phone && <p className="text-gray-500 text-sm">{selected.phone}</p>}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Enviar a</p>
                  <p className="text-gray-700 text-sm">{selected.address}</p>
                  {selected.city && (
                    <p className="text-gray-700 text-sm">
                      {selected.city}{selected.state ? `, ${selected.state}` : ""}{selected.zip ? ` CP ${selected.zip}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment info */}
              {selected.paymentIntentId && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">ID de Pago (Stripe)</p>
                  <p className="text-gray-600 text-xs font-mono">{selected.paymentIntentId}</p>
                </div>
              )}

              {/* Products */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Productos</p>
                <div className="space-y-3">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <img
                        src={resolveUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                        <p className="text-gray-400 text-xs">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-black text-gray-900 text-sm">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-black text-gray-900 uppercase tracking-wider text-sm">Total</span>
                <span className="font-black text-2xl text-[#0d40a5]">
                  ${Number(selected.total ?? 0).toFixed(2)}
                </span>
              </div>

              {/* Update status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Actualizar status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      disabled={updatingStatus || selected.status === key}
                      onClick={() => handleStatusUpdate(selected.id, key)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        selected.status === key
                          ? `${cfg.bg} ${cfg.text} ring-2 ring-offset-1 ring-current`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
