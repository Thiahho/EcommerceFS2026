import Link from "next/link";
import { fetchCatalog } from "./lib/api";
import ProductCard from "./components/ProductCard";
import { ProductCatalogItem } from "./lib/types";

export default async function HomePage() {
  const fallbackProducts: ProductCatalogItem[] = [
    {
      id: 1,
      name: "Auriculares Nova Pro",
      brand: "Nova",
      slug: "auriculares-nova-pro",
      category: "Audio",
      minPrice: 189999,
      hasStock: true,
      hasActivePromotion: true,
      activePromotionType: 1,
      activePromotionValue: 15,
      imagePublicId: null,
    },
    {
      id: 2,
      name: "Notebook Slate 14",
      brand: "Slate",
      slug: "notebook-slate-14",
      category: "Notebooks",
      minPrice: 1299999,
      hasStock: true,
      hasActivePromotion: false,
      activePromotionType: null,
      activePromotionValue: null,
      imagePublicId: null,
    },
    {
      id: 3,
      name: "Smartphone Pulse 8",
      brand: "Pulse",
      slug: "smartphone-pulse-8",
      category: "Smartphones",
      minPrice: 799999,
      hasStock: true,
      hasActivePromotion: true,
      activePromotionType: 1,
      activePromotionValue: 10,
      imagePublicId: null,
    },
  ];

  let products: ProductCatalogItem[] = [];

  try {
    products = await fetchCatalog();
  } catch {
    products = fallbackProducts;
  }
  const promos = products
    .filter((product) => product.hasActivePromotion)
    .slice(0, 3);
  const highlighted = promos.length ? promos : products.slice(0, 3);
  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  ).slice(0, 4);
  const reviews = [
    {
      name: "Gabriel",
      title: "Totalmente recomendado",
      text: "La navegación es clara y el proceso de compra es rápido. Los productos llegaron impecables.",
    },
    {
      name: "Anya",
      title: "Experiencia premium",
      text: "El soporte respondió enseguida y el envío fue más veloz de lo esperado. Muy conforme.",
    },
    {
      name: "Luke",
      title: "Calidad real",
      text: "La calidad del producto superó lo que esperaba. Todo muy bien presentado.",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="grid gap-10 rounded-[32px] bg-gradient-to-br from-white via-mist to-slate-200/60 p-8 md:grid-cols-[1.15fr_1fr] md:p-12">
        <div className="space-y-6">
          <span className="badge bg-ink/10 text-ink">Entrega 24/48hs</span>
          <h1 className="text-4xl font-semibold text-ink md:text-5xl">
            Tecnología premium para un setup impecable.
          </h1>
          <p className="text-lg text-slate-600">
            Catálogo curado de smartphones, notebooks y audio con asesoría
            experta, envíos rápidos y stock real.
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
          <div className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-soft">
              Compra segura y soporte experto.
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-soft">
              Financiación flexible en cuotas.
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-soft">
              Garantía oficial en todo el catálogo.
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-3 shadow-soft">
            <video
              className="h-full w-full rounded-[28px] object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="/hero-poster.svg"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">LO MÁS COMPRADO</h2>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-slate-700"
          >
            Ver todo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlighted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-4">
        {categories.map((category) => (
          <div key={category} className="card">
            <h3 className="text-lg font-semibold text-ink">{category}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Curado para alto rendimiento.
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 rounded-[32px] bg-gradient-to-br from-ink via-slate-800 to-slate-900 p-8 md:grid-cols-2 md:p-12">
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-[24px] shadow-2xl">
            <video
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/notebook.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-6 text-white">
          <span className="badge w-fit bg-white/10 text-white">Notebooks</span>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Potencia para crear sin límites.
          </h2>
          <p className="text-lg text-slate-300">
            Notebooks de última generación con procesadores de alto rendimiento,
            pantallas de alta resolución y diseño ultraportátil.
          </p>
          <div>
            <Link
              href="/catalogo?category=Notebooks"
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
            >
              Explorar notebooks
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Productos en tendencia</h2>
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-slate-700"
          >
            Ver todo
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft md:p-12">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Comentarios de clientes</h2>
          <span className="text-sm text-slate-500">Opiniones recientes</span>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-ink">{review.name}</span>
                <span>★★★★★</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {review.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
