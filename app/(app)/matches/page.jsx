'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Lock, User as UserIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { useState } from 'react';

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

  const matches = data?.matches || [];

  return (
    <div className="p-6 bg-background min-h-screen pb-24">
      <h1 className="text-3xl font-black text-foreground mb-8 tracking-tighter">Your Matches</h1>
      
      {matches.length === 0 ? (
        <motion.div 
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
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-2 gap-4"
        >
          {matches.map((match) => (
            <motion.div
              key={match._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <MatchCard 
                match={match} 
                onUnlock={() => unlockMutation.mutate(match._id)}
                isUnlocking={unlockMutation.isPending && unlockMutation.variables === match._id}
              />
            </motion.div>
          ))}
        </motion.div>
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
    <div className="perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        <Card className="overflow-hidden bg-card border-border shadow-sm flex flex-col backface-hidden">
          <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
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
        
        {/* Back of card (Unlock animation) */}
        <Card className="absolute inset-0 overflow-hidden bg-primary border-primary flex items-center justify-center backface-hidden rotate-y-180 shadow-2xl">
          <div className="text-center p-4">
            <Heart className="text-white mx-auto mb-2 animate-pulse" size={48} fill="white" />
            <p className="text-white font-black text-lg tracking-tighter">IT&apos;S A MATCH!</p>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Profile Revealed</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
