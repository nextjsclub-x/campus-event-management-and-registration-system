'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { User } from '@/schema/user.schema';

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'teacher':
      return '教师';
    default:
      return '学生';
  }
};

interface ProfileClientProps {
  user: User;
  updateAction: (name: string) => Promise<void>;
  changePasswordAction: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function ProfileClient({ user, updateAction, changePasswordAction }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!newName.trim()) {
      toast.error('姓名不能为空');
      return;
    }

    setIsPending(true);
    try {
      await updateAction(newName.trim());
      toast.success('修改成功');
      setIsEditing(false);
    } catch (error) {
      toast.error('修改失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    if (!newPassword) {
      toast.error('请输入新密码');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setIsPending(true);
    try {
      await changePasswordAction(currentPassword, newPassword);
      toast.success('密码修改成功');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('密码修改失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='container py-8'>
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <div className='font-medium'>邮箱</div>
              <div>{user.email}</div>
            </div>
            <div>
              <div className='font-medium'>姓名</div>
              {isEditing ? (
                <div className='flex items-center gap-2 mt-1'>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder='请输入姓名'
                    disabled={isPending}
                  />
                  <Button onClick={handleSubmit}
                    disabled={isPending}>
                    {isPending ? '保存中...' : '保存'}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsEditing(false);
                      setNewName(user.name);
                    }}
                    disabled={isPending}
                  >
                    取消
                  </Button>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <div>{user.name}</div>
                  <Button variant='outline'
                    size='sm'
                    onClick={() => setIsEditing(true)}>
                    修改
                  </Button>
                </div>
              )}
            </div>
            <div>
              <div className='font-medium'>密码</div>
              {isChangingPassword ? (
                <div className='space-y-2 mt-1'>
                  <Input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder='请输入当前密码'
                    disabled={isPending}
                  />
                  <Input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='请输入新密码'
                    disabled={isPending}
                  />
                  <Input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='请确认新密码'
                    disabled={isPending}
                  />
                  <div className='flex items-center gap-2'>
                    <Button onClick={handleChangePassword}
                      disabled={isPending}>
                      {isPending ? '修改中...' : '修改密码'}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      disabled={isPending}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <div>********</div>
                  <Button variant='outline'
                    size='sm'
                    onClick={() => setIsChangingPassword(true)}>
                    修改
                  </Button>
                </div>
              )}
            </div>
            <div>
              <div className='font-medium'>角色</div>
              <div>{getRoleText(user.role)}</div>
            </div>
            {user.studentId && (
              <div>
                <div className='font-medium'>学号</div>
                <div>{user.studentId}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
