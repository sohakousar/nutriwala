import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/hooks/useProducts";

export interface CartItem {
  product: Product;
  quantity: number;
  isSubscription: boolean;
  subscriptionFrequency?: "weekly" | "bi-weekly" | "monthly";
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, isSubscription?: boolean, frequency?: CartItem["subscriptionFrequency"]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateSubscription: (productId: string, isSubscription: boolean, frequency?: CartItem["subscriptionFrequency"]) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "nutriwala_cart";
const SUBSCRIPTION_DISCOUNT = 0.1; // 10% off for subscriptions

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setAppliedCoupon(parsed.coupon || null);
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items,
      coupon: appliedCoupon,
    }));
  }, [items, appliedCoupon]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (
    product: Product,
    quantity = 1,
    isSubscription = false,
    subscriptionFrequency?: CartItem["subscriptionFrequency"]
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          isSubscription,
          subscriptionFrequency,
        };
        return updated;
      }

      return [...prev, { product, quantity, isSubscription, subscriptionFrequency }];
    });

    openCart();
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(quantity, 10) } : item
      )
    );
  };

  const updateSubscription = (
    productId: string,
    isSubscription: boolean,
    frequency?: CartItem["subscriptionFrequency"]
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, isSubscription, subscriptionFrequency: frequency }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const getItemCount = () => items.reduce((sum, item) => sum + item.quantity, 0);

  const getSubtotal = () =>
    items.reduce((sum, item) => {
      const price = item.isSubscription
        ? item.product.price * (1 - SUBSCRIPTION_DISCOUNT)
        : item.product.price;
      return sum + price * item.quantity;
    }, 0);

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    // Simple coupon logic - 10% off for demo
    const subtotal = getSubtotal();
    if (appliedCoupon === "WELCOME10") return subtotal * 0.1;
    if (appliedCoupon === "HEALTHY20") return subtotal * 0.2;
    return 0;
  };

  const getTotal = () => getSubtotal() - getDiscountAmount();

  const applyCoupon = (code: string): boolean => {
    const validCoupons = ["WELCOME10", "HEALTHY20"];
    const upperCode = code.toUpperCase();
    if (validCoupons.includes(upperCode)) {
      setAppliedCoupon(upperCode);
      return true;
    }
    return false;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        updateSubscription,
        clearCart,
        getItemCount,
        getSubtotal,
        getDiscountAmount,
        getTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
