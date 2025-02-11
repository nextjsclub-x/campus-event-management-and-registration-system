/* eslint-disable no-nested-ternary */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  studentId: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await get('/api/profile');
      if (response.code === APIStatusCode.OK) {
        setProfile(response.data);
      } else {
        toast.error(response.message || '获取个人信息失败');
      }
    } catch (error) {
      console.error('获取个人信息失败:', error);
      toast.error('获取个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div className='container py-8'>加载中...</div>;
  }

  if (!profile) {
    return <div className='container py-8'>获取个人信息失败</div>;
  }

  return (
    <div className='container py-8'>
      <div className='w-full'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold mb-2'>个人信息</h1>
          <p className='text-muted-foreground'>查看和管理您的个人信息</p>
        </div>

        <div className='space-y-6 w-full'>
          <div className='border-b pb-4'>
            <h3 className='font-medium text-muted-foreground mb-2'>用户名</h3>
            <p>{profile.name}</p>
          </div>

          <div className='border-b pb-4'>
            <h3 className='font-medium text-muted-foreground mb-2'>邮箱</h3>
            <p>{profile.email}</p>
          </div>

          <div className='border-b pb-4'>
            <h3 className='font-medium text-muted-foreground mb-2'>角色</h3>
            <p>{profile.role === 'admin' ? '管理员' : profile.role === 'teacher' ? '教师' : '学生'}</p>
          </div>

          <div className='border-b pb-4'>
            <h3 className='font-medium text-muted-foreground mb-2'>学号</h3>
            <p>{profile.studentId || '无'}</p>
          </div>

          <div className='border-b pb-4'>
            <h3 className='font-medium text-muted-foreground mb-2'>注册时间</h3>
            <p>{new Date(profile.createdAt).toLocaleString()}</p>
          </div>

          <div className='flex space-x-4 pt-4'>
            <Link href='/profile/update-password'>
              <Button>修改密码</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
