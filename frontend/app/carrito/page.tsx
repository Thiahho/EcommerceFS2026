'use client';

import Link from 'next/link';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const { items, total, removeItem, clear } = useCart();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Carrito</h1>
        <p className="text-sm text-slate-600">Revisá tu selección antes de pasar al checkout.</p>
      </header>

      {items.length === 0 ? (
        <div className="card space-y-3">
          <p>Tu carrito está vacío.</p>
          <Link href="/catalogo" className="text-sm font-semibold text-moss">
            Volver al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="card flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                <p className="text-xs text-slate-500">{item.variantLabel}</p>
                <p className="mt-2 text-sm text-slate-600">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-ink">
                  ${(item.price * item.quantity).toLocaleString('es-AR')}
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

          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-semibold text-ink">${total.toLocaleString('es-AR')}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clear}
                className="rounded-full border border-ink px-5 py-2 text-xs font-semibold text-ink"
              >
                Vaciar carrito
              </button>
              <Link
                href="/checkout"
                className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white"
              >
                Continuar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
