const defaultBaseUrl = 'http://localhost:51364';

export const adminBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:51364`
    : defaultBaseUrl);

type AdminFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function adminFetch<T>(
  path: string,
  token: string,
  options: AdminFetchOptions = {},
) {
  const response = await fetch(`${adminBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'No se pudo completar la operación.');
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
