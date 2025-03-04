'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

interface LoginClientProps {
	onSubmit: (data: { email: string; password: string }) => Promise<void>;
}

export function LoginClient({ onSubmit }: LoginClientProps) {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsPending(true);

		try {
			await onSubmit({ email, password });
			// 服务端会处理重定向,这里不需要手动跳转
		} catch (error) {
			toast.error('登录失败', {
				description:
					error instanceof Error ? error.message : '请检查邮箱和密码是否正确',
			});
			setIsPending(false);
		}
	};

	return (
  <main className='min-h-screen flex items-center justify-center p-4 bg-background'>
    <Card className='min-w-96 w-full max-w-md'>
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
          <Button type='submit'
            className='w-full'
            disabled={isPending}>
            {isPending ? '登录中...' : '登录'}
          </Button>
          <Link href='/register'
            className='w-full'>
            <Button type='button'
              variant='outline'
              className='w-full'>
              没有账号？立即注册
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
    <Toaster />
  </main>
	);
}
