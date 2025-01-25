'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { get, put } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await get('/api/profile');
      if (response.code === APIStatusCode.OK) {
        setProfile(response.data);
        setNewName(response.data.name);
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

  const handleSubmit = async () => {
    if (!newName.trim()) {
      toast.error('用户名不能为空');
      return;
    }

    setSaving(true);
    try {
      const response = await put('/api/profile', { name: newName.trim() });
      if (response.code === APIStatusCode.OK) {
        toast.success('更新成功');
        setIsEditing(false);
        // 刷新个人信息
        fetchProfile();
      } else {
        toast.error(response.message || '更新失败');
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      toast.error('更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='container mx-auto py-8'>加载中...</div>;
  }

  if (!profile) {
    return <div className='container mx-auto py-8'>获取个人信息失败</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>查看和管理您的个人信息</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <h3 className='font-medium text-muted-foreground'>用户名</h3>
            {isEditing ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='请输入新的用户名'
              />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>
          <div className='space-y-2'>
            <h3 className='font-medium text-muted-foreground'>邮箱</h3>
            <p>{profile.email}</p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-medium text-muted-foreground'>角色</h3>
            <p>{profile.role === 'admin' ? '管理员' : '普通用户'}</p>
          </div>
          <div className='space-y-2'>
            <h3 className='font-medium text-muted-foreground'>注册时间</h3>
            <p>{new Date(profile.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
        <CardFooter className='flex justify-end space-x-4'>
          {isEditing ? (
            <>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditing(false);
                  setNewName(profile.name);
                }}
                disabled={saving}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              修改用户名
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
