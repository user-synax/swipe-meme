'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion to avoid SSR issues
const AnimatePresence = dynamic(() => import('framer-motion').then((mod) => mod.AnimatePresence), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateStatus = () => setIsOffline(!navigator.onLine);
    setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!mounted || !isOffline) return null;

  return (
    <AnimatePresence>
      {isOffline && (
        <MotionDiv
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
        >
          <WifiOff size={16} />
          You are currently offline. Some features may not work.
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
