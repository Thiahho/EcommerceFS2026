'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem } from '../lib/types';

const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: number) => void;
  updateItemQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
  total: number;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.variantId === item.variantId);
      if (existing) {
        return prev.map((entry) =>
          entry.variantId === item.variantId
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateItemQuantity = (variantId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      return prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      );
    });
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateItemQuantity, clear, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
