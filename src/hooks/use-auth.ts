import { useMutation } from '@tanstack/react-query';
import { signUp, signIn } from '@/api/auth';
import type { UserRegisterRequest } from '@/types/user.type';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

export function useSignUp() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UserRegisterRequest) => signUp(data),
    onSuccess: (response) => {
      if (!response.data) {
        toast({
          variant: 'destructive',
          title: '注册失败',
          description: '服务器响应异常',
        });
        return;
      }

      toast({
        title: '注册成功',
        description: `欢迎加入，${response.data.name}！`,
      });
      // 注册成功后跳转到登录页
      router.push('/login');
    },
    onError: (error: Error & { code?: number }) => {
      toast({
        variant: 'destructive',
        title: '注册失败',
        description: error.message || '请稍后重试',
      });
    },
  });
}

export function useSignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const isHydrated = useUserStore((state) => state.isHydrated);

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => signIn(data),
    onSuccess: (response) => {
      if (!response.data) {
        toast({
          variant: 'destructive',
          title: '登录失败',
          description: '服务器响应异常',
        });
        return;
      }

      const { token, user } = response.data;
      
      // 存储用户信息到全局状态
      setUserInfo({ token, user });
      
      // 检查存储后的状态
      const currentState = useUserStore.getState();
      if (!isHydrated) {
        toast({
          variant: 'destructive',
          title: '登录异常',
          description: '状态同步失败，请重试',
        });
        return;
      }

      toast({
        title: '登录成功',
        description: `欢迎回来，${user.name}！`,
      });

      // 登录成功后跳转到首页
      router.push('/');
    },
    onError: (error: Error & { code?: number }) => {
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: error.message || '邮箱或密码错误',
      });
    },
  });
}

export function useSignOut() {
  const { toast } = useToast();
  const router = useRouter();
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);
  const isHydrated = useUserStore((state) => state.isHydrated);

  return useMutation({
    mutationFn: async () => {
      clearUserInfo();
      // 等待下一个事件循环，确保状态更新
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });
      
      const currentState = useUserStore.getState();
      // @ts-ignore - 我们知道这些属性存在于状态中
      if (currentState.user || currentState.token) {
        throw new Error('状态清除失败');
      }
      return true;
    },
    onSuccess: () => {
      if (!isHydrated) {
        toast({
          variant: 'destructive',
          title: '登出异常',
          description: '状态同步失败，请重试',
        });
        return;
      }

      toast({
        title: '登出成功',
        description: '期待您的再次访问！',
      });
      
      router.push('/');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '登出失败',
        description: error.message || '请稍后重试',
      });
    },
  });
}

/**
 * 使用示例：
 * 
 * function SignUpForm() {
 *   const signUp = useSignUp();
 * 
 *   const handleSubmit = async (data: UserRegisterRequest) => {
 *     signUp.mutate(data);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {signUp.isPending && <p>注册中...</p>}
 *       // 表单内容
 *     </form>
 *   );
 * }
 * 
 * function SignInForm() {
 *   const signIn = useSignIn();
 * 
 *   const handleSubmit = async (data: { email: string; password: string }) => {
 *     signIn.mutate(data);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {signIn.isPending && <p>登录中...</p>}
 *       // 表单内容
 *     </form>
 *   );
 * }
 * 
 * function SignOutButton() {
 *   const signOut = useSignOut();
 * 
 *   return (
 *     <button 
 *       onClick={() => signOut.mutate()} 
 *       disabled={signOut.isPending}
 *     >
 *       {signOut.isPending ? '登出中...' : '退出登录'}
 *     </button>
 *   );
 * }
 */ 
