import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cloud bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-ink">
          EcommerceFS2026
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
