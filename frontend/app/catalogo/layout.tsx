import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explorá nuestro catálogo de smartphones, notebooks y audio premium. Filtrá por marca, categoría y precio. Envío en 24/48hs.',
  openGraph: {
    title: 'Catálogo | EcommerceFS2026',
    description: 'Explorá nuestro catálogo de tecnología premium. Smartphones, notebooks y audio con envío rápido.',
  },
};

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
