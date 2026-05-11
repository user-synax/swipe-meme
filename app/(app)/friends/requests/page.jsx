'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/skeleton/Skeleton';
import FriendRequestCard from '@/components/friends/FriendRequestCard';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function FriendRequestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const res = await fetch('/api/friends/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const incoming = data?.incoming || [];
  const outgoing = data?.outgoing || [];

  if (isLoading) {
    return (
      <div className="p-6 bg-background min-h-screen pb-24">
        <Skeleton className="w-48 h-10 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/friends">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-2xl font-black text-foreground tracking-tighter">Friend Requests</h1>
      </div>

      {/* Incoming Requests */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Incoming ({incoming.length})
        </h2>
        {incoming.length > 0 ? (
          <div className="space-y-3">
            {incoming.map((request) => (
              <FriendRequestCard key={request._id} request={request} type="incoming" />
            ))}
          </div>
        ) : (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/50 rounded-xl p-8 text-center"
          >
            <p className="text-sm text-muted-foreground">No incoming friend requests</p>
          </MotionDiv>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Sent ({outgoing.length})
        </h2>
        {outgoing.length > 0 ? (
          <div className="space-y-3">
            {outgoing.map((request) => (
              <FriendRequestCard key={request._id} request={request} type="outgoing" />
            ))}
          </div>
        ) : (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted/50 rounded-xl p-8 text-center"
          >
            <p className="text-sm text-muted-foreground">No pending sent requests</p>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}
