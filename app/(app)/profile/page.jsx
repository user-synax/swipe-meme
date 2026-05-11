'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Camera, Edit2, Check, X as XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuthStore();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [isUploading, setIsUnloading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: matchesData } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await fetch('/api/match/list');
      return res.json();
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (newData) => {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setIsEditingBio(false);
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUnloading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setIsUnloading(false);
    }
  };

  const totalMatches = matchesData?.matches?.length || 0;

  return (
    <div className="p-6 bg-background min-h-screen pb-24">
      <h1 className="text-3xl font-black text-foreground mb-8 tracking-tighter">Your Profile</h1>
      
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center">
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-muted-foreground" size={64} />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Camera size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{user?.username}</h2>
            {user?.humorType && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                {user.humorType}
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-foreground tracking-tighter">{user?.swipeCount || 0}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Swipes</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-foreground tracking-tighter">{totalMatches}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Matches</p>
          </div>
        </div>

        
        {/* Bio Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bio</h3>
            {!isEditingBio ? (
              <button onClick={() => setIsEditingBio(true)} className="text-primary hover:bg-primary/5 p-1 rounded-md transition-colors">
                <Edit2 size={16} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => updateProfileMutation.mutate({ bio })} className="text-green-600 hover:bg-green-50 p-1 rounded-md">
                  <Check size={18} />
                </button>
                <button onClick={() => { setIsEditingBio(false); setBio(user?.bio || ''); }} className="text-destructive hover:bg-red-50 p-1 rounded-md">
                  <XIcon size={18} />
                </button>
              </div>
            )}
          </div>

          {isEditingBio ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm focus:border-primary outline-none transition-colors min-h-[100px] resize-none"
              placeholder="Tell us about your humor..."
              autoFocus
            />
          ) : (
            <p className="text-foreground text-sm leading-relaxed">
              {user?.bio || "No bio yet. Add one to show your humor mate who you are!"}
            </p>
          )}
        </div>

        {/* Logout */}
        <Button 
          onClick={logout}
          className="w-full bg-muted border border-border text-foreground hover:bg-destructive hover:text-white py-6 rounded-2xl flex items-center gap-2 font-bold transition-all"
        >
          <LogOut size={20} />
          Log Out
        </Button>
      </div>
    </div>
  );
}
