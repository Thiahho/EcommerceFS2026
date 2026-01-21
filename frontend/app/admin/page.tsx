'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.push('/admin/dashboard');
    }
  }, [router]);

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
      router.push('/admin/dashboard');
    } catch (requestError) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <span className="badge bg-ink/10 text-ink">Panel admin</span>
          <h1 className="mt-4 text-3xl font-semibold text-ink">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresá tus credenciales para acceder al panel de administración.
          </p>
        </div>

        <div className="card space-y-6">
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
          <p className="text-center text-xs text-slate-500">
            Autenticación con JWT y roles para administradores y vendedores.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-ink hover:underline"
          >
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
