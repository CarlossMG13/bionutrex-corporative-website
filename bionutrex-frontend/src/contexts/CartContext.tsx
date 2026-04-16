import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { cartAPI } from "@/services/api";
import type { Product, ProductVariant } from "@/types";

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "bionutrex_cart";

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    saveToStorage(cartItems);
  }, [cartItems]);

  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id && item.variant.id === variant.id
        );
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          { id: `${product.id}-${variant.id}`, product, variant, quantity },
        ];
      });

      // Sync with backend (fire and forget)
      cartAPI.addItem(product.id).catch(() => {});

      // Toast
      toast.success(`${product.name} agregado al carrito`, {
        description: `${variant.name} — $${variant.price.toFixed(2)}`,
        action: {
          label: "Ver carrito",
          onClick: () => setIsCartOpen(true),
        },
      });

      setIsCartOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        cartAPI.deleteItem(item.product.id).catch(() => {});
      }
      return prev.filter((i) => i.id !== itemId);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => {
        const item = prev.find((i) => i.id === itemId);
        if (item) {
          cartAPI.deleteItem(item.product.id).catch(() => {});
        }
        return prev.filter((i) => i.id !== itemId);
      });
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const diff = quantity - item.quantity;
          if (diff > 0) {
            cartAPI.addItem(item.product.id).catch(() => {});
          } else {
            cartAPI.removeItem(item.product.id).catch(() => {});
          }
          return { ...item, quantity };
        })
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    cartAPI.clearCart().catch(() => {});
    toast.info("Carrito vaciado");
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        toggleCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
