'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const catalogItems = [
  {
    title: 'Productos',
    description: 'Crea, edita y desactiva productos del catálogo.',
  },
  {
    title: 'Categorías',
    description: 'Organiza el catálogo por categoría y slug.',
  },
  {
    title: 'Variantes',
    description: 'Define stock, precio y SKU por variante.',
  },
  {
    title: 'Imágenes',
    description: 'Gestiona imágenes y orden de visualización.',
  },
];

const quickActions = [
  {
    label: 'Sincronizar catálogo',
    detail: 'Publica cambios al storefront.',
  },
  {
    label: 'Ver promociones',
    detail: 'Revisa descuentos activos.',
  },
  {
    label: 'Auditar stock',
    detail: 'Consulta reservas y stock disponible.',
  },
];

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const apiBaseUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      (typeof window !== 'undefined'
        ? `http://${window.location.hostname}:51364`
        : 'http://localhost:51364')
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError('Credenciales inválidas o usuario inactivo.');
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as { token: string };
      window.localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setEmail('');
      setPassword('');
    } catch (requestError) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('adminToken');
    setToken(null);
  };

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
        <Link
          href="/"
          className="rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink"
        >
          Volver al sitio
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Ingreso seguro</h2>
              <p className="text-sm text-slate-500">
                Autenticación con JWT y roles para administradores y vendedores.
              </p>
            </div>
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-ink px-4 py-2 text-xs font-semibold text-ink"
              >
                Cerrar sesión
              </button>
            ) : null}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {token
                ? 'Sesión activa. Podés gestionar el catálogo y revisar acciones rápidas.'
                : 'Iniciá sesión para habilitar las acciones del panel.'}
            </div>
            {!token ? (
              <form className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    placeholder="admin@tienda.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-ink focus:outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Contraseña
                  <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-ink focus:outline-none"
                  />
                </label>
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isSubmitting}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Ingresando...' : 'Ingresar al panel'}
                </button>
              </form>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            El primer admin se crea vía Postman con contraseña encriptada en el backend.
          </p>
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
          <div key={item.title} className="card space-y-2">
            <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.description}</p>
            <span className="text-xs font-semibold text-moss">Disponible en API</span>
          </div>
        ))}
      </section>
    </div>
  );
}
