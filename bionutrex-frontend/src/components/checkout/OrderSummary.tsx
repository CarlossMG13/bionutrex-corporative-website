import type { CartItem } from "@/contexts/CartContext";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

interface Props {
  cartItems: CartItem[];
  cartTotal: number;
}

export function OrderSummary({ cartItems, cartTotal }: Props) {

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 sticky top-28">
      <h2 className="text-white font-black text-sm uppercase tracking-widest mb-6">
        Resumen del pedido
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={resolveUrl(item.product.imageUrl)}
                alt={item.product.name}
                className="w-14 h-14 object-cover rounded-xl"
              />
              <span className="absolute -top-1.5 -right-1.5 bg-[#0d40a5] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{item.product.name}</p>
              <p className="text-white/40 text-xs truncate">{item.variant.name}</p>
            </div>
            <p className="text-white font-bold text-sm shrink-0">
              ${(item.variant.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 mb-4" />

      {/* Totals */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Subtotal</span>
          <span className="text-white font-medium">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Envío</span>
          <span className="text-green-400 font-bold">Gratis</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">IVA</span>
          <span className="text-white/40 text-xs font-medium">Incluido en el precio</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-end">
          <span className="text-white font-black text-sm uppercase tracking-widest">Total</span>
          <span className="text-[#00e5ff] font-black text-2xl">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-white/30">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Pago seguro</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/30">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">SSL</span>
        </div>
      </div>
    </div>
  );
}
