'use client';

import { useAuth } from '@/contexts/auth-context';

export function useAuthFetch() {
  const { accessToken } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return authFetch;
}