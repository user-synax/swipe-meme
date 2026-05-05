import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  selectedTag: null,

  setUser: (user) => set({ user }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setToken: (token) => {
    // We don't set cookies manually anymore, the server handles httpOnly cookies
    set({ token });
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({ user: null, token: null });
  },

  initFromCookie: async () => {
    try {
      const res = await fetch('/api/auth/me');
      
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          token: null,
          isLoading: false
        });
      } else {
        console.log('[AuthStore] Auth failed (not logged in)');
        set({ user: null, token: null, isLoading: false });
      }
    } catch (error) {
      console.error('[AuthStore] Auth init error:', error);
      set({ user: null, token: null, isLoading: false });
    } finally {
      // Ensure loading is always false
      set({ isLoading: false });
    }
  }
}));
