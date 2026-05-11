'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, User, MessageSquare, Info, Users, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import dynamic from 'next/dynamic';

// Dynamically import motion for badge animation
const MotionSpan = dynamic(() => import('framer-motion').then((mod) => mod.motion.span), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [matchUnreadCount, setMatchUnreadCount] = useState(0);

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

  // Fetch unread match count with polling
  const { data: matchCountData } = useQuery({
    queryKey: ['match-unread-count'],
    queryFn: async () => {
      if (typeof window === 'undefined') return { count: 0 };

      const res = await fetch('/api/match/unread');
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
  });

  // Fetch friend request count
  const { data: friendRequestData } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      if (typeof window === 'undefined') return { incoming: [] };

      const res = await fetch('/api/friends/requests');
      if (!res.ok) return { incoming: [] };
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined',
  });

  useEffect(() => {
    if (countData?.count !== undefined) {
      setUnreadCount(countData.count);
    }
  }, [countData]);

  useEffect(() => {
    if (matchCountData?.count !== undefined) {
      setMatchUnreadCount(matchCountData.count);
    }
  }, [matchCountData]);

  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (friendRequestData?.incoming) {
      setFriendRequestCount(friendRequestData.incoming.length);
    }
  }, [friendRequestData]);

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
    { href: '/matches', icon: Heart, label: 'Matches', badge: matchUnreadCount },
    { href: '/chat', icon: MessageSquare, label: 'Chat', badge: unreadCount },
  ];

  const menuItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/friends', icon: Users, label: 'Friends', badge: friendRequestCount },
    { href: '/about', icon: Info, label: 'About' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
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
                  <MotionSpan
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ff4458] text-[10px] font-bold text-white flex items-center justify-center"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </MotionSpan>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 relative",
            isMenuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Menu size={24} strokeWidth={isMenuOpen ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={closeMenu}
        >
          <MotionDiv
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-4 pb-[calc(80px+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-foreground">More Options</h3>
              <button
                onClick={closeMenu}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all active:scale-95",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-foreground hover:bg-muted"
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
                    <span className="font-bold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </>
  );
}
