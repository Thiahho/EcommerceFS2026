"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchCatalog } from "../lib/api";
import { ProductCatalogItem } from "../lib/types";

const INITIAL_PER_CATEGORY = 3;

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [promo, setPromo] = useState(false);
  const [stock, setStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // { "Smartphones": true/false }
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCatalog({
          brand: brand || undefined,
          category: category || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          hasPromotion: promo ? "true" : undefined,
          inStock: stock ? "true" : undefined,
        } as Record<string, string>);
        setProducts(data);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
        setError(
          "No pudimos cargar el catálogo. Verificá que el backend esté en http://localhost:51364.",
        );
      }
      setLoading(false);
    }
    load();
  }, [brand, category, minPrice, maxPrice, promo, stock]);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  // Agrupar productos por categoría (ordenado)
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, ProductCatalogItem[]>();

    for (const p of products) {
      const key = p.category || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    // opcional: ordenar productos dentro de cada categoría
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      map.set(key, list);
    }

    // orden de categorías
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-ink">Catálogo</h1>
        <p className="text-sm text-slate-600">
          Filtrá por marca, categoría, rango de precio y promos activas.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="card space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Marca
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-cloud bg-white px-4 py-2 text-sm"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="">Todas</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Categoría
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-cloud bg-white px-4 py-2 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Precio
            </label>
            <input
              className="rounded-2xl border border-cloud bg-white px-4 py-2 text-sm"
              placeholder="Mínimo"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
            <input
              className="rounded-2xl border border-cloud bg-white px-4 py-2 text-sm"
              placeholder="Máximo"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={promo}
              onChange={(event) => setPromo(event.target.checked)}
            />
            Solo promos activas
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={stock}
              onChange={(event) => setStock(event.target.checked)}
            />
            Solo con stock
          </label>
        </aside>

        <div className="space-y-8">
          {loading ? (
            <div className="card">Cargando catálogo...</div>
          ) : error ? (
            <div className="card text-sm text-rose-600">{error}</div>
          ) : groupedByCategory.length === 0 ? (
            <div className="card text-sm text-slate-600">
              No hay productos con los filtros seleccionados.
            </div>
          ) : (
            groupedByCategory.map(([cat, items]) => {
              const isExpanded = !!expanded[cat];
              const visible = isExpanded
                ? items
                : items.slice(0, INITIAL_PER_CATEGORY);
              const hasMore = items.length > INITIAL_PER_CATEGORY;

              return (
                <section key={cat} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-ink">{cat}</h2>
                      <p className="text-xs text-slate-500">
                        {items.length} producto{items.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="rounded-full border border-ink px-4 py-2 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
                      >
                        {isExpanded ? "Ver menos" : "Ver más"}
                      </button>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {visible.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
