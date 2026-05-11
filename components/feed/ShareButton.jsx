'use client';

import { useState, useCallback } from 'react';
import { Share2, X, Link2, AtSign, Globe, MessageCircle, Send, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/store/useToastStore';
import dynamic from 'next/dynamic';

const ShareToFriendModal = dynamic(() => import('@/components/friends/ShareToFriendModal'), { ssr: false });

export default function ShareButton({ meme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNativeShare, setIsNativeShare] = useState(false);
  const [showFriendShare, setShowFriendShare] = useState(false);

  // Check if native share is available
  const checkNativeShare = useCallback(() => {
    return typeof navigator !== 'undefined' && navigator.share;
  }, []);

  const shareUrl = meme?.imageUrl || '';
  const shareText = meme?.title ? `Check out this meme: "${meme.title}"` : 'Check out this meme!';
  const shareTitle = meme?.title || 'SwipeMeme';

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      toast.success('Shared successfully!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        toast.error('Share failed. Try copying the link.');
      }
    }
  };

  const handleShareClick = () => {
    if (checkNativeShare()) {
      handleNativeShare();
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToReddit = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const shareToFriend = () => {
    setIsOpen(false);
    setShowFriendShare(true);
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        className="w-14 h-14 flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-all hover:scale-110 active:scale-95 border border-primary/20"
        aria-label="Share meme"
      >
        <Share2 size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[320px] bg-card border border-border rounded-2xl shadow-xl p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground">Share Meme</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ShareOption
                  icon={<Users size={20} />}
                  label="To Friend"
                  onClick={shareToFriend}
                  color="bg-primary/10 text-primary hover:bg-primary/20"
                />
                <ShareOption
                  icon={<AtSign size={20} />}
                  label="Twitter"
                  onClick={shareToTwitter}
                  color="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
                />
                <ShareOption
                  icon={<Globe size={20} />}
                  label="Facebook"
                  onClick={shareToFacebook}
                  color="bg-blue-600/10 text-blue-700 hover:bg-blue-600/20"
                />
                <ShareOption
                  icon={<MessageCircle size={20} />}
                  label="Reddit"
                  onClick={shareToReddit}
                  color="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                />
                <ShareOption
                  icon={<Send size={20} />}
                  label="Telegram"
                  onClick={shareToTelegram}
                  color="bg-sky-400/10 text-sky-500 hover:bg-sky-400/20"
                />
                <ShareOption
                  icon={<MessageCircle size={20} />}
                  label="WhatsApp"
                  onClick={shareToWhatsApp}
                  color="bg-green-500/10 text-green-600 hover:bg-green-500/20"
                />
                <ShareOption
                  icon={<Link2 size={20} />}
                  label="Copy"
                  onClick={copyToClipboard}
                  color="bg-muted text-foreground hover:bg-muted/80"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showFriendShare && (
        <ShareToFriendModal
          meme={meme}
          onClose={() => setShowFriendShare(false)}
        />
      )}
    </>
  );
}

function ShareOption({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
