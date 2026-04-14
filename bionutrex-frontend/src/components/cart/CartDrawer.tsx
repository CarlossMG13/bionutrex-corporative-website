import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace("/api", "") ||
  "http://localhost:3001";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
}

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[59]"
            onClick={closeCart}
          />

          {/* ── Panel ── */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[440px] bg-[#2a2a2a] z-[60] flex flex-col shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#00e5ff]" />
                <span className="text-white font-black text-sm uppercase tracking-widest">
                  Tu Carrito
                </span>
                {cartCount > 0 && (
                  <span className="bg-[#0d40a5] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-white/40 hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-bold cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Items — scrollable ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                  <ShoppingCart className="w-16 h-16" />
                  <p className="text-sm font-bold">Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white/5 rounded-2xl p-4"
                  >
                    {/* Image */}
                    <img
                      src={resolveUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-white font-black text-sm leading-tight truncate">
                        {item.product.name}
                      </p>
                      {item.product.category?.name && (
                        <p className="text-[#0d40a5] text-[10px] font-bold uppercase tracking-wider">
                          {item.product.category.name}
                        </p>
                      )}
                      <p className="text-white/40 text-xs truncate">{item.variant.name}</p>
                      <p className="text-[#00e5ff] font-black text-base">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-white/60 hover:text-[#00e5ff] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-white font-black text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-white/60 hover:text-[#00e5ff] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div className="px-6 py-5 border-t border-white/10 shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
                      Total
                    </p>
                    <p className="text-white font-black text-2xl tracking-tight">
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-white/30 text-sm">
                    {cartCount} {cartCount === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#0d40a5] hover:bg-[#0d40a5]/80 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Pagar ahora
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
