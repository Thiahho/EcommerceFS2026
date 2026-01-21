import Link from 'next/link';

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
          </div>
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                placeholder="admin@tienda.com"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contraseña
              <input
                type="password"
                placeholder="********"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
            </label>
            <button
              type="button"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
            >
              Ingresar al panel
            </button>
          </form>
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
