'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, User as UserIcon, MessageSquare, Send, UserMinus } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { authenticatedFetch } from '@/lib/api';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function FriendCard({ friend, onUnlock, isUnlocking, onRemove }) {
  const { user, chatUnlocked, sharedMemeCount } = friend;
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const router = useRouter();

  const displayUsername = chatUnlocked
    ? user.username
    : `${user.username.substring(0, 3)}***`;

  const handleUnlock = async () => {
    await onUnlock();
    setIsFlipped(true);
    setTimeout(() => setIsFlipped(false), 2000);
  };

  const handleChat = async () => {
    setIsFindingMatch(true);
    try {
      const res = await authenticatedFetch('/api/match/find', {
        method: 'POST',
        body: JSON.stringify({ friendId: user._id })
      });
      
      if (!res.ok) {
        throw new Error('Failed to find match');
      }
      
      const data = await res.json();
      router.push(`/chat/${data.matchId}`);
    } catch (error) {
      console.error('Error finding match:', error);
      // Fallback: try to create a match or show error
      alert('Could not find chat match. Please try again.');
    } finally {
      setIsFindingMatch(false);
    }
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
          {user.humorType && (
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{user.humorType}</p>
          )}
        </div>

        <div className="text-[10px] text-muted-foreground font-medium">
          Memes Shared: {sharedMemeCount || 0}
        </div>

        <div className="pt-2 space-y-2">
          {chatUnlocked ? (
            <>
              <Button 
                onClick={handleChat}
                disabled={isFindingMatch}
                className="w-full text-[11px] font-bold h-8 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm transition-all active:scale-95"
              >
                <MessageSquare size={14} className="mr-1.5" />
                {isFindingMatch ? 'Finding...' : 'Chat'}
              </Button>
              <Link href={`/user/${user._id}`}>
                <Button variant="outline" className="w-full text-[11px] font-bold h-8 rounded-lg border-border hover:bg-muted transition-colors">
                  <Send size={14} className="mr-1.5" />
                  Send Meme
                </Button>
              </Link>
              <Button
                onClick={() => onRemove(friend._id)}
                variant="ghost"
                className="w-full text-[11px] font-bold h-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <UserMinus size={14} className="mr-1.5" />
                Remove Friend
              </Button>
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
