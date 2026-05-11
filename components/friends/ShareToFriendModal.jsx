'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X, Send, Check, Loader2 } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/skeleton/Skeleton';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function ShareToFriendModal({ meme, onClose }) {
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await fetch('/api/friends/list');
      if (!res.ok) throw new Error('Failed to fetch friends');
      return res.json();
    }
  });

  const shareMutation = useMutation({
    mutationFn: async (friendId) => {
      const res = await fetch('/api/shared-memes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: friendId,
          memeRedditId: meme.id || meme.redditId,
          imageUrl: meme.imageUrl,
          title: meme.title,
          tags: meme.tags || []
        })
      });
      if (!res.ok) throw new Error('Failed to share');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
    }
  });

  const friends = data?.friends || [];

  const toggleFriend = (friendId) => {
    const newSet = new Set(selectedFriends);
    if (newSet.has(friendId)) {
      newSet.delete(friendId);
    } else {
      newSet.add(friendId);
    }
    setSelectedFriends(newSet);
  };

  const handleShare = async () => {
    if (selectedFriends.size === 0) {
      toast.error('Select at least one friend');
      return;
    }

    let successCount = 0;
    for (const friendId of selectedFriends) {
      try {
        await shareMutation.mutateAsync(friendId);
        successCount++;
      } catch (err) {
        console.error('Failed to share with friend:', friendId);
      }
    }

    if (successCount > 0) {
      toast.success(`Shared with ${successCount} friend${successCount > 1 ? 's' : ''}!`);
      onClose();
    } else {
      toast.error('Failed to share meme');
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground">Share to Friends</h3>
            <p className="text-xs text-muted-foreground">{meme.title || 'Untitled meme'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Meme Preview */}
        <div className="p-4 border-b border-border">
          <div className="aspect-video rounded-xl overflow-hidden bg-muted">
            <img
              src={meme.imageUrl}
              alt={meme.title || 'Meme'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Select friends to share with:
          </p>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => toggleFriend(friend._id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    selectedFriends.has(friend._id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {friend.user.avatar ? (
                      <img
                        src={friend.user.avatar}
                        alt={friend.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">
                          {friend.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-medium text-sm">{friend.user.username}</p>
                      {friend.user.humorType && (
                        <p className="text-[10px] text-muted-foreground">{friend.user.humorType}</p>
                      )}
                    </div>
                  </div>
                  {selectedFriends.has(friend._id) && (
                    <Check size={18} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-8">
              No friends yet. Add friends to share memes!
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {friends.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button
              onClick={handleShare}
              disabled={selectedFriends.size === 0 || shareMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Share with {selectedFriends.size} friend{selectedFriends.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </MotionDiv>
    </MotionDiv>
  );
}
