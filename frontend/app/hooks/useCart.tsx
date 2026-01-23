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
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as CartItem[];
    return parsed.map((item) => ({
      ...item,
      stockAvailable:
        typeof item.stockAvailable === "number"
          ? item.stockAvailable
          : item.quantity,
    }));
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.variantId === item.variantId);
      if (existing) {
        return prev.map((entry) => {
          if (entry.variantId !== item.variantId) {
            return entry;
          }
          const maxStock =
            typeof item.stockAvailable === "number"
              ? item.stockAvailable
              : entry.quantity;
          const nextQuantity = Math.min(
            entry.quantity + item.quantity,
            maxStock,
          );
          return {
            ...entry,
            quantity: nextQuantity,
            stockAvailable: maxStock,
            price: item.price,
            originalPrice: item.originalPrice ?? entry.originalPrice ?? null,
          };
        });
      }
      return [
        ...prev,
        {
          ...item,
          quantity: Math.min(item.quantity, item.stockAvailable),
        },
      ];
    });
  };

  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateItemQuantity = (variantId: number, quantity: number) => {
    setItems((prev) => {
      return prev.flatMap((item) => {
        if (item.variantId !== variantId) {
          return item;
        }
        const nextQuantity = Math.min(
          Math.max(quantity, 0),
          item.stockAvailable,
        );
        if (nextQuantity <= 0) {
          return [];
        }
        return { ...item, quantity: nextQuantity };
      });
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
