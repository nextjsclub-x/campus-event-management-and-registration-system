import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserPayload } from '@/types/user.type';

interface UserState {
  // 用户数据
  token: string | null;
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  studentId: string | null;
  
  // 状态标记
  isAuthenticated: boolean;
  isHydrated: boolean;

  // actions
  setUserInfo: (info: { token: string; user: UserPayload } | null) => void;
  clearUserInfo: () => void;
  setHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      token: null,
      id: null,
      name: null,
      email: null,
      role: null,
      status: null,
      studentId: null,
      isAuthenticated: false,
      isHydrated: false,

      // actions
      setUserInfo: (info) => {
        console.log('setUserInfo 被调用:', info);  // 检查传入的数据
        set((state) => {
          const newState = info ? {
            token: info.token,
            id: info.user.id,
            name: info.user.name,
            email: info.user.email,
            role: info.user.role,
            status: info.user.status,
            studentId: info.user.studentId,
            isAuthenticated: true,
          } : {
            token: null,
            id: null,
            name: null,
            email: null,
            role: null,
            status: null,
            studentId: null,
            isAuthenticated: false,
          };
          console.log('更新后的状态将为:', newState);  // 检查即将设置的状态
          return newState;
        });
      },

      clearUserInfo: () => set({
        token: null,
        id: null,
        name: null,
        email: null,
        role: null,
        status: null,
        studentId: null,
        isAuthenticated: false,
      }),

      setHydrated: (state: boolean) => {
        console.log('setHydrated 被调用:', state);  // 检查 hydration 状态变化
        set({ isHydrated: state });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const persistedState = {
          token: state.token,
          id: state.id,
          name: state.name,
          email: state.email,
          role: state.role,
          status: state.status,
          studentId: state.studentId,
          isAuthenticated: state.isAuthenticated,
        };
        console.log('准备持久化的状态:', persistedState);  // 检查要持久化的数据
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('hydration 完成，状态为:', state);  // 检查 hydration 完成时的状态
        state?.setHydrated(true);
      },
    }
  )
);
