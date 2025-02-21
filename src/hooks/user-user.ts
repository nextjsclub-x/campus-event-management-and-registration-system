import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, getUserInfo, updatePassword, getUserList } from '@/api/user';
import { useToast } from '@/hooks/use-toast';
import type { UserInfo, UserUpdatePasswordRequest, UserListResponse } from '@/types/user.type';
import type { APIResponse } from '@/types/api-response.types';
import type { UserRole } from '@/schema/user.schema';

/**
 * 获取用户列表的hook
 */
export function useUserList(params?: {
	page?: number;
	pageSize?: number;
}) {
	return useQuery<APIResponse<UserListResponse>, Error>({
		queryKey: ['users', params?.page, params?.pageSize],
		queryFn: () => getUserList(params),
		retry: false,
		gcTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});
}

/**
 * 获取当前登录用户信息的hook
 */
export function useCurrentUser() {
	const { toast } = useToast();

	return useQuery({
		queryKey: ['currentUser'],
		queryFn: async () => {
			console.log('useCurrentUser: 开始请求用户信息');
			try {
				const result = await getCurrentUser();
				console.log('useCurrentUser: 请求成功', result);
				return result;
			} catch (error) {
				console.log('useCurrentUser: 请求失败', error);
				throw error;
			}
		},
		retry: false,
		staleTime: 1000 * 60 * 5, // 5分钟内不重新请求
	});
}

/**
 * 获取指定用户信息的hook
 */
export function useUserInfo(userId: number) {
	const { toast } = useToast();

	return useQuery({
		queryKey: ['user', userId],
		queryFn: () => getUserInfo(userId),
		enabled: !!userId,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5分钟内不重新请求
	});
}

/**
 * 更新用户密码的hook
 */
export function useUpdatePassword() {
	const { toast } = useToast();

	return useMutation({
		mutationFn: updatePassword,
		onSuccess: () => {
			toast({
				title: '密码修改成功',
				variant: 'default',
			});
		},
		onError: (error: Error) => {
			toast({
				title: '密码修改失败',
				description: error.message,
				variant: 'destructive',
			});
		},
	});
}

/**
 * 更新用户角色的hook
 */
export function useUpdateUserRole() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
			fetch(`/api/user/${id}/role`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ role }),
			}).then(async (res) => {
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || '更新失败');
				return data;
			}),
		onSuccess: () => {
			toast({
				title: '角色更新成功',
				variant: 'default',
			});
			// 更新成功后，使用户列表缓存失效
			queryClient.invalidateQueries({ queryKey: ['users'] });
		},
		onError: (error: Error) => {
			toast({
				title: '角色更新失败',
				description: error.message || '请稍后重试',
				variant: 'destructive',
			});
		},
	});
}

/**
 * 使用示例：
 *
 * function UserProfile() {
 *   const { data: currentUser, isLoading } = useCurrentUser();
 *
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>欢迎, {currentUser?.name}</h1>
 *       <p>邮箱: {currentUser?.email}</p>
 *     </div>
 *   );
 * }
 *
 * function OtherUserProfile({ userId }: { userId: number }) {
 *   const { data: user, isLoading } = useUserInfo(userId);
 *
 *   if (isLoading) {
 *     return <div>加载中...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>用户信息</h1>
 *       <p>姓名: {user?.name}</p>
 *       <p>邮箱: {user?.email}</p>
 *     </div>
 *   );
 * }
 *
 * function UpdatePasswordForm() {
 *   const { mutate: updatePassword, isLoading } = useUpdatePassword();
 *
 *   const handleSubmit = (data: UserUpdatePasswordRequest) => {
 *     updatePassword(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* 表单内容 *}
 *     </form>
 *   );
 * }
 */
