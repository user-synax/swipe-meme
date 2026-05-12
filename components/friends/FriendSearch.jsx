'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, UserCheck, Clock, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/ui/skeleton/Skeleton';
import { authenticatedFetch } from '@/lib/api';

const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });

export default function FriendSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: async (searchQuery) => {
      const res = await authenticatedFetch('/api/friends/search', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (res.status === 401) {
        throw new Error('You need to be logged in to search for friends');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data.users || []);
    },
    onError: (err) => {
      if (err.message.includes('logged in')) {
        toast.error('Please log in to search for friends');
      } else {
        toast.error(err.message || 'Search failed');
      }
    }
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (username) => {
      const res = await authenticatedFetch('/api/friends/request', {
        method: 'POST',
        body: JSON.stringify({ username })
      });
      
      if (res.status === 401) {
        throw new Error('You need to be logged in to send friend requests');
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send request');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries(['friend-requests']);
      // Update the local results to show pending status
      searchMutation.mutate(query);
    },
    onError: (err) => {
      if (err.message.includes('logged in')) {
        toast.error('Please log in to send friend requests');
      } else {
        toast.error(err.message || 'Failed to send request');
      }
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }
    setIsSearching(true);
    searchMutation.mutate(query.trim());
  };

  const handleSendRequest = (username) => {
    sendRequestMutation.mutate(username);
  };

  const getRelationButton = (user) => {
    if (user.relationStatus === 'accepted') {
      return (
        <Button disabled variant="outline" size="sm" className="text-[10px]">
          <UserCheck size={12} className="mr-1" />
          Friends
        </Button>
      );
    }
    if (user.relationStatus === 'pending') {
      if (user.isRequester) {
        return (
          <Button disabled variant="outline" size="sm" className="text-[10px]">
            <Clock size={12} className="mr-1" />
            Accept?
          </Button>
        );
      }
      return (
        <Button disabled variant="outline" size="sm" className="text-[10px]">
          <Clock size={12} className="mr-1" />
          Pending
        </Button>
      );
    }
    return (
      <Button
        onClick={() => handleSendRequest(user.username)}
        disabled={sendRequestMutation.isPending}
        size="sm"
        className="text-[10px] bg-primary hover:bg-primary/90"
      >
        <UserPlus size={12} className="mr-1" />
        Add
      </Button>
    );
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
          <h3 className="font-bold text-foreground">Find Friends</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searchMutation.isPending}>
              <Search size={18} />
            </Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {searchMutation.isPending ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      {user.humorType && (
                        <p className="text-[10px] text-muted-foreground">{user.humorType}</p>
                      )}
                    </div>
                  </div>
                  {getRelationButton(user)}
                </div>
              ))
            ) : query.length >= 2 && !searchMutation.isPending ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No users found
              </p>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">
                Enter a username to search
              </p>
            )}
          </div>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}
