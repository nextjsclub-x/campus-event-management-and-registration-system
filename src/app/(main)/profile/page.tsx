'use client';

import { useCurrentUser } from '@/hooks/user-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function ProfilePage() {
  const { data, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className='container py-8'>
        <Card>
          <CardHeader>
            <CardTitle>个人信息</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px] mt-4' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.data) {
    return <div className='container py-8'>获取用户信息失败</div>;
  }

  const user = data.data;

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
              <div>{user.name}</div>
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
