import Link from 'next/link';
import { fetchCatalog } from './lib/api';
import ProductCard from './components/ProductCard';

export default async function HomePage() {
  const products = await fetchCatalog();
  const promos = products.filter((product) => product.hasActivePromotion).slice(0, 3);
  const categories = Array.from(new Set(products.map((product) => product.category))).slice(0, 4);

  return (
    <div className="space-y-16">
      <section className="card grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <span className="badge bg-moss/10 text-moss">Entrega 24/48hs</span>
          <h1 className="text-4xl font-semibold text-ink md:text-5xl">
            Tecnología premium con precios de importación.
          </h1>
          <p className="text-lg text-slate-600">
            Catálogo curado de smartphones, notebooks y audio con soporte experto, envíos rápidos y stock real.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
            >
              Ver catálogo
            </Link>
            <Link
              href="/catalogo"
              className="rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink"
            >
              Ver promos
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-plum via-moss to-coral p-8 text-white shadow-soft">
          <h2 className="text-2xl font-semibold">Promos destacadas</h2>
          <p className="mt-2 text-sm text-white/80">Descuentos directos en productos seleccionados.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {promos.map((product) => (
              <li key={product.id} className="flex items-center justify-between">
                <span>{product.name}</span>
                <span className="text-xs font-semibold">{product.brand}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {categories.map((category) => (
          <div key={category} className="card">
            <h3 className="text-lg font-semibold text-ink">{category}</h3>
            <p className="mt-2 text-sm text-slate-500">Curado para alto rendimiento.</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Productos en tendencia</h2>
          <Link href="/catalogo" className="text-sm font-semibold text-moss">
            Ver todo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
