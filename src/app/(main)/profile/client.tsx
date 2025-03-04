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
}

export function ProfileClient({ user, updateAction }: ProfileClientProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(user.name);
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
    <Button
      variant='outline'
      size='sm'
      onClick={() => setIsEditing(true)}
									>
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
