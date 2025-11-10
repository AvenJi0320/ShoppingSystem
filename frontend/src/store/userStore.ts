import { create } from 'zustand';

interface UserStore {
  user_id: number | null;
  phone?: string;
  email?: string;
  setUser: (user_id: number, phone?: string, email?: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user_id: null,
  phone: undefined,
  email: undefined,

  setUser: (user_id, phone, email) => {
    set({ user_id, phone, email });
  },

  clearUser: () => {
    set({ user_id: null, phone: undefined, email: undefined });
  },
}));