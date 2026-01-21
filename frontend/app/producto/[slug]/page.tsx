import { fetchProductDetail } from '../../lib/api';
import ProductDetailClient from '../../components/ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductDetail(params.slug);

  return (
    <div className="space-y-8">
      <ProductDetailClient product={product} />
    </div>
  );
}
