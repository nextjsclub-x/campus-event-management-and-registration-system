import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  token: string | null;
  userId: number | null;
  role: string | null;
  username: string | null;
  // actions
  setUserInfo: (info: { token: string; userId: number; role: string; username: string } | null) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      role: null,
      username: null,

      setUserInfo: (info) => set(info ? {
        token: info.token,
        userId: info.userId,
        role: info.role,
        username: info.username
      } : {
        token: null,
        userId: null,
        role: null,
        username: null
      }),
      clearUserInfo: () => set({
        token: null,
        userId: null,
        role: null,
        username: null
      })
    }),
    {
      name: 'user-storage', // localStorage 的 key
    }
  )
);
