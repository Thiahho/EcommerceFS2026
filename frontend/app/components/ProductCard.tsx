"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { ProductCatalogItem } from "../lib/types";

const getPromotionLabel = (
  type: number | null,
  value: number | null,
) => {
  if (!type) {
    return null;
  }
  switch (type) {
    case 1:
      return value ? `${value}% OFF` : "Promo";
    case 2:
      return value ? `$${value} OFF` : "Descuento";
    case 3:
      return value ? `$${value} especial` : "Precio especial";
    case 4:
      return "2x1";
    default:
      return "Promo";
  }
};

const getDiscountedPrice = (
  price: number,
  type: number | null,
  value: number | null,
) => {
  if (!type || value === null) {
    return price;
  }

  switch (type) {
    case 1:
      return Math.max(price - price * (value / 100), 0);
    case 2:
      return Math.max(price - value, 0);
    case 3:
      return Math.max(value, 0);
    case 4:
      return price;
    default:
      return price;
  }
};

export default function ProductCard({
  product,
}: {
  product: ProductCatalogItem;
}) {
  const [mounted, setMounted] = useState(false);
  const promotionLabel = getPromotionLabel(
    product.activePromotionType,
    product.activePromotionValue,
  );
  const discountedPrice = getDiscountedPrice(
    product.minPrice,
    product.activePromotionType,
    product.activePromotionValue,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <article className="group flex flex-col rounded-3xl bg-white p-5 shadow-soft transition hover:-translate-y-1">
      <div className="object-contain p-2">
        {mounted && product.imagePublicId ? (
          <CldImage
            src={product.imagePublicId}
            alt={product.name}
            width={220}
            height={220}
            crop={{ type: "auto", source: true }}
            className="object-contain"
          />
        ) : (
          <div className="flex h-[220px] w-[220px] items-center justify-center bg-slate-100 rounded-xl">
            {!mounted ? (
              <span className="text-slate-400 text-sm">Cargando...</span>
            ) : (
              <Image
                src={`https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                width={220}
                height={220}
                className="object-contain"
              />
            )}
          </div>
        )}
        {product.hasActivePromotion && (
          <span className="badge absolute left-3 top-3 bg-coral text-white">
            {promotionLabel ?? "Promo activa"}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {product.brand}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{product.name}</h3>
        <p className="mt-2 text-sm text-slate-500">{product.category}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col" suppressHydrationWarning>
          {product.hasActivePromotion &&
          product.activePromotionType !== 4 &&
          discountedPrice < product.minPrice ? (
            <>
              <span className="text-xs text-slate-400 line-through" suppressHydrationWarning>
                ${product.minPrice.toLocaleString("es-AR")}
              </span>
              <span className="text-lg font-semibold text-ink" suppressHydrationWarning>
                ${discountedPrice.toLocaleString("es-AR")}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-ink" suppressHydrationWarning>
              ${product.minPrice.toLocaleString("es-AR")}
            </span>
          )}
        </div>
        <Link
          href={`/producto/${product.slug}`}
          className="rounded-full border border-ink px-4 py-2 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
        >
          Ver detalle
        </Link>
      </div>
      {!product.hasStock && (
        <span className="mt-3 text-xs font-semibold text-rose-600">
          Sin stock
        </span>
      )}
    </article>
  );
}
