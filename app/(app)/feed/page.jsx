'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, RefreshCw, User as UserIcon, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { toast } from '@/store/useToastStore';

const MemeCard = dynamic(() => import('@/components/feed/MemeCard'), {
  ssr: false,
  loading: () => <Skeleton className="w-full max-w-[400px] h-[500px] rounded-2xl" />
});

export default function FeedPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { user, selectedTag, setSelectedTag } = useAuthStore();
  const queryClient = useQueryClient();
  const lastMatchCheckRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Feed
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['feed', selectedTag],
    queryFn: async () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = new URL('/api/memes/feed', origin || 'http://localhost:3000');
      if (selectedTag) url.searchParams.set('tag', selectedTag);

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch feed');
      return res.json();
    },
    staleTime: 0,
    enabled: mounted,
  });

  const memes = data?.memes || [];

  // 2. Swipe Mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ memeRedditId, imageUrl, tags, action }) => {
      const res = await fetch('/api/memes/swipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memeRedditId, imageUrl, tags, action }),
      });
      if (!res.ok) throw new Error('Swipe failed');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.triggerMatchCheck) {
        const now = Date.now();
        // Debounce match check (30s)
        if (now - lastMatchCheckRef.current > 30000) {
          lastMatchCheckRef.current = now;
          fetch('/api/match/check', {
            method: 'POST'
          }).then(res => res.json()).then(data => {
            if (data.checked && !data.skipped) {
              toast.success("New Match Found! 🎉", 5000);
            }
          });
        }
      }
    },
    onError: () => {
      toast.error("Swipe failed. Rolling back...");
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  });

  // 3. Handle Swipe
  const handleSwipe = useCallback((action) => {
    if (currentIndex >= memes.length) return;

    const currentMeme = memes[currentIndex];
    swipeMutation.mutate({
      memeRedditId: currentMeme.redditId,
      imageUrl: currentMeme.imageUrl,
      tags: currentMeme.tags,
      action
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, memes, swipeMutation]);

  // 4. Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handleSwipe('dislike');
      if (e.key === 'ArrowRight') handleSwipe('like');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  // Loading State (Skeleton)
  if (!mounted || isLoading || (isFetching && memes.length === 0)) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center bg-background">
        <header className="w-full px-6 py-4 flex justify-between items-center border-b border-border/50">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </header>
        <main className="flex-1 w-full flex items-center justify-center p-4">
          <Skeleton className="w-full max-w-[400px] h-[500px] rounded-2xl" />
        </main>
      </div>
    );
  }

  const isExhausted = currentIndex >= memes.length;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col items-center overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-md z-40 border-b border-border/50">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-primary italic tracking-tighter">SWIPEMEME</h1>
          {selectedTag && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Filter size={10} /> Filtering: #{selectedTag}
              </span>
              <button 
                onClick={() => {
                  setSelectedTag(null);
                  setCurrentIndex(0);
                }}
                className="text-[10px] font-bold text-primary hover:underline ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
          <UserIcon className="text-muted-foreground" size={20} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative px-4 py-6 overflow-y-auto sm:overflow-hidden">
        <AnimatePresence mode="wait">
          {isExhausted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 z-10 py-12"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Out of memes!</h2>
              <p className="text-muted-foreground max-w-[250px] mx-auto text-sm">
                {selectedTag ? `No more memes for #${selectedTag}. Try another tag!` : "Come back tomorrow for fresh memes."}
              </p>
              <Button 
                onClick={() => {
                  setCurrentIndex(0);
                  refetch();
                }}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-6 mt-4 shadow-lg shadow-primary/20 font-bold"
              >
                Refresh Feed
              </Button>
            </motion.div>
          ) : (
            <div className="relative w-full max-w-[420px] flex items-center justify-center min-h-[500px] sm:min-h-[600px]">
              {/* Next card hint */}
              {currentIndex + 1 < memes.length && (
                <div 
                  className="absolute w-full h-full bg-card rounded-2xl border border-border scale-[0.98] translate-y-2 opacity-30 shadow-sm"
                  style={{ zIndex: 0 }}
                />
              )}
              
              {/* Current Card */}
              <MemeCard 
                key={memes[currentIndex].redditId}
                meme={memes[currentIndex]} 
                onSwipe={handleSwipe}
                active={true}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Buttons */}
      {!isExhausted && (
        <div className="flex gap-8 mb-8 z-40 mt-4">
          <Button
            onClick={() => handleSwipe('dislike')}
            className="w-16 h-16 rounded-full bg-muted border border-border hover:bg-muted/80 hover:border-muted-foreground/30 transition-all group shadow-sm"
          >
            <X size={32} className="text-muted-foreground group-hover:scale-110 transition-transform" />
          </Button>
          <Button
            onClick={() => handleSwipe('like')}
            className="w-16 h-16 rounded-full bg-muted border border-border hover:bg-muted/80 hover:border-primary/30 transition-all group shadow-sm"
          >
            <Heart size={32} className="text-primary fill-primary group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      )}
    </div>
  );
}
