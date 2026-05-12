'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, Search, UserPlus, Bell } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/skeleton/Skeleton';
import FriendCard from '@/components/friends/FriendCard';
import FriendSearch from '@/components/friends/FriendSearch';
import { authenticatedFetch } from '@/lib/api';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function FriendsPage() {
  const [showSearch, setShowSearch] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await authenticatedFetch('/api/friends/list');
      if (!res.ok) throw new Error('Failed to fetch friends');
      return res.json();
    }
  });

  const { data: requestsData } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const res = await authenticatedFetch('/api/friends/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async (friendId) => {
      const res = await authenticatedFetch('/api/friends/unlock', {
        method: 'POST',
        body: JSON.stringify({ friendId })
      });
      if (!res.ok) throw new Error('Failed to unlock');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (friendId) => {
      const res = await authenticatedFetch('/api/friends/remove', {
        method: 'DELETE',
        body: JSON.stringify({ friendId })
      });
      if (!res.ok) throw new Error('Failed to remove friend');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
    }
  });

  const friends = data?.friends || [];
  const pendingCount = requestsData?.incoming?.length || 0;

  if (isLoading) {
    return (
      <div className="p-6 bg-background min-h-screen pb-24">
        <Skeleton className="w-48 h-10 mb-8" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tighter">Your Friends</h1>
        <div className="flex items-center gap-2">
          <Link href="/friends/requests">
            <Button variant="outline" size="icon" className="relative">
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>
          <Button onClick={() => setShowSearch(true)} size="icon">
            <UserPlus size={20} />
          </Button>
        </div>
      </div>

      {friends.length === 0 ? (
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground shadow-sm"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-muted-foreground" size={32} />
          </div>
          <p className="text-lg font-medium text-foreground">No friends yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Find people to share memes with!</p>
          <Button
            onClick={() => setShowSearch(true)}
            className="bg-primary hover:bg-primary/90 rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
          >
            <Search size={18} className="mr-2" />
            Find Friends
          </Button>
        </MotionDiv>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {friends.map((friend) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              onUnlock={() => unlockMutation.mutate(friend._id)}
              isUnlocking={unlockMutation.isPending && unlockMutation.variables === friend._id}
              onRemove={() => removeMutation.mutate(friend._id)}
            />
          ))}
        </div>
      )}

      {showSearch && <FriendSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}
