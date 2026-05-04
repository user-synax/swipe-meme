'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/store/useToastStore';
import { useEffect } from 'react';

export default function UserProfilePage({ params }) {
  const { id } = params;
  const { token } = useAuthStore();
  const router = useRouter();

  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/user/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Unlock this profile first!");
          router.push('/matches');
        }
        throw new Error('Failed to fetch profile');
      }
      return res.json();
    },
    retry: false
  });

  const { data: commonData } = useQuery({
    queryKey: ['common-memes', id],
    queryFn: async () => {
      // First find the match to get matchId
      const resList = await fetch('/api/match/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataList = await resList.json();
      const match = dataList.matches.find(m => m.user._id === id);
      
      if (!match) return { commonMemes: [] };

      const resCommon = await fetch(`/api/match/common/${match._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return resCommon.json();
    },
    enabled: !!userData
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground mb-4">Profile is locked or does not exist.</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const user = userData.user;
  const commonMemes = commonData?.commonMemes || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 flex items-center gap-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Humor Mate</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="text-muted-foreground" size={64} />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground tracking-tight">{user.username}</h2>
            {user.humorType && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                {user.humorType}
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h3>
          <p className="text-foreground leading-relaxed">
            {user.bio || "No bio yet."}
          </p>
        </div>

        {/* Common Memes */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-2">Common Likes</h3>
          <div className="grid grid-cols-2 gap-3">
            {commonMemes.length === 0 ? (
              <p className="col-span-2 text-center text-muted-foreground py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
                No common memes found.
              </p>
            ) : (
              commonMemes.map((meme) => (
                <div key={meme.memeRedditId} className="aspect-square rounded-xl border border-border overflow-hidden bg-muted group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meme.imageUrl} alt="Meme" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
