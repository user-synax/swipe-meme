'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ToastContainer from '@/components/ui/toast/ToastContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuthStore } from '@/store/useAuthStore';

export default function Providers({ children }) {
  const initFromCookie = useAuthStore((state) => state.initFromCookie);
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    initFromCookie();
  }, [initFromCookie]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
