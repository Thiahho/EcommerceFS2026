"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { AdminProduct, AdminProductVariant } from "../../lib/adminTypes";
import { useAdminSession } from "../../hooks/useAdminSession";
import { CldImage, CldUploadWidget } from "next-cloudinary";

const emptyVariantForm = {
  color: "",
  ram: "",
  storage: "",
  sku: "",
  price: "" as unknown as number,
  stockActual: "" as unknown as number,
  stockReserved: "" as unknown as number,
  active: true,
  imagePublicId: "" as string | null,
};

export default function AdminVariantsPage() {
  const { token, isLoading } = useAdminSession();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState(emptyVariantForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadProducts = async () => {
      try {
        const response = await adminFetch<AdminProduct[]>(
          "/api/admin/products",
          token,
        );
        setProducts(response);
        if (!selectedProductId && response.length > 0) {
          setSelectedProductId(response[0].id);
        }
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los productos.",
        );
      }
    };

    loadProducts();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedProductId) {
      return;
    }

    const loadVariants = async () => {
      try {
        const response = await adminFetch<AdminProductVariant[]>(
          `/api/admin/variants/product/${selectedProductId}`,
          token,
        );
        setVariants(response);
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las variantes.",
        );
      }
    };

    loadVariants();
  }, [token, selectedProductId]);

  const resetForm = () => {
    setForm(emptyVariantForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!token || !selectedProductId) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      if (editingId) {
        const updated = await adminFetch<AdminProductVariant>(
          `/api/admin/variants/${editingId}`,
          token,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
        );
        setVariants((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
        setStatus("Variante actualizada.");
      } else {
        const created = await adminFetch<AdminProductVariant>(
          `/api/admin/variants/product/${selectedProductId}`,
          token,
          {
            method: "POST",
            body: JSON.stringify(form),
          },
        );
        setVariants((prev) => [created, ...prev]);
        setStatus("Variante creada.");
      }
      resetForm();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la variante.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (variant: AdminProductVariant) => {
    setEditingId(variant.id);
    setForm({
      color: variant.color,
      ram: variant.ram,
      storage: variant.storage,
      sku: variant.sku,
      price: variant.price,
      stockActual: variant.stockActual,
      stockReserved: variant.stockReserved,
      active: variant.active,
      imagePublicId: variant.imagePublicId,
    });
  };

  const handleDeactivate = async (variantId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("¿Querés desactivar esta variante?");
    if (!confirmed) {
      return;
    }

    try {
      await adminFetch(`/api/admin/variants/${variantId}`, token, {
        method: "DELETE",
      });
      setVariants((prev) =>
        prev.map((item) =>
          item.id === variantId ? { ...item, active: false } : item,
        ),
      );
      setStatus("Variante desactivada.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo desactivar la variante.",
      );
    }
  };

  const handleActivate = async (variantId: string) => {
    if (!token) {
      return;
    }

    try {
      const updated = await adminFetch<AdminProductVariant>(
        `/api/admin/variants/${variantId}/activate`,
        token,
        { method: "PATCH" },
      );
      setVariants((prev) =>
        prev.map((item) => (item.id === variantId ? updated : item)),
      );
      setStatus("Categoría activada.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo activar la categoría.",
      );
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
          <h1 className="text-2xl font-semibold text-ink">Variantes</h1>
          <p className="text-sm text-slate-500">
            Gestioná color, RAM, almacenamiento, stock y precio por variante.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm font-semibold text-ink hover:underline"
        >
          Volver al dashboard
        </Link>
      </header>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Producto asociado
            </h2>
            <p className="text-xs text-slate-500">
              Seleccioná el producto para ver sus variantes.
            </p>
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
            <h2 className="text-lg font-semibold text-ink">
              Listado de variantes
            </h2>
            <p className="text-xs text-slate-500">
              Mostramos variantes activas e inactivas.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Imagen</th>
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Color</th>
                  <th className="py-2 pr-4">RAM</th>
                  <th className="py-2 pr-4">Almacenamiento</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((variant) => (
                  <tr key={variant.id} className="text-slate-600">
                    <td className="py-3 pr-4">
                      {variant.imagePublicId ? (
                        <CldImage
                          src={variant.imagePublicId}
                          width={48}
                          height={48}
                          alt={variant.sku}
                          crop={{ type: "auto", source: true }}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          Sin img
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-ink">
                      {variant.sku}
                    </td>
                    <td className="py-3 pr-4">{variant.color}</td>
                    <td className="py-3 pr-4">{variant.ram}</td>
                    <td className="py-3 pr-4">{variant.storage}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {variant.stockActual} / {variant.stockReserved}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          variant.active ? "text-moss" : "text-slate-400"
                        }
                      >
                        {variant.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(variant)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Editar
                        </button>
                        {variant.active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(variant.id)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-500"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(variant.id)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-moss"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {variants.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={8}>
                      Seleccioná un producto para cargar variantes.
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
              {editingId ? "Editar variante" : "Crear variante"}
            </h2>
            <p className="text-xs text-slate-500">
              Definí atributos técnicos y stock para la variante seleccionada.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <input
              type="text"
              placeholder="Color"
              value={form.color}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, color: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="RAM (ej: 8GB)"
              value={form.ram}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ram: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Almacenamiento (ej: 256GB)"
              value={form.storage}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, storage: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="SKU"
              value={form.sku}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sku: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  price: Number(event.target.value),
                }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Stock actual"
                value={form.stockActual}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    stockActual: Number(event.target.value),
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <input
                type="number"
                placeholder="Stock reservado"
                value={form.stockReserved}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    stockReserved: Number(event.target.value),
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Variante activa
            </label>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">
                Imagen de la variante
              </p>
              <div className="flex items-center gap-4">
                {form.imagePublicId ? (
                  <CldImage
                    src={form.imagePublicId}
                    width={80}
                    height={80}
                    alt="Preview"
                    crop={{ type: "auto", source: true }}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                    Sin imagen
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <CldUploadWidget
                    uploadPreset="ecommerce_variants"
                    onSuccess={(result) => {
                      if (
                        result.info &&
                        typeof result.info === "object" &&
                        "public_id" in result.info
                      ) {
                        setForm((prev) => ({
                          ...prev,
                          imagePublicId: result.info.public_id as string,
                        }));
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-ink hover:bg-slate-50"
                      >
                        {form.imagePublicId ? "Cambiar imagen" : "Subir imagen"}
                      </button>
                    )}
                  </CldUploadWidget>
                  {form.imagePublicId && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, imagePublicId: null }))
                      }
                      className="text-xs text-red-500 hover:underline"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {status ? <p className="text-xs text-slate-500">{status}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
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
