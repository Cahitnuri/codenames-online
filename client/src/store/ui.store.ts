import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIStore {
  toasts: Toast[];
  sabotageMode: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setSabotageMode: (active: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  sabotageMode: false,

  addToast: ({ message, type }) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3500);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  setSabotageMode: (active) => set({ sabotageMode: active }),
}));
