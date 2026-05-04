'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function MemeCard({ meme, onSwipe, active }) {
  const [aspectRatio, setAspectRatio] = useState(4/5);
  const { setSelectedTag } = useAuthStore();
  const lastTapRef = useRef(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('like');
    } else if (info.offset.x < -100) {
      onSwipe('dislike');
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onSwipe('like');
    }
    lastTapRef.current = now;
  };

  if (!active) return null;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-[95%] max-w-[550px] bg-card rounded-2xl border border-border overflow-hidden cursor-grab active:cursor-grabbing touch-none shadow-md flex flex-col max-h-[calc(100vh-220px)]"
    >
      {/* Overlay Icons */}
      <motion.div 
        style={{ opacity: likeOpacity }}
        className="absolute top-10 left-10 z-20 border-4 border-primary rounded-lg px-4 py-2 rotate-[-15deg] pointer-events-none"
      >
        <span className="text-primary text-4xl font-black uppercase tracking-tight">Like</span>
      </motion.div>

      <motion.div 
        style={{ opacity: dislikeOpacity }}
        className="absolute top-10 right-10 z-20 border-4 border-muted-foreground rounded-lg px-4 py-2 rotate-[15deg] pointer-events-none"
      >
        <span className="text-muted-foreground text-4xl font-black uppercase tracking-tight">Nope</span>
      </motion.div>

      {/* Meme Image Container */}
      <div className="relative w-full bg-muted/5 flex items-center justify-center flex-1 min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={meme.imageUrl} 
          alt={meme.title}
          loading="lazy"
          onLoad={(e) => {
            const { naturalWidth, naturalHeight } = e.target;
            if (naturalWidth && naturalHeight) {
              setAspectRatio(naturalWidth / naturalHeight);
            }
          }}
          className="max-w-full max-h-[calc(100vh-300px)] w-auto h-auto object-contain pointer-events-none"
        />
      </div>

      {/* Info Section (Below Image) */}
      <div className="p-4 bg-card border-t border-border/50 shrink-0">
        <h3 className="text-foreground font-bold text-base mb-2 line-clamp-2 tracking-tight leading-snug">
          {meme.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {meme.tags.slice(0, 3).map((tag) => (
            <button 
              key={tag} 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTag(tag);
              }}
              className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black rounded border border-primary/10 transition-all pointer-events-auto uppercase tracking-wider"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
