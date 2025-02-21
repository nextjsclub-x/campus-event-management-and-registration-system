/* eslint-disable lines-around-directive */
/* eslint-disable @typescript-eslint/naming-convention */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useUserList, useUpdateUserRole } from '@/hooks/user-user';
import type { UserRole } from '@/schema/user.schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const roleMap: Record<UserRole, { label: string; variant: 'secondary' | 'default' }> = {
  'student': { label: '学生', variant: 'secondary' },
  'teacher': { label: '教师', variant: 'default' },
  'admin': { label: '管理员', variant: 'default' },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useUserList({
    page,
    pageSize
  });

  const { mutate: updateRole, isPending: isUpdating } = useUpdateUserRole();

  const users = data?.data?.users || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handleRoleChange = (userId: number, currentRole: UserRole) => {
    // 角色升级路径：student -> teacher -> admin
    const roleUpgradePath: UserRole[] = ['student', 'teacher', 'admin'];
    const currentIndex = roleUpgradePath.indexOf(currentRole);
    const newRole = currentIndex === roleUpgradePath.length - 1
      ? roleUpgradePath[0]
      : roleUpgradePath[currentIndex + 1];

    updateRole({ id: userId, role: newRole });
  };

  const getNextRole = (currentRole: UserRole): UserRole => {
    switch (currentRole) {
      case 'admin':
        return 'student';
      case 'teacher':
        return 'admin';
      default:
        return 'teacher';
    }
  };

  const _getStatusBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge variant='destructive'>管理员</Badge>;
      case 'teacher':
        return <Badge variant='secondary'>教师</Badge>;
      default:
        return <Badge>学生</Badge>;
    }
  };

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>用户管理</h1>
        <Button
          variant='outline'
          onClick={() => router.push('/admin')}
        >
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}
                        className='text-center'>
                        暂无用户
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={roleMap[user.role]?.variant}>
                            {roleMap[user.role]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={isUpdating}
                              >
                                修改角色
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认修改角色</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要将用户 {user.name} 的角色从
                                  {roleMap[user.role]?.label}
                                  修改为
                                  {roleMap[getNextRole(user.role)]?.label}
                                  吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRoleChange(user.id, user.role)}
                                >
                                  确认修改
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className='flex justify-center gap-2 mt-4'>
                <Button
                  variant='outline'
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
