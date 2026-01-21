import { ProductCatalogItem, ProductDetail } from './types';

const defaultBaseUrl = 'http://localhost:5000';

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : defaultBaseUrl);

export async function fetchCatalog(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params ?? {});
  const response = await fetch(`${baseUrl}/api/products?${searchParams.toString()}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar el catálogo.');
  }

  return (await response.json()) as ProductCatalogItem[];
}

export async function fetchProductDetail(slug: string) {
  const response = await fetch(`${baseUrl}/api/products/${slug}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('No se pudo cargar el producto.');
  }

  return (await response.json()) as ProductDetail;
}

export async function createPreference(payload: {
  items: Array<{ title: string; quantity: number; currencyId: string; unitPrice: number }>;
  backUrls: { success: string; failure: string; pending: string };
}) {
  const response = await fetch(`${baseUrl}/api/payments/preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('No se pudo crear la preferencia de pago.');
  }

  return (await response.json()) as { id: string };
}
