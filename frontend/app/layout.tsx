import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import { Providers } from './providers/Providers';

export const metadata: Metadata = {
  title: {
    default: 'EcommerceFS2026 | Tecnología Premium',
    template: '%s | EcommerceFS2026',
  },
  description: 'Tienda de tecnología premium con smartphones, notebooks y audio. Entrega en 24/48hs, stock real y asesoría experta.',
  keywords: ['tecnología', 'smartphones', 'notebooks', 'audio', 'ecommerce', 'argentina', 'electrónica'],
  authors: [{ name: 'EcommerceFS2026' }],
  creator: 'EcommerceFS2026',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'EcommerceFS2026',
    title: 'EcommerceFS2026 | Tecnología Premium',
    description: 'Tienda de tecnología premium con smartphones, notebooks y audio. Entrega en 24/48hs, stock real y asesoría experta.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EcommerceFS2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcommerceFS2026 | Tecnología Premium',
    description: 'Tienda de tecnología premium con smartphones, notebooks y audio.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
