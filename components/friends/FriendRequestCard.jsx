'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { authenticatedFetch } from '@/lib/api';

export default function FriendRequestCard({ request, type }) {
  const queryClient = useQueryClient();
  const user = type === 'incoming' ? request.requester : request.recipient;

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await authenticatedFetch('/api/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ requestId: request._id })
      });
      if (!res.ok) throw new Error('Failed to accept');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Friend request accepted!');
      queryClient.invalidateQueries(['friend-requests']);
      queryClient.invalidateQueries(['friends']);
    },
    onError: () => {
      toast.error('Failed to accept request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await authenticatedFetch('/api/friends/reject', {
        method: 'POST',
        body: JSON.stringify({ requestId: request._id })
      });
      if (!res.ok) throw new Error('Failed to reject');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Friend request rejected');
      queryClient.invalidateQueries(['friend-requests']);
    },
    onError: () => {
      toast.error('Failed to reject request');
    }
  });

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
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
          <p className="text-[10px] text-muted-foreground">
            {type === 'incoming' ? 'Wants to be friends' : 'Request sent'}
          </p>
        </div>
      </div>

      {type === 'incoming' ? (
        <div className="flex gap-2">
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            size="sm"
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
          >
            <Check size={16} />
          </Button>
          <Button
            onClick={() => rejectMutation.mutate()}
            disabled={rejectMutation.isPending}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => rejectMutation.mutate()}
          disabled={rejectMutation.isPending}
          size="sm"
          variant="ghost"
          className="text-[10px] text-muted-foreground hover:text-red-500"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
