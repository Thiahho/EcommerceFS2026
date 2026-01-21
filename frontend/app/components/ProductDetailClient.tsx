'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductDetail } from '../lib/types';
import { useCart } from '../hooks/useCart';

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const images = product.images.length ? product.images : [];

  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <div className="relative flex h-96 items-center justify-center rounded-3xl bg-white shadow-soft">
          <Image
            src={images[0]?.url ?? `https://placehold.co/800x800?text=${encodeURIComponent(product.name)}`}
            alt={images[0]?.altText ?? product.name}
            width={480}
            height={480}
            className="object-contain"
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="rounded-2xl bg-white p-2 shadow">
              <Image src={image.url} alt={image.altText ?? product.name} width={100} height={100} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <span className="badge bg-moss/10 text-moss">{product.categoryName}</span>
          <h1 className="text-3xl font-semibold text-ink">{product.name}</h1>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>

        <p className="text-base text-slate-600">{product.description}</p>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Variante</p>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                  selectedVariant.id === variant.id
                    ? 'border-ink bg-ink text-white'
                    : 'border-cloud bg-white text-ink'
                }`}
              >
                {variant.color} · {variant.ram} · {variant.storage}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-ink">
            ${selectedVariant.price.toLocaleString('es-AR')}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Stock disponible: {selectedVariant.stockActual - selectedVariant.stockReserved}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-20 rounded-2xl border border-cloud px-3 py-2 text-center"
          />
          <button
            type="button"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                variantId: selectedVariant.id,
                variantLabel: `${selectedVariant.color} / ${selectedVariant.ram} / ${selectedVariant.storage}`,
                price: selectedVariant.price,
                quantity
              })
            }
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
