import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStore {
  displayName: string;
  avatar: string;
  setDisplayName: (name: string) => void;
  setAvatar: (avatar: string) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      displayName: '',
      avatar: '',
      setDisplayName: (name) => set({ displayName: name }),
      setAvatar: (avatar) => set({ avatar }),
    }),
    { name: 'codenames-player' },
  ),
);
