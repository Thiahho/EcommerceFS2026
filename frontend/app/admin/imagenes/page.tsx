'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import { AdminProduct, AdminProductImage } from '../../lib/adminTypes';
import { useAdminSession } from '../../hooks/useAdminSession';

const emptyImageForm = {
  url: '',
  order: 1,
  altText: '',
  publicId: '',
};

export default function AdminImagesPage() {
  const { token, isLoading } = useAdminSession();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [form, setForm] = useState(emptyImageForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await adminFetch<AdminProduct[]>('/api/admin/products', token);
        setProducts(response);
        if (!selectedProductId && response.length > 0) {
          setSelectedProductId(response[0].id);
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'No se pudieron cargar los productos.');
      }
    };

    loadProducts();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProductId) {
      return;
    }

    const loadImages = async () => {
      try {
        const response = await adminFetch<AdminProductImage[]>(
          `/api/admin/images/product/${selectedProductId}`,
          token,
        );
        setImages(response);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'No se pudieron cargar las imágenes.');
      }
    };

    loadImages();
  }, [token, selectedProductId]);

  const resetForm = () => {
    setForm(emptyImageForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!token || !selectedProductId) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const payload = {
      url: form.url,
      order: form.order,
      altText: form.altText.trim() ? form.altText.trim() : null,
      publicId: form.publicId.trim() ? form.publicId.trim() : null,
    };

    try {
      if (editingId) {
        const updated = await adminFetch<AdminProductImage>(`/api/admin/images/${editingId}`, token, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setImages((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setStatus('Imagen actualizada.');
      } else {
        const created = await adminFetch<AdminProductImage>(
          `/api/admin/images/product/${selectedProductId}`,
          token,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
        );
        setImages((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        setStatus('Imagen creada.');
      }
      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar la imagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (image: AdminProductImage) => {
    setEditingId(image.id);
    setForm({
      url: image.url,
      order: image.order,
      altText: image.altText ?? '',
      publicId: image.publicId ?? '',
    });
  };

  const handleDelete = async (imageId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm('¿Querés eliminar esta imagen?');
    if (!confirmed) {
      return;
    }

    try {
      await adminFetch(`/api/admin/images/${imageId}`, token, { method: 'DELETE' });
      setImages((prev) => prev.filter((item) => item.id !== imageId));
      setStatus('Imagen eliminada.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo eliminar la imagen.');
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
          <h1 className="text-2xl font-semibold text-ink">Imágenes</h1>
          <p className="text-sm text-slate-500">
            Vinculá imágenes en Cloudinary y definí el orden de aparición.
          </p>
        </div>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-ink hover:underline">
          Volver al dashboard
        </Link>
      </header>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Producto asociado</h2>
            <p className="text-xs text-slate-500">Seleccioná el producto para administrar imágenes.</p>
          </div>
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="min-w-[240px] rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Listado de imágenes</h2>
            <p className="text-xs text-slate-500">Se ordenan por prioridad y orden.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Preview</th>
                  <th className="py-2">Orden</th>
                  <th className="py-2">Alt</th>
                  <th className="py-2">Cloudinary</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {images.map((image) => (
                  <tr key={image.id} className="text-slate-600">
                    <td className="py-3">
                      <img src={image.url} alt={image.altText ?? ''} className="h-10 w-10 rounded-lg object-cover" />
                    </td>
                    <td className="py-3">{image.order}</td>
                    <td className="py-3">{image.altText ?? '—'}</td>
                    <td className="py-3">{image.publicId ?? '—'}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(image)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {images.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={5}>
                      Seleccioná un producto para cargar imágenes.
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
              {editingId ? 'Editar imagen' : 'Crear imagen'}
            </h2>
            <p className="text-xs text-slate-500">
              Cargá URL pública de Cloudinary y el orden de aparición.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <input
              type="url"
              placeholder="URL de la imagen"
              value={form.url}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="number"
              placeholder="Orden de aparición"
              value={form.order}
              onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Texto alternativo"
              value={form.altText}
              onChange={(event) => setForm((prev) => ({ ...prev, altText: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Public ID en Cloudinary"
              value={form.publicId}
              onChange={(event) => setForm((prev) => ({ ...prev, publicId: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
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
