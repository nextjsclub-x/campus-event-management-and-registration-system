'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSignUp } from '@/hooks/use-auth';
import type { UserRegisterRequest } from '@/types/user.type';

// 注册表单验证 schema
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(2, '姓名至少2个字符'),
  studentId: z.string().min(5, '学号格式不正确'),
}) satisfies z.ZodType<UserRegisterRequest>;

export default function RegisterPage() {
  const signUp = useSignUp();

  const form = useForm<UserRegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      studentId: '',
    },
  });

  const onSubmit = (data: UserRegisterRequest) => {
    signUp.mutate(data);
  };

  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle>注册账号</CardTitle>
          <CardDescription>创建一个新的账号来使用系统</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='请输入邮箱'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      请使用有效的邮箱地址，这将用于登录和接收通知
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='请输入密码'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      密码长度至少为6位
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入姓名'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      请输入您的真实姓名，至少2个字符
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='studentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学号</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入学号'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      请输入您的学号，至少5位数字
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='w-full'
                disabled={signUp.isPending}
              >
                {signUp.isPending ? '注册中...' : '注册'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
