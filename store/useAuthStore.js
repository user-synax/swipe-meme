import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  selectedTag: null,

  setUser: (user) => set({ user }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setToken: (token) => {
    if (token) {
      Cookies.set('token', token, { expires: 7 });
    } else {
      Cookies.remove('token');
    }
    set({ token });
  },

  logout: () => {
    Cookies.remove('token');
    set({ user: null, token: null });
  },

  initFromCookie: async () => {
    set({ isLoading: true });
    const token = Cookies.get('token');
    if (token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          set({ user: data.user, token, isLoading: false });
        } else {
          Cookies.remove('token');
          set({ user: null, token: null, isLoading: false });
        }
      } catch (error) {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  }
}));
