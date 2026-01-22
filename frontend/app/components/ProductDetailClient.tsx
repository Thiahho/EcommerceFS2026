"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { ProductDetail } from "../lib/types";
import { useCart } from "../hooks/useCart";

export default function ProductDetailClient({
  product,
}: {
  product: ProductDetail;
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const variantsWithImage = product.variants.filter((v) => v.imagePublicId);

  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-3xl bg-transparent">
          {/* hace el cuadro siempre cuadrado y evita saltos */}
          <div className="relative aspect-square w-full">
            {selectedVariant?.imagePublicId ? (
              <CldImage
                src={selectedVariant.imagePublicId}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6 sm:p-8 md:p-10"
              />
            ) : (
              <Image
                src={`https://placehold.co/800x800?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain p-6 sm:p-8 md:p-10"
              />
            )}
          </div>
        </div>

        {variantsWithImage.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {variantsWithImage.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`relative aspect-square overflow-hidden rounded-2xl border bg-transparent ${
                  selectedVariant.id === variant.id
                    ? "border-ink ring-2 ring-ink"
                    : "border-cloud"
                }`}
              >
                <CldImage
                  src={variant.imagePublicId!}
                  alt={`${variant.color}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <span className="badge bg-moss/10 text-moss">{product.category}</span>
          <h1 className="text-3xl font-semibold text-ink">{product.name}</h1>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>

        <p className="text-base text-slate-600">{product.description}</p>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Variante
          </p>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                  selectedVariant.id === variant.id
                    ? "border-ink bg-ink text-white"
                    : "border-cloud bg-white text-ink"
                }`}
              >
                {variant.color} · {variant.ram} · {variant.storage}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-ink">
            ${selectedVariant.price.toLocaleString("es-AR")}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Stock disponible:{" "}
            {selectedVariant.stockActual - selectedVariant.stockReserved}
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
            onClick={() => {
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                variantId: selectedVariant.id,
                variantLabel: `${selectedVariant.color} / ${selectedVariant.ram} / ${selectedVariant.storage}`,
                price: selectedVariant.price,
                quantity,
                imagePublicId: selectedVariant.imagePublicId ?? null,
              });
              setAdded(true);
            }}
          >
            Agregar al carrito
          </button>
        </div>
        {added && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>Producto agregado al carrito.</span>
            <Link href="/carrito" className="font-semibold text-moss">
              Ir al carrito
            </Link>
            <Link href="/checkout" className="font-semibold text-ink">
              Finalizar compra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
