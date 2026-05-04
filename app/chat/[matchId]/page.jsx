'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pusherClient from '@/lib/pusherClient';
import { ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatPage({ params }) {
  const { matchId } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch match details
  const { data: matchData, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/match/common/${matchId}`, {
        headers: { Cookie: document.cookie },
      });
      if (!res.ok) throw new Error('Match not found');
      return res.json();
    },
  });

  const match = matchData?.match;

  // Fetch initial messages
  const { data: initialMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/messages?matchId=${matchId}`, {
        headers: { Cookie: document.cookie },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!matchId,
  });

  // Set initial messages when loaded
  useEffect(() => {
    if (initialMessages?.messages) {
      setMessages(initialMessages.messages);
    }
  }, [initialMessages]);

  // Subscribe to Pusher for real-time messages
  useEffect(() => {
    if (!matchId) return;

    const channel = pusherClient.subscribe(`match-${matchId}`);
    channel.bind('new-message', (data) => {
      setMessages((prev) => {
        // Deduplicate by _id
        if (prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      pusherClient.unsubscribe(`match-${matchId}`);
    };
  }, [matchId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText) => {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: document.cookie,
        },
        body: JSON.stringify({ matchId, text: messageText }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: (data) => {
      // Optimistic update already done, just clear input
      setText('');
      inputRef.current?.focus();
    },
    onError: () => {
      // Revert optimistic update on error
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;

    // Optimistic update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: match?.currentUser?.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    sendMessageMutation.mutate(text.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Guard: redirect if match not found or chat not unlocked
  useEffect(() => {
    if (!matchLoading && (!match || !match.chatUnlocked)) {
      router.push('/matches');
    }
  }, [match, matchLoading, router]);

  if (matchLoading || messagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!match || !match.chatUnlocked) {
    return null;
  }

  const otherUser = match.userA._id === match.currentUser?.id ? match.userB : match.userA;
  const isOwnMessage = (msg) => msg.senderId === match.currentUser?.id;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#111] px-4 py-3">
        <button
          onClick={() => router.push('/matches')}
          className="rounded-full p-2 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff4458] to-[#ff8a95] flex items-center justify-center text-lg font-bold">
            {otherUser.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{otherUser.username}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ff4458] font-medium">
                {Math.round(match.jaccardScore * 100)}% Humor Match
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/50">
            <p>No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwnMessage(msg)
                    ? 'bg-[#ff4458]/20 text-white'
                    : 'bg-[#1a1a1a] text-white'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="mt-1 text-xs text-white/50 text-right">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/10 bg-[#111] p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 rounded-full bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4458]/50"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sendMessageMutation.isPending}
            className="rounded-full bg-[#ff4458] p-3 hover:bg-[#ff3355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
