'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const { user, isLoading, initFromCookie } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initFromCookie();
  }, [initFromCookie]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/feed');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff4458] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
