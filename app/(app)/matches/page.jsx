'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Lock, User as UserIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/skeleton/Skeleton';
import { useState, useEffect, useRef } from 'react';

// Dynamically import framer-motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function MatchesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await fetch('/api/match/list');
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json();
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async (matchId) => {
      const res = await fetch('/api/match/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matchId })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['matches']);
    }
  });

  // Mutation to mark a match as seen
  const markSeenMutation = useMutation({
    mutationFn: async (matchId) => {
      const res = await fetch('/api/match/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate unread count so badge updates
      queryClient.invalidateQueries(['match-unread-count']);
    }
  });

  const matches = data?.matches || [];
  const markedRef = useRef(new Set());
  const processingRef = useRef(false);

  // Mark all loaded matches as seen sequentially to avoid resource exhaustion
  useEffect(() => {
    if (isLoading || matches.length === 0 || processingRef.current) return;

    const markMatchesSeen = async () => {
      processingRef.current = true;

      // Get unseen matches (not already marked in this session)
      const unseenMatches = matches.filter(m => !markedRef.current.has(m._id));

      // Process sequentially with small delays to avoid overwhelming the browser
      for (const match of unseenMatches) {
        if (!markedRef.current.has(match._id)) {
          markedRef.current.add(match._id);
          try {
            await markSeenMutation.mutateAsync(match._id);
          } catch (err) {
            // Silent fail - match might already be marked
          }
          // Small delay between requests
          await new Promise(r => setTimeout(r, 50));
        }
      }

      processingRef.current = false;
    };

    markMatchesSeen();
  }, [isLoading, matches]);

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
      <h1 className="text-3xl font-black text-foreground mb-8 tracking-tighter">Your Matches</h1>
      
      {matches.length === 0 ? (
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground shadow-sm"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-muted-foreground" size={32} />
          </div>
          <p className="text-lg font-medium text-foreground">No matches yet.</p>
          <p className="text-sm text-muted-foreground">Keep swiping — your people are out there.</p>
          <Link href="/feed">
            <Button className="mt-6 bg-primary hover:bg-primary/90 rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
              Start Swiping
            </Button>
          </Link>
        </MotionDiv>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {matches.map((match) => (
            <MatchCard 
              key={match._id}
              match={match} 
              onUnlock={() => unlockMutation.mutate(match._id)}
              isUnlocking={unlockMutation.isPending && unlockMutation.variables === match._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, onUnlock, isUnlocking }) {
  const { user, jaccardScore, chatUnlocked } = match;
  const [isFlipped, setIsFlipped] = useState(false);
  
  const displayUsername = chatUnlocked 
    ? user.username 
    : `${user.username.substring(0, 3)}***`;

  const humorMatch = Math.round(jaccardScore * 100);

  const handleUnlock = async () => {
    await onUnlock();
    setIsFlipped(true);
    setTimeout(() => setIsFlipped(false), 2000);
  };

  return (
    <Card className="overflow-hidden bg-card border-border shadow-sm flex flex-col">
      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={displayUsername}
            className={`w-full h-full object-cover transition-all duration-500 ${!chatUnlocked ? 'blur-xl grayscale' : ''}`}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-muted ${!chatUnlocked ? 'blur-md' : ''}`}>
            <UserIcon className="text-muted-foreground" size={40} />
          </div>
        )}
        
        {!chatUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <Lock className="text-white/80 drop-shadow-lg" size={32} />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-2">
        <div className="space-y-0.5">
          <p className="font-bold text-foreground tracking-tight line-clamp-1">{displayUsername}</p>
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{humorMatch}% Humor Match</p>
        </div>

        <div className="text-[10px] text-muted-foreground font-medium">
          Common Memes: {match.commonMemeUrls?.length || 0}
        </div>

        <div className="pt-2 space-y-2">
          {chatUnlocked ? (
            <>
              <Link href={`/chat/${match._id}`}>
                <Button className="w-full text-[11px] font-bold h-8 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm transition-all active:scale-95">
                  <MessageSquare size={14} className="mr-1.5" />
                  Chat
                </Button>
              </Link>
              <Link href={`/user/${user._id}`}>
                <Button variant="outline" className="w-full text-[11px] font-bold h-8 rounded-lg border-border hover:bg-muted transition-colors">
                  View Profile
                </Button>
              </Link>
            </>
          ) : (
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="w-full text-[11px] font-bold h-8 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm transition-all active:scale-95"
            >
              {isUnlocking ? 'Revealing...' : 'Reveal Profile'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
