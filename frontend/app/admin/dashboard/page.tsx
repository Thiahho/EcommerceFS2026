'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const catalogItems = [
  {
    title: 'Productos',
    description: 'Crea, edita y desactiva productos del catálogo.',
    href: '/admin/productos',
  },
  {
    title: 'Órdenes',
    description: 'Revisa pedidos, estados de pago y descarga comprobantes.',
    href: '/admin/ordenes',
  },
  {
    title: 'Categorías',
    description: 'Organiza el catálogo por categoría y slug.',
    href: '/admin/categorias',
  },
  {
    title: 'Promociones',
    description: 'Configura descuentos, precios especiales y 2x1.',
    href: '/admin/promociones',
  },
  {
    title: 'Variantes',
    description: 'Define stock, precio y SKU por variante.',
    href: '/admin/variantes',
  },
  {
    title: 'Auditar stock',
    description: 'Consulta reservas, stock disponible y alertas por nivel.',
    href: '/admin/stock',
  },
  {
    title: 'Imágenes',
    description: 'Gestiona imágenes y orden de visualización.',
    href: '/admin/imagenes',
  },
];

const quickActions = [
  {
    label: 'Ver promociones',
    detail: 'Revisa descuentos activos.',
  },
  {
    label: 'Auditar stock',
    detail: 'Consulta reservas y stock disponible.',
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.localStorage.getItem('adminToken');
    if (!storedToken) {
      router.push('/admin');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    window.localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <span className="badge bg-ink/10 text-ink">Panel admin</span>
          <h1 className="text-3xl font-semibold text-ink">Gestión de catálogo</h1>
          <p className="text-sm text-slate-600">
            Accedé al CRUD del catálogo, stock y promociones con roles diferenciados.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink"
          >
            Cerrar sesión
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600"
          >
            Volver al sitio
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-ink">Estado de la sesión</h2>
            <p className="text-sm text-slate-500">
              Autenticación con JWT y roles para administradores y empleados.
            </p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            Sesión activa. Podés gestionar el catálogo y revisar acciones rápidas.
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-ink">Acciones rápidas</h3>
          <ul className="space-y-3 text-sm">
            {quickActions.map((action) => (
              <li key={action.label} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-ink">{action.label}</p>
                <p className="text-xs text-slate-500">{action.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {catalogItems.map((item) => (
          <Link key={item.title} href={item.href} className="card space-y-2 transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.description}</p>
            <span className="text-xs font-semibold text-moss">Gestionar módulo</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
