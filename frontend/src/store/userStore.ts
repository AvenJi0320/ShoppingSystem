import { create } from 'zustand';

interface UserStore {
  user_id: number | null;
  phone?: string;
  email?: string;
  role: number;
  setUser: (user_id: number, phone?: string, email?: string, role?: number) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user_id: null,
  phone: undefined,
  email: undefined,
  role: 0,

  setUser: (user_id, phone, email, role = 0) => {
    set({ user_id, phone, email, role });
  },

  clearUser: () => {
    set({ user_id: null, phone: undefined, email: undefined, role: 0 });
  },
}));