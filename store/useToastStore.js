import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));

export const toast = {
  success: (message, duration) => useToastStore.getState().addToast({ message, type: 'success', duration }),
  error: (message, duration) => useToastStore.getState().addToast({ message, type: 'error', duration }),
  info: (message, duration) => useToastStore.getState().addToast({ message, type: 'info', duration }),
};
