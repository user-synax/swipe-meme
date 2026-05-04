'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import Link from 'next/link';

export default function ChatListPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: async () => {
      const res = await fetch('/api/match/list');
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json();
    },
  });

  const chatMatches = data?.matches?.filter((m) => m.chatUnlocked) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#111] px-4 py-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      {/* Chat list */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : chatMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="text-white/50" size={32} />
            </div>
            <p className="text-lg font-medium text-white/70">No conversations yet</p>
            <p className="text-sm text-white/50 mt-1">
              Unlock a match to start chatting
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {chatMatches.map((match) => (
              <Link key={match._id} href={`/chat/${match._id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-[#111] rounded-xl hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ff4458] to-[#ff8a95] flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {match.user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{match.user.username}</h3>
                      <span className="text-xs text-[#ff4458] font-medium">
                        {Math.round(match.jaccardScore * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-white/50 truncate">
                      {Math.round(match.jaccardScore * 100)}% Humor Match
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
