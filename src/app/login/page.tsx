'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { post } from '@/utils/request/request';
import { useUserStore } from '@/store/user';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await post('/api/sign-in', {
        email,
        password
      });
      
      // 登录成功，更新状态
      useUserStore.getState().setUserInfo({
        token: result.data.token,
        userId: result.data.userId,
        role: result.data.role,
        username: result.data.username
      });

      toast({
        title: '登录成功',
        description: '正在跳转到首页...',
      });
      router.push('/');
      
    } catch (error: any) {
      // 从API响应中提取错误信息
      const errorMessage = error.response?.data?.message || '登录失败，请稍后重试';
      
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className='min-h-screen flex items-center justify-center p-4 bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <Button
              variant='ghost'
              className='w-fit h-fit p-0 mb-4'
              onClick={() => router.push('/')}
            >
              <ArrowLeft className='h-6 w-6' />
            </Button>
            <CardTitle className='text-2xl font-bold'>登录</CardTitle>
            <CardDescription>请输入您的账号信息</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>邮箱</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='请输入邮箱'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>密码</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='请输入密码'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className='flex flex-col space-y-4'>
              <Button
                type='submit'
                className='w-full'
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
              <Link href='/register'
                className='w-full'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                >
                  没有账号？立即注册
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Toaster />
    </>
  );
}
