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
      style={{ x, rotate, opacity, position: 'absolute' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full max-w-[400px] bg-card rounded-2xl border border-border overflow-hidden cursor-grab active:cursor-grabbing touch-none shadow-md flex flex-col"
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
      <div 
        className="relative w-full bg-muted/20 min-h-[300px] max-h-[70vh] overflow-hidden"
        style={{ aspectRatio: aspectRatio }}
      >
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
          className="w-full h-full object-contain pointer-events-none"
        />
        
        {/* Info Overlay (Bottom Gradient) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 tracking-tight leading-tight">{meme.title}</h3>
          <div className="flex flex-wrap gap-1.5">
            {meme.tags.map((tag) => (
              <button 
                key={tag} 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTag(tag);
                }}
                className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded border border-white/10 hover:bg-white/40 transition-colors pointer-events-auto"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
