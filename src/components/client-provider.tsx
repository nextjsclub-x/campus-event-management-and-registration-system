'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useUserStore } from '@/store/user';

const protectedRoutes = ['/comments/create'];

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  const checkAuth = useCallback(() => {
    if (protectedRoutes.includes(pathname) && !isAuthenticated) {
      toast.error('请先登录后再访问此页面');
      router.push('/');
    }
  }, [pathname, isAuthenticated, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 
