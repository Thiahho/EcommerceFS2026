'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type AdminSessionState = {
  token: string | null;
  isLoading: boolean;
};

export function useAdminSession(): AdminSessionState {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.sessionStorage.getItem('adminToken');
    if (!storedToken) {
      router.push('/admin');
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setIsLoading(false);
  }, [router]);

  return { token, isLoading };
}
