import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStore {
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      displayName: '',
      setDisplayName: (name) => set({ displayName: name }),
    }),
    { name: 'codenames-player' },
  ),
);
