import Image from 'next/image';
import Link from 'next/link';
import { ProductCatalogItem } from '../lib/types';

export default function ProductCard({ product }: { product: ProductCatalogItem }) {
  return (
    <article className="group flex flex-col rounded-3xl bg-white p-5 shadow-soft transition hover:-translate-y-1">
      <div className="relative mb-4 flex h-48 items-center justify-center rounded-2xl bg-sand">
        <Image
          src={`https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          width={220}
          height={220}
          className="object-contain"
        />
        {product.hasActivePromotion && (
          <span className="badge absolute left-3 top-3 bg-coral text-white">
            Promo activa
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.brand}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{product.name}</h3>
        <p className="mt-2 text-sm text-slate-500">{product.categoryName}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-ink">
          ${product.minPrice.toLocaleString('es-AR')}
        </span>
        <Link
          href={`/producto/${product.slug}`}
          className="rounded-full border border-ink px-4 py-2 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
        >
          Ver detalle
        </Link>
      </div>
      {!product.inStock && (
        <span className="mt-3 text-xs font-semibold text-rose-600">Sin stock</span>
      )}
    </article>
  );
}
