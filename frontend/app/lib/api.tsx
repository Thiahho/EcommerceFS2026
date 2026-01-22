import { ProductCatalogItem, ProductDetail } from "./types";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:51364";

export async function fetchCatalog(
  params?: Record<string, string | undefined>,
) {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== ""),
  );
  const searchParams = new URLSearchParams(filtered);
  const query = searchParams.toString();
  const response = await fetch(
    `${baseUrl}/api/products${query ? `?${query}` : ""}`,
    {
      next: { revalidate: 30 },
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo.");
  }

  return (await response.json()) as ProductCatalogItem[];
}

export async function fetchProductDetail(slug: string) {
  const response = await fetch(`${baseUrl}/api/products/${slug}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el producto.");
  }

  return (await response.json()) as ProductDetail;
}

export async function createPreference(payload: {
  items: Array<{
    title: string;
    quantity: number;
    currencyId: string;
    unitPrice: number;
    pictureUrl?: string | null;
  }>;
  backUrls: { success: string; failure: string; pending: string };
}) {
  const response = await fetch(`${baseUrl}/api/payments/preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la preferencia de pago.");
  }

  return (await response.json()) as { id: string };
}

export async function createOrder(payload: {
  fullName: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  city: string;
  postalCode: string;
  items: Array<{
    productVariantId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }>;
}) {
  const response = await fetch(`${baseUrl}/api/checkout/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al crear la orden.");
  }

  return (await response.json()) as { id: number; totalAmount: number };
}

export async function processPayment(payload: {
  token: string;
  transactionAmount: number;
  description: string;
  installments: number;
  paymentMethodId: string;
  email: string;
  orderId: number;
}) {
  const response = await fetch(`${baseUrl}/api/payments/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Error al procesar el pago.");
  }

  return (await response.json()) as { id: string; status: string; orderId: number };
}
