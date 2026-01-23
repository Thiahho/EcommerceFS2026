import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import { Providers } from './providers/Providers';

export const metadata: Metadata = {
  title: 'EcommerceFS2026',
  description: 'Tecnología premium con entrega rápida y promos exclusivas.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-sand text-ink">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
          <Footer />
          <CartModal />
        </Providers>
      </body>
    </html>
  );
}
