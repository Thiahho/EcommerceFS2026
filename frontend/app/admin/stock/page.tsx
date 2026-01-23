"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { AdminStockVariant } from "../../lib/adminTypes";
import { useAdminSession } from "../../hooks/useAdminSession";

type StockFormState = {
  stockActual: number;
  stockReserved: number;
};

const statusConfig = [
  {
    label: "Crítico",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  {
    label: "Bajo",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    label: "Normal",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  {
    label: "Holgado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

const getStockStatus = (available: number) => {
  if (available < 3) {
    return statusConfig[0];
  }
  if (available < 5) {
    return statusConfig[1];
  }
  if (available >= 10) {
    return statusConfig[3];
  }
  return statusConfig[2];
};

export default function AdminStockAuditPage() {
  const { token, isLoading } = useAdminSession();
  const [variants, setVariants] = useState<AdminStockVariant[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<StockFormState>({
    stockActual: 0,
    stockReserved: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadStock = useCallback(async () => {
    if (!token) {
      return;
    }

    setStatus(null);
    try {
      const response = await adminFetch<AdminStockVariant[]>(
        "/api/admin/variants/stock",
        token,
      );
      setVariants(response);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la auditoría de stock.",
      );
    }
  }, [token]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const filteredVariants = useMemo(() => {
    if (!search.trim()) {
      return variants;
    }

    const term = search.trim().toLowerCase();
    return variants.filter((variant) =>
      [
        variant.productName,
        variant.sku,
        variant.color,
        variant.ram,
        variant.storage,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [search, variants]);

  const handleEdit = (variant: AdminStockVariant) => {
    setEditingId(variant.id);
    setForm({
      stockActual: variant.stockActual,
      stockReserved: variant.stockReserved,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ stockActual: 0, stockReserved: 0 });
  };

  const handleSave = async () => {
    if (!token || editingId === null) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const updated = await adminFetch<AdminStockVariant>(
        `/api/admin/variants/${editingId}/stock`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            stockActual: form.stockActual,
            stockReserved: form.stockReserved,
          }),
        },
      );
      setVariants((prev) =>
        prev.map((variant) => (variant.id === editingId ? updated : variant)),
      );
      setEditingId(null);
      setStatus("Stock actualizado.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el stock.",
      );
    } finally {
      setIsSaving(false);
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
          <span className="badge bg-ink/10 text-ink">Auditoría</span>
          <h1 className="text-2xl font-semibold text-ink">Auditar stock</h1>
          <p className="text-sm text-slate-500">
            Consultá stock disponible y ajustá stock real/reservado por
            variante.
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
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por producto, SKU o atributo"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={loadStock}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Refrescar
          </button>
        </div>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="font-semibold text-ink">Leyenda:</span>
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-red-600">
            Crítico &lt; 3
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
            Bajo &lt; 5
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
            Normal 5-9
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            Holgado ≥ 10
          </span>
        </div>
      </section>

      <section className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Atributos</th>
                <th className="py-2">Disponible</th>
                <th className="py-2">Actual</th>
                <th className="py-2">Reservado</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVariants.map((variant) => {
                const available = variant.stockActual - variant.stockReserved;
                const statusInfo = getStockStatus(available);
                const isEditing = editingId === variant.id;

                return (
                  <tr key={variant.id} className="text-slate-600">
                    <td className="py-3 font-semibold text-ink">
                      {variant.productName}
                    </td>
                    <td className="py-3">{variant.sku}</td>
                    <td className="py-3">
                      {variant.color} · {variant.ram} · {variant.storage}
                    </td>
                    <td className="py-3 font-semibold">{available}</td>
                    <td className="py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={form.stockActual}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              stockActual: Number(event.target.value),
                            }))
                          }
                          className="w-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      ) : (
                        variant.stockActual
                      )}
                    </td>
                    <td className="py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={form.stockReserved}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              stockReserved: Number(event.target.value),
                            }))
                          }
                          className="w-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      ) : (
                        variant.stockReserved
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={isSaving}
                              className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEdit(variant)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                          >
                            Editar stock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVariants.length === 0 ? (
                <tr>
                  <td className="py-4 text-sm text-slate-400" colSpan={8}>
                    No hay variantes para mostrar con estos filtros.
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
