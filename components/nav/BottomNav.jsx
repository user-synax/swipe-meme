'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import dynamic from 'next/dynamic';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count with proper SSR handling
  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      // Only run on client side
      if (typeof window === 'undefined') return { count: 0 };
      
      const res = await fetch('/api/chat/unread-count');
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: typeof window !== 'undefined',
  });

  useEffect(() => {
    if (countData?.count !== undefined) {
      setUnreadCount(countData.count);
    }
  }, [countData]);

  // Listen for new messages via Pusher with dynamic import
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;

    // Dynamically import pusher client to avoid SSR issues
    import('@/lib/pusherClient').then(({ default: pusherClient }) => {
      const channel = pusherClient.subscribe(`user-${user.id}`);
      channel.bind('new-message', (data) => {
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        pusherClient.unsubscribe(`user-${user.id}`);
      };
    });
  }, [user?.id]);

  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/matches', icon: Heart, label: 'Matches' },
    { href: '/chat', icon: MessageSquare, label: 'Chat', badge: unreadCount },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-around items-center z-50 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 relative",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ff4458] text-[10px] font-bold text-white flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
