'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: 实现注册逻辑
      console.log('注册:', { email, password, name });
      router.push('/login');
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <CardTitle className='text-2xl font-bold'>注册</CardTitle>
          <CardDescription>创建您的账号</CardDescription>
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
              <Label htmlFor='name'>姓名</Label>
              <Input
                id='name'
                type='text'
                placeholder='请输入姓名'
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              {loading ? '注册中...' : '注册'}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => router.push('/login')}
            >
              已有账号？立即登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
