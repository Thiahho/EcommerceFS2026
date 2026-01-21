import { ProductCatalogItem, ProductDetail } from './types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

export async function fetchCatalog(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params ?? {});
  const response = await fetch(`${baseUrl}/api/products?${searchParams.toString()}`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar el catálogo.');
  }

  return (await response.json()) as ProductCatalogItem[];
}

export async function fetchProductDetail(slug: string) {
  const response = await fetch(`${baseUrl}/api/products/${slug}`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar el producto.');
  }

  return (await response.json()) as ProductDetail;
}
