"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import {
  AdminProduct,
  AdminPromotion,
  AdminPromotionProduct,
} from "../../lib/adminTypes";
import { useAdminSession } from "../../hooks/useAdminSession";

const promotionTypes = [
  { value: 1, label: "Porcentaje (%)" },
  { value: 2, label: "Descuento fijo" },
  { value: 3, label: "Precio especial" },
  { value: 4, label: "2x1" },
];

const emptyForm = {
  name: "",
  description: "",
  type: 1,
  value: 0,
  code: "",
  startsAt: "",
  endsAt: "",
  active: true,
  combinable: false,
};

const toInputDate = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
};

export default function AdminPromotionsPage() {
  const { token, isLoading } = useAdminSession();
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [assignedProducts, setAssignedProducts] = useState<
    AdminPromotionProduct[]
  >([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null,
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadData = async () => {
      try {
        const [promotionResponse, productResponse] = await Promise.all([
          adminFetch<AdminPromotion[]>("/api/admin/promotions", token),
          adminFetch<AdminProduct[]>("/api/admin/products", token),
        ]);
        setPromotions(promotionResponse);
        setProducts(productResponse);
        if (promotionResponse.length > 0) {
          setSelectedPromotionId(promotionResponse[0].id);
        }
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las promociones.",
        );
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedPromotionId) {
      setAssignedProducts([]);
      return;
    }

    const loadAssigned = async () => {
      try {
        const response = await adminFetch<AdminPromotionProduct[]>(
          `/api/admin/promotions/${selectedPromotionId}/products`,
          token,
        );
        setAssignedProducts(response);
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los productos promocionados.",
        );
      }
    };

    loadAssigned();
  }, [selectedPromotionId, token]);

  const handleSubmit = async () => {
    if (!token) {
      return;
    }

    if (!form.startsAt || !form.endsAt) {
      setStatus("Definí fecha de inicio y fin.");
      return;
    }

    const payload = {
      ...form,
      code: form.code ? form.code : null,
      value: form.type === 4 ? 0 : form.value,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    };

    setIsSaving(true);
    setStatus(null);

    try {
      if (selectedPromotionId) {
        const updated = await adminFetch<AdminPromotion>(
          `/api/admin/promotions/${selectedPromotionId}`,
          token,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        setPromotions((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setStatus("Promoción actualizada.");
      } else {
        const created = await adminFetch<AdminPromotion>(
          "/api/admin/promotions",
          token,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        setPromotions((prev) => [created, ...prev]);
        setSelectedPromotionId(created.id);
        setStatus("Promoción creada.");
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la promoción.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (promotion: AdminPromotion) => {
    setSelectedPromotionId(promotion.id);
    setForm({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      code: promotion.code ?? "",
      startsAt: toInputDate(promotion.startsAt),
      endsAt: toInputDate(promotion.endsAt),
      active: promotion.active,
      combinable: promotion.combinable,
    });
  };

  const handleAssignProduct = async () => {
    if (!token || !selectedPromotionId || !selectedProductId) {
      return;
    }

    setStatus(null);
    try {
      await adminFetch(
        `/api/admin/promotions/${selectedPromotionId}/products`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ productId: Number(selectedProductId) }),
        },
      );
      const response = await adminFetch<AdminPromotionProduct[]>(
        `/api/admin/promotions/${selectedPromotionId}/products`,
        token,
      );
      setAssignedProducts(response);
      setSelectedProductId("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo asignar el producto.",
      );
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!token || !selectedPromotionId) {
      return;
    }

    try {
      await adminFetch(
        `/api/admin/promotions/${selectedPromotionId}/products/${productId}`,
        token,
        { method: "DELETE" },
      );
      setAssignedProducts((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo quitar el producto.",
      );
    }
  };

  const typeLabel = useMemo(
    () =>
      promotionTypes.find((item) => item.value === form.type)?.label ??
      "Promoción",
    [form.type],
  );

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
          <span className="badge bg-ink/10 text-ink">Promociones</span>
          <h1 className="text-2xl font-semibold text-ink">
            Gestión de promociones
          </h1>
          <p className="text-sm text-slate-500">
            Creá descuentos, precios especiales y promociones 2x1.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm font-semibold text-ink hover:underline"
        >
          Volver al dashboard
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Promociones</h2>
            <p className="text-xs text-slate-500">
              Seleccioná una promoción para editar o asignar productos.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Vigencia</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotions.map((promotion) => {
                  const promotionType =
                    promotionTypes.find((item) => item.value === promotion.type)
                      ?.label ?? "Promoción";
                  const valueLabel =
                    promotion.type === 4
                      ? "2x1"
                      : promotion.type === 1
                        ? `${promotion.value}%`
                        : promotion.type === 2
                          ? `$${promotion.value}`
                          : `$${promotion.value}`;

                  return (
                    <tr key={promotion.id} className="text-slate-600">
                      <td className="py-3 font-semibold text-ink">
                        {promotion.name}
                      </td>
                      <td className="py-3">{promotionType}</td>
                      <td className="py-3">{valueLabel}</td>
                      <td className="py-3 text-xs">
                        {new Date(promotion.startsAt).toLocaleDateString()} -{" "}
                        {new Date(promotion.endsAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            promotion.active
                              ? "text-moss font-semibold"
                              : "text-slate-400"
                          }
                        >
                          {promotion.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(promotion)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {promotions.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={6}>
                      Todavía no hay promociones cargadas.
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
              {selectedPromotionId ? "Editar promoción" : "Crear promoción"}
            </h2>
            <p className="text-xs text-slate-500">
              Configurá vigencia, tipo y el valor de la promoción.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <input
              type="text"
              placeholder="Nombre de la promoción"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <textarea
              placeholder="Descripción"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="min-h-[90px] rounded-2xl border border-slate-200 px-4 py-3"
            />
            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: Number(event.target.value),
                  value: 0,
                }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              {promotionTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {form.type !== 4 ? (
              <input
                type="number"
                placeholder={
                  form.type === 1
                    ? "Porcentaje de descuento"
                    : form.type === 2
                      ? "Monto de descuento"
                      : "Precio promocional"
                }
                value={form.value}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    value: Number(event.target.value),
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Promoción 2x1 activa. El precio promocional se calcula en
                checkout.
              </div>
            )}
            <input
              type="text"
              placeholder="Código (opcional)"
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, code: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startsAt: event.target.value }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endsAt: event.target.value }))
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
              Promoción activa
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.combinable}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    combinable: event.target.checked,
                  }))
                }
              />
              Permitir combinar con otras promociones
            </label>
            <p className="text-xs text-slate-500">
              Tipo seleccionado: <span className="font-semibold">{typeLabel}</span>
            </p>
          </div>
          {status ? <p className="text-xs text-slate-500">{status}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Guardando..." : "Guardar promoción"}
            </button>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Productos en promoción
          </h2>
          <p className="text-xs text-slate-500">
            Asigná productos a la promoción seleccionada.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="min-w-[240px] rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Seleccioná un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAssignProduct}
            disabled={!selectedPromotionId || !selectedProductId}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Agregar a promoción
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">Marca</th>
                <th className="py-2">Slug</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedProducts.map((product) => (
                <tr key={product.productId} className="text-slate-600">
                  <td className="py-3 font-semibold text-ink">
                    {product.name}
                  </td>
                  <td className="py-3">{product.brand}</td>
                  <td className="py-3">{product.slug}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.productId)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-500"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
              {assignedProducts.length === 0 ? (
                <tr>
                  <td className="py-4 text-sm text-slate-400" colSpan={4}>
                    No hay productos asignados a esta promoción.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
