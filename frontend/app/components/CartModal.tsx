"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../hooks/useCart";

const cartOpenEvent = "cart:open";

export default function CartModal() {
  const { items, total, removeItem, updateItemQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const itemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(cartOpenEvent, handleOpen);
    return () => window.removeEventListener(cartOpenEvent, handleOpen);
  }, []);

  const handleDecrease = (variantId: number, quantity: number) => {
    updateItemQuantity(variantId, quantity - 1);
  };

  const handleIncrease = (variantId: number, quantity: number) => {
    updateItemQuantity(variantId, quantity + 1);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center gap-2 rounded-full border border-cloud px-4 py-2 text-xs font-semibold text-ink"
      >
        Carrito
        {itemsCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold text-white">
            {itemsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink/40 p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 h-full w-full"
            aria-label="Cerrar carrito"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
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
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-sand">
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
                            className="h-7 w-7 rounded-full border border-cloud text-sm font-semibold text-ink"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">
                          ${(item.price * item.quantity).toLocaleString("es-AR")}
                        </p>
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
        </div>
      )}
    </>
  );
}
