"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { AdminCategory } from "../../lib/adminTypes";
import { useAdminSession } from "../../hooks/useAdminSession";

const emptyCategoryForm = {
  name: "",
  slug: "",
  active: true,
};

export default function AdminCategoriesPage() {
  const { token, isLoading } = useAdminSession();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadData = async () => {
      try {
        const response = await adminFetch<AdminCategory[]>(
          "/api/admin/categories",
          token,
        );
        setCategories(response);
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías.",
        );
      }
    };

    loadData();
  }, [token]);

  const resetForm = () => {
    setForm(emptyCategoryForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!token) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      if (editingId) {
        const updated = await adminFetch<AdminCategory>(
          `/api/admin/categories/${editingId}`,
          token,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
        );
        setCategories((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
        setStatus("Categoría actualizada.");
      } else {
        const created = await adminFetch<AdminCategory>(
          "/api/admin/categories",
          token,
          {
            method: "POST",
            body: JSON.stringify(form),
          },
        );
        setCategories((prev) => [created, ...prev]);
        setStatus("Categoría creada.");
      }
      resetForm();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la categoría.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      active: category.active,
    });
  };

  const handleDeactivate = async (categoryId: string) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("¿Querés desactivar esta categoría?");
    if (!confirmed) {
      return;
    }

    try {
      await adminFetch(`/api/admin/categories/${categoryId}`, token, {
        method: "DELETE",
      });
      setCategories((prev) =>
        prev.map((item) =>
          item.id === categoryId ? { ...item, active: false } : item,
        ),
      );
      setStatus("Categoría desactivada.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "No se pudo desactivar la categoría.",
      );
    }
  };

  const handleActivate = async (categoryId: string) => {
    if (!token) {
      return;
    }

    try {
      const updated = await adminFetch<AdminCategory>(
        `/api/admin/categories/${categoryId}/activate`,
        token,
        { method: "PATCH" },
      );
      setCategories((prev) =>
        prev.map((item) => (item.id === categoryId ? updated : item)),
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
          <h1 className="text-2xl font-semibold text-ink">Categorías</h1>
          <p className="text-sm text-slate-500">
            Organiza el catálogo con categorías simples (sin jerarquías).
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
            <h2 className="text-lg font-semibold text-ink">Listado</h2>
            <p className="text-xs text-slate-500">
              Categorías activas e inactivas.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id} className="text-slate-600">
                    <td className="py-3 pr-4 font-semibold text-ink">
                      {category.name}
                    </td>
                    <td className="py-3 pr-4">{category.slug}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          category.active ? "text-moss" : "text-slate-400"
                        }
                      >
                        {category.active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                        >
                          Editar
                        </button>
                        {category.active ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(category.id)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-red-500"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(category.id)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-moss"
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={4}>
                      Todavía no hay categorías cargadas.
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
              {editingId ? "Editar categoría" : "Crear categoría"}
            </h2>
            <p className="text-xs text-slate-500">
              Nombre y slug son obligatorios.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <input
              type="text"
              placeholder="Slug"
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3"
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Categoría activa
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
