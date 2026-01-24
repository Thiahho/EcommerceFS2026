import { Metadata } from 'next';
import { fetchProductDetail } from '../../lib/api';
import ProductDetailClient from '../../components/ProductDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchProductDetail(slug);
    const price = product.variants?.[0]?.price ?? 0;

    return {
      title: `${product.name} - ${product.brand}`,
      description: product.description || `Comprá ${product.name} de ${product.brand} en EcommerceFS2026. ${product.category} con envío rápido y garantía oficial.`,
      openGraph: {
        title: `${product.name} - ${product.brand}`,
        description: product.description || `${product.name} de ${product.brand}. ${product.category} premium.`,
        type: 'website',
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand}`,
        description: product.description || `${product.name} de ${product.brand}`,
        images: product.images?.[0]?.url ? [product.images[0].url] : [],
      },
    };
  } catch {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscás no está disponible.',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductDetail(slug);

  return (
    <div className="space-y-8">
      <ProductDetailClient product={product} />
    </div>
  );
}
