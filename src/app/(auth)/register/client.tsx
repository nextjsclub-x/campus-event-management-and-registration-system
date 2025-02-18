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
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/schema/user.schema';
import Link from 'next/link';

interface RegisterError {
  code?: number;
  message?: string;
}

interface RegisterFormProps {
  onSubmit: (
    email: string,
    password: string,
    name: string,
    studentId: string,
  ) => Promise<{
    id: number;
    email: string;
    name: string;
    role: UserRole;
  }>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    studentId?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // 清除之前的错误

    try {
      await onSubmit(email, password, name, studentId);

      toast({
        title: '注册成功',
        description: '正在跳转到登录页面...',
      });
      router.push('/login');
    } catch (error: unknown) {
      const err = error as RegisterError;
      // 处理特定错误
      if (err.code === 409) {
        setErrors({ email: '该邮箱已被注册' });
        document.getElementById('email')?.focus();
        toast({
          variant: 'destructive',
          title: '注册失败',
          description: '该邮箱已被注册，您可以直接登录',
        });
      } else if (err.code === 400) {
        // 处理表单验证错误
        toast({
          variant: 'destructive',
          title: '输入有误',
          description: err.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: '注册失败',
          description: err.message || '发生未知错误，请重试',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='min-w-96 w-full max-w-md'>
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
            <Label htmlFor='email'>
              邮箱
              <span className='text-sm text-muted-foreground ml-1'>
                （必填，用于登录账号）
              </span>
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='请输入邮箱'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className='text-sm text-red-500 mt-1'>{errors.email}</p>
            )}
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
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className='text-sm text-red-500 mt-1'>{errors.name}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='studentId'>
              学号
              <span className='text-sm text-muted-foreground ml-1'>
                （选填）
              </span>
            </Label>
            <Input
              id='studentId'
              type='text'
              placeholder='请输入学号'
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={errors.studentId ? 'border-red-500' : ''}
            />
            {errors.studentId && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.studentId}
              </p>
            )}
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
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className='text-sm text-red-500 mt-1'>{errors.password}</p>
            )}
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
          <Link
            href='/login'
            className='w-full'
          >
            <Button
              type='button'
              variant='outline'
              className='w-full'
            >
              已有账号？立即登录
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
} 
