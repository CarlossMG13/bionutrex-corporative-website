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

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: "hidden" }}
          className="w-full bg-[#2a2a2a] z-40"
        >
          {/* ── MOBILE layout ── */}
          <div className="flex flex-col lg:hidden h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-[#00e5ff]" />
                <span className="text-white font-black text-base uppercase tracking-widest">
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
                    className="text-white/40 hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-bold"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Items — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                  <ShoppingCart className="w-16 h-16" />
                  <p className="text-base font-bold">Tu carrito está vacío</p>
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
                      className="w-20 h-20 object-cover rounded-xl shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-white font-black text-base leading-tight truncate">
                        {item.product.name}
                      </p>
                      <p className="text-white/40 text-sm truncate">
                        {item.variant.name}
                      </p>
                      <p className="text-[#00e5ff] font-black text-lg">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-white hover:text-[#00e5ff] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-black text-base w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-white hover:text-[#00e5ff] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-5 py-5 border-t border-white/10 shrink-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
                      Total
                    </p>
                    <p className="text-white font-black text-2xl">
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-white/30 text-sm">
                    {cartCount} {cartCount === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#0d40a5] hover:bg-[#0d40a5]/80 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-colors"
                >
                  Pagar ahora
                </button>
              </div>
            )}
          </div>

          {/* ── DESKTOP layout ── */}
          <div className="hidden lg:flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-[#00e5ff]" />
                <span className="text-white font-black text-sm uppercase tracking-widest">
                  Tu Carrito
                </span>
                {cartCount > 0 && (
                  <span className="bg-[#0d40a5] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-5">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-white/30 hover:text-red-400 transition-colors text-[11px] uppercase tracking-widest font-bold"
                  >
                    Vaciar todo
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items — grows up to 50vh then scrolls */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(50vh - 120px)" }}>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/20">
                  <ShoppingCart className="w-12 h-12" />
                  <p className="text-sm font-bold">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div className="grid grid-cols-[80px_1fr_180px_140px_100px_48px] items-center gap-4 px-8 py-2 border-b border-white/5">
                    <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold">Imagen</span>
                    <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold">Producto</span>
                    <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold">Variante</span>
                    <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold text-center">Cantidad</span>
                    <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold text-right">Precio</span>
                    <span />
                  </div>

                  {/* Rows */}
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[80px_1fr_180px_140px_100px_48px] items-center gap-4 px-8 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Image */}
                      <img
                        src={resolveUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />

                      {/* Name */}
                      <div className="min-w-0">
                        <p className="text-white font-black text-base leading-tight truncate">
                          {item.product.name}
                        </p>
                        {item.product.category?.name && (
                          <p className="text-[#0d40a5] text-[10px] font-bold uppercase tracking-wider mt-0.5">
                            {item.product.category.name}
                          </p>
                        )}
                      </div>

                      {/* Variant */}
                      <p className="text-white/50 text-sm truncate">{item.variant.name}</p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-center gap-3 bg-white/5 rounded-xl px-4 py-2 w-fit mx-auto">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-white font-black text-sm w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-[#00e5ff] font-black text-lg text-right">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Delete */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-white/10">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                      Total
                    </p>
                    <p className="text-white font-black text-2xl tracking-tight">
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-white/20 text-sm">
                    {cartCount} {cartCount === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-[#0d40a5] hover:bg-[#0d40a5]/80 text-white font-black text-xs uppercase tracking-widest px-10 py-3 rounded-xl transition-colors"
                >
                  Pagar ahora
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
