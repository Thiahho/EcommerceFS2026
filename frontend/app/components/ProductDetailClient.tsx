"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { ProductDetail } from "../lib/types";
import { useCart } from "../hooks/useCart";

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

export default function ProductDetailClient({
  product,
}: {
  product: ProductDetail;
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const variantsWithImage = product.variants.filter((v) => v.imagePublicId);
  const availableStock = Math.max(
    selectedVariant.stockActual - selectedVariant.stockReserved,
    0,
  );
  const hasPromotion = product.activePromotionType !== null;
  const promotionLabel = getPromotionLabel(
    product.activePromotionType,
    product.activePromotionValue,
  );
  const discountedPrice = getDiscountedPrice(
    selectedVariant.price,
    product.activePromotionType,
    product.activePromotionValue,
  );

  useEffect(() => {
    setQuantity((prev) => {
      if (availableStock <= 0) {
        return 0;
      }
      return Math.min(prev || 1, availableStock);
    });
  }, [availableStock]);
  const formatVariantLabel = (
    variant: ProductDetail["variants"][number],
    separator = " · ",
  ) => {
    const parts = [variant.color, variant.ram, variant.storage]
      .map((value) => value?.trim())
      .filter(Boolean);

    return parts.length ? parts.join(separator) : "Variante";
  };

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
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-moss/10 text-moss">{product.category}</span>
            {hasPromotion ? (
              <span className="badge bg-coral/10 text-coral">
                {promotionLabel ?? "Promo activa"}
              </span>
            ) : null}
          </div>
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
                {formatVariantLabel(variant)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {hasPromotion &&
            product.activePromotionType !== 4 &&
            discountedPrice < selectedVariant.price ? (
              <>
                <span className="text-xs text-slate-400 line-through">
                  ${selectedVariant.price.toLocaleString("es-AR")}
                </span>
                <span className="text-2xl font-semibold text-ink">
                  ${discountedPrice.toLocaleString("es-AR")}
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-ink">
                ${selectedVariant.price.toLocaleString("es-AR")}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Stock disponible:{" "}
            {selectedVariant.stockActual - selectedVariant.stockReserved}
          </span>
        </div>
        {hasPromotion && product.activePromotionType === 4 ? (
          <p className="text-xs text-slate-500">
            Promoción 2x1 activa. Llevás 2 y pagás 1 en el checkout.
          </p>
        ) : null}

        <div className="flex items-center gap-4">
          <input
            type="number"
            min={availableStock > 0 ? 1 : 0}
            max={availableStock}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.max(
                  availableStock > 0 ? 1 : 0,
                  Math.min(availableStock, Number(event.target.value)),
                ),
              )
            }
            className="w-20 rounded-2xl border border-cloud px-3 py-2 text-center"
          />
          <button
            type="button"
            disabled={availableStock <= 0 || quantity <= 0}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              if (availableStock <= 0 || quantity <= 0) {
                return;
              }
              const shouldApplyDiscount =
                hasPromotion &&
                product.activePromotionType !== 4 &&
                discountedPrice < selectedVariant.price;
              const finalPrice = shouldApplyDiscount
                ? discountedPrice
                : selectedVariant.price;
              addItem({
                id: product.id,
                name: product.name,
                slug: product.slug,
                variantId: selectedVariant.id,
                variantLabel: formatVariantLabel(selectedVariant, " / "),
                price: finalPrice,
                originalPrice: shouldApplyDiscount ? selectedVariant.price : null,
                quantity: Math.min(quantity, availableStock),
                stockAvailable: availableStock,
                imagePublicId: selectedVariant.imagePublicId ?? null,
              });
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("cart:open"));
              }
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
