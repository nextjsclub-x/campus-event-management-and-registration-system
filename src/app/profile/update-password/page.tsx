'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { post } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';
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
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await post('/api/profile/update-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (response.code === APIStatusCode.OK) {
        toast.success('密码修改成功');
        router.push('/profile');
      } else {
        toast.error(response.message || '修改失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      toast.error('修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container py-8'>
      <div className='w-full'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold mb-2'>修改密码</h1>
          <p className='text-muted-foreground'>请输入您的原密码和新密码</p>
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
                {loading ? '提交中...' : '确认修改'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 
