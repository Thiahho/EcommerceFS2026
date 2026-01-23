"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "../hooks/useCart";

const cartOpenEvent = "cart:open";
const minimumOpenMs = 3000;

export default function CartModal() {
  const { items, total, removeItem, updateItemQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openUntilRef = useRef(0);

  const itemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openCart = () => {
    clearCloseTimeout();
    setIsOpen(true);
    openUntilRef.current = Date.now() + minimumOpenMs;
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    const remaining = Math.max(openUntilRef.current - Date.now(), 0);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, remaining);
  };

  useEffect(() => {
    const handleOpen = () => openCart();
    window.addEventListener(cartOpenEvent, handleOpen);
    return () => {
      window.removeEventListener(cartOpenEvent, handleOpen);
      clearCloseTimeout();
    };
  }, []);

  const handleDecrease = (variantId: number, quantity: number) => {
    updateItemQuantity(variantId, quantity - 1);
  };

  const handleIncrease = (variantId: number, quantity: number) => {
    updateItemQuantity(variantId, quantity + 1);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end"
      onMouseEnter={openCart}
      onMouseLeave={scheduleClose}
    >
      <div className="flex flex-col items-end gap-3">
        {isOpen && (
          <div className="w-80 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Tu carrito</h2>
                <p className="text-xs text-slate-500">
                  {itemsCount} producto{itemsCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-slate-500"
              >
                Cerrar
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-cloud p-6 text-center text-sm text-slate-500">
                Tu carrito está vacío.
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center gap-4 rounded-2xl border border-cloud p-3"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-sand">
                        <img
                          src={
                            item.imagePublicId && cloudName
                              ? `https://res.cloudinary.com/${cloudName}/image/upload/${item.imagePublicId}`
                              : `https://placehold.co/120x120?text=${encodeURIComponent(
                                  item.name,
                                )}`
                          }
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.variantLabel}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecrease(item.variantId, item.quantity)
                            }
                            className="h-7 w-7 rounded-full border border-cloud text-sm font-semibold text-ink"
                          >
                            -
                          </button>
                          <span className="text-xs font-semibold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleIncrease(item.variantId, item.quantity)
                            }
                            disabled={item.quantity >= item.stockAvailable}
                            className="h-7 w-7 rounded-full border border-cloud text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">
                          Stock disponible: {item.stockAvailable}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-right">
                          {item.originalPrice &&
                          item.originalPrice > item.price ? (
                            <>
                              <p className="text-[11px] text-slate-400 line-through">
                                $
                                {(
                                  item.originalPrice * item.quantity
                                ).toLocaleString("es-AR")}
                              </p>
                              <p className="text-sm font-semibold text-ink">
                                ${(item.price * item.quantity).toLocaleString("es-AR")}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-ink">
                              ${(item.price * item.quantity).toLocaleString("es-AR")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="mt-2 text-xs font-semibold text-rose-600"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-sand p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Total</span>
                    <span className="text-lg font-semibold text-ink">
                      ${total.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href="/carrito"
                      className="flex-1 rounded-full border border-ink px-4 py-2 text-center text-xs font-semibold text-ink"
                      onClick={() => setIsOpen(false)}
                    >
                      Ver carrito
                    </Link>
                    <Link
                      href="/checkout"
                      className="flex-1 rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={openCart}
          className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg"
          aria-label="Abrir carrito"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4h-2l-1 2" />
            <path d="M5 6h14l-1.6 8.2a2 2 0 0 1-2 1.6h-7a2 2 0 0 1-2-1.6L4 6" />
            <path d="M9.5 20a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
            <path d="M16.5 20a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          </svg>
          {itemsCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold text-white">
              {itemsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
