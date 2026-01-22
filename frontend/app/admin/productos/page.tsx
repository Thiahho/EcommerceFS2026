'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import { AdminCategory, AdminProduct } from '../../lib/adminTypes';
import { useAdminSession } from '../../hooks/useAdminSession';

const emptyProductForm = {
  name: '',
  description: '',
  brand: '',
  slug: '',
  categoryId: '',
  active: true,
};

export default function AdminProductsPage() {
  const { token, isLoading } = useAdminSession();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const categoryLookup = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          adminFetch<AdminProduct[]>('/api/admin/products', token),
          adminFetch<AdminCategory[]>('/api/admin/categories', token),
        ]);
        setProducts(productsResponse);
        setCategories(categoriesResponse);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'No se pudo cargar la información.');
      }
    };

    loadData();
  }, [token]);

  const resetForm = () => {
    setForm(emptyProductForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!token) {
      return;
    }

    if (!form.categoryId) {
      setStatus('Seleccioná una categoría para el producto.');
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      if (editingId) {
        const updated = await adminFetch<AdminProduct>(`/api/admin/products/${editingId}`, token, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setProducts((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setStatus('Producto actualizado.');
      } else {
        const created = await adminFetch<AdminProduct>('/api/admin/products', token, {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setProducts((prev) => [created, ...prev]);
        setStatus('Producto creado.');
      }
      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      slug: product.slug,
      categoryId: product.categoryId,
      active: product.active,
    });
  };

  const handleDeactivate = async (productId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm('¿Querés desactivar este producto?');
    if (!confirmed) {
      return;
    }

    try {
      await adminFetch(`/api/admin/products/${productId}`, token, { method: 'DELETE' });
      setProducts((prev) => prev.map((item) => (item.id === productId ? { ...item, active: false } : item)));
      setStatus('Producto desactivado.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo desactivar el producto.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="badge bg-ink/10 text-ink">ABMS</span>
          <h1 className="text-2xl font-semibold text-ink">Productos</h1>
          <p className="text-sm text-slate-500">
            Creá, editá y desactivá productos del catálogo con control de categoría.
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-ink hover:underline">
          Volver al dashboard
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Listado</h2>
            <p className="text-xs text-slate-500">Se muestran productos activos e inactivos.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2">Marca</th>
                  <th className="py-2">Categoría</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="text-slate-600">
                    <td className="py-3 font-semibold text-ink">{product.name}</td>
                    <td className="py-3">{product.brand}</td>
                    <td className="py-3">{categoryLookup.get(product.categoryId) ?? 'Sin categoría'}</td>
                    <td className="py-3">
                      <span className={product.active ? 'text-moss' : 'text-slate-400'}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(product.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-500"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={5}>
                      Todavía no hay productos cargados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {editingId ? 'Editar producto' : 'Crear producto'}
            </h2>
            <p className="text-xs text-slate-500">
              Campos obligatorios: nombre, marca, slug y categoría.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Marca"
              value={form.brand}
              onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <textarea
              placeholder="Descripción"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3"
            />
            <select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Seleccioná una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Producto activo
            </label>
          </div>
          {status ? <p className="text-xs text-slate-500">{status}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
