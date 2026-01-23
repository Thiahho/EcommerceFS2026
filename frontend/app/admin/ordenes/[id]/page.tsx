"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminBaseUrl, adminFetch } from "../../../lib/adminApi";
import { AdminOrderDetail } from "../../../lib/adminTypes";
import { useAdminSession } from "../../../hooks/useAdminSession";

const statusLabels: Record<string, string> = {
  PendingPayment: "Pendiente",
  Paid: "Pagado",
  PaymentFailed: "Fallido",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isLoading } = useAdminSession();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    try {
      const response = await adminFetch<AdminOrderDetail>(
        `/api/admin/orders/${id}`,
        token,
      );
      setOrder(response);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la orden.",
      );
    }
  }, [id, token]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleDownload = async () => {
    if (!token || !order) {
      return;
    }

    try {
      const response = await fetch(
        `${adminBaseUrl}/api/admin/orders/${order.id}/pdf`,
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
      link.download = `orden-${order.id}.pdf`;
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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/ordenes"
          className="text-sm font-semibold text-ink hover:underline"
        >
          Volver a órdenes
        </Link>
        <p className="text-sm text-slate-500">
          {statusMessage ?? "Cargando detalle..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge bg-ink/10 text-ink">Detalle</span>
          <h1 className="text-2xl font-semibold text-ink">
            Orden #{order.id}
          </h1>
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString()} ·{" "}
            {statusLabels[order.status] ?? order.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-moss"
          >
            Descargar PDF
          </button>
          <Link
            href="/admin/ordenes"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Volver
          </Link>
        </div>
      </header>

      {statusMessage ? (
        <p className="text-xs text-slate-500">{statusMessage}</p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-ink">Cliente</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-ink">Nombre:</span>{" "}
              {order.customerName}
            </p>
            <p>
              <span className="font-semibold text-ink">Email:</span>{" "}
              {order.customerEmail}
            </p>
            <p>
              <span className="font-semibold text-ink">Teléfono:</span>{" "}
              {order.customerPhone}
            </p>
            <p>
              <span className="font-semibold text-ink">DNI:</span>{" "}
              {order.customerDni}
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-ink">Envío</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity} ({order.shippingPostalCode})
            </p>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-ink">Pago</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-ink">Estado:</span>{" "}
              {statusLabels[order.status] ?? order.status}
            </p>
            <p>
              <span className="font-semibold text-ink">Proveedor:</span>{" "}
              {order.paymentProvider ?? "N/D"}
            </p>
            <p>
              <span className="font-semibold text-ink">Pago:</span>{" "}
              {order.paymentStatus ?? "N/D"}
            </p>
            <p>
              <span className="font-semibold text-ink">Total:</span>{" "}
              {order.currency} {order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Items</h2>
          <p className="text-xs text-slate-500">
            {order.items.length} productos en la orden.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2">Variante</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id} className="text-slate-600">
                  <td className="py-3 font-semibold text-ink">
                    {item.productName}
                  </td>
                  <td className="py-3">#{item.productVariantId}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">
                    {order.currency} {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3">
                    {order.currency} {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {order.items.length === 0 ? (
                <tr>
                  <td className="py-4 text-sm text-slate-400" colSpan={5}>
                    No hay items en esta orden.
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
