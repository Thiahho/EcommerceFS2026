"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminBaseUrl, adminFetch } from "../../lib/adminApi";
import { AdminOrderListItem } from "../../lib/adminTypes";
import { useAdminSession } from "../../hooks/useAdminSession";

const statusOptions = [
  { label: "Todos", value: "all" },
  { label: "Pendiente", value: "PendingPayment" },
  { label: "Pagado", value: "Paid" },
  { label: "Fallido", value: "PaymentFailed" },
];

const statusLabels: Record<string, string> = {
  PendingPayment: "Pendiente",
  Paid: "Pagado",
  PaymentFailed: "Fallido",
};

export default function AdminOrdersPage() {
  const { token, isLoading } = useAdminSession();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsBusy(true);
    setStatusMessage(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const query = params.toString();
      const response = await adminFetch<AdminOrderListItem[]>(
        `/api/admin/orders${query ? `?${query}` : ""}`,
        token,
      );
      setOrders(response);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las órdenes.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [searchTerm, statusFilter, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders();
  }, [fetchOrders, token]);

  const handleDownload = async (orderId: number) => {
    if (!token) {
      return;
    }

    setStatusMessage(null);

    try {
      const response = await fetch(
        `${adminBaseUrl}/api/admin/orders/${orderId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orden-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "No se pudo descargar el PDF.",
      );
    }
  };

  const ordersTotal = useMemo(() => orders.length, [orders.length]);

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
          <span className="badge bg-ink/10 text-ink">Órdenes</span>
          <h1 className="text-2xl font-semibold text-ink">Gestión de pedidos</h1>
          <p className="text-sm text-slate-500">
            Filtrá, descargá comprobantes y accedé al detalle completo.
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
          <div className="flex flex-1 flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar por ID, cliente, email o DNI"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isBusy}
            className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isBusy ? "Actualizando..." : "Aplicar filtros"}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>{ordersTotal} órdenes encontradas.</p>
          <p>Se muestran los pedidos más recientes primero.</p>
        </div>
        {statusMessage ? (
          <p className="text-xs text-slate-500">{statusMessage}</p>
        ) : null}
      </section>

      <section className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Orden</th>
                <th className="py-2">Cliente</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Total</th>
                <th className="py-2">Items</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="text-slate-600">
                  <td className="py-3 font-semibold text-ink">
                    #{order.id}
                    <p className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="font-semibold text-ink">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.customerEmail}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {order.currency} {order.totalAmount.toFixed(2)}
                    <p className="text-xs text-slate-400">
                      {order.paymentStatus ?? "Sin estado"}
                    </p>
                  </td>
                  <td className="py-3">{order.itemsCount}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/ordenes/${order.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink"
                      >
                        Ver detalle
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDownload(order.id)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-moss"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td className="py-4 text-sm text-slate-400" colSpan={6}>
                    No hay órdenes para mostrar con estos filtros.
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
