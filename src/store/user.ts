import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

type UserState = {
  token: string | null;
  setToken: (token: string | null) => void;
};

// 定义持久化配置类型
type UserPersist = {
  state: UserState;
  version?: number;
};

// 配置持久化参数
const persistConfig: PersistOptions<UserState, UserPersist> = {
  name: 'user-storage',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
    }),
    persistConfig
  )
);
