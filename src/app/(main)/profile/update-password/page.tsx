'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useUpdatePassword } from '@/hooks/user-user';
import { useSignOut } from '@/hooks/use-auth';

const formSchema = z.object({
  oldPassword: z.string().min(8, '密码至少8位'),
  newPassword: z.string().min(8, '密码至少8位'),
  confirmPassword: z.string().min(8, '密码至少8位'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
});

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { mutateAsync: updatePassword, isPending: isUpdating } = useUpdatePassword();
  const { mutateAsync: signOut, isPending: isSigningOut } = useSignOut();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 更新密码
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      // 更新成功后登出
      await signOut();

      // 跳转到登录页
      router.push('/login');
    } catch (error) {
      // 错误已经在 hook 中处理了
      console.error('操作失败:', error);
    }
  };

  const loading = isUpdating || isSigningOut;

  const getButtonText = () => {
    if (isUpdating) return '修改中...';
    if (isSigningOut) return '退出中...';
    return '确认修改';
  };

  return (
    <div className='container py-8'>
      <div className='w-full'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold mb-2'>修改密码</h1>
          <p className='text-muted-foreground'>请输入您的原密码和新密码，修改成功后需要重新登录</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>原密码</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='请输入原密码'
                      className='max-w-lg'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='请输入新密码'
                      className='max-w-lg'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认新密码</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='请再次输入新密码'
                      className='max-w-lg'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/profile')}
                disabled={loading}
              >
                取消
              </Button>
              <Button type='submit'
                disabled={loading}>
                {getButtonText()}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 
