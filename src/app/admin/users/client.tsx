'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { User, UserRole } from '@/schema/user.schema';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

interface UsersClientProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  updateAction: (id: number, role: UserRole) => Promise<User>;
}

const roleMap: Record<
  UserRole,
  { label: string; variant: 'secondary' | 'default' | 'destructive' }
> = {
  student: { label: '学生', variant: 'secondary' },
  teacher: { label: '教师', variant: 'default' },
  admin: { label: '管理员', variant: 'destructive' },
};

export function UsersClient({
  users,
  currentPage,
  totalPages,
  updateAction,
}: UsersClientProps) {
  const router = useRouter();
  const [page, setPage] = useState(currentPage);
  const [isPending, setIsPending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handlePageChange = (newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
      const searchParams = new URLSearchParams();
      searchParams.set('page', newPage.toString());
      router.push(`/admin/users?${searchParams.toString()}`);
    }
  };

  const handleRoleChange = async (userId: number) => {
    setIsPending(true);
    try {
      await updateAction(userId, selectedRole);
      router.refresh();
    } catch (error) {
      console.error('更新用户角色失败:', error);
    } finally {
      setIsPending(false);
    }
  };

  const getPaginationItems = () => {
    const items = [];
    const totalPagesToShow = 5; // 显示的总页码数
    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    // 添加第一页
    items.push(1);

    // 添加省略号
    if (startPage > 2) items.push('...');

    // 添加中间页码
    for (let i = startPage; i <= endPage; i += 1) {
      items.push(i);
    }

    // 添加省略号
    if (endPage < totalPages - 1) items.push('...');

    // 添加最后一页
    if (totalPages > 1) items.push(totalPages);

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>用户管理</h1>
        <Button variant='outline'
          onClick={() => router.push('/admin')}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableCell>
                      {new Date(user.createdAt).toLocaleString()}
                    </TableCell>
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
                            disabled={isPending}
                          >
                            修改角色
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>修改用户角色</AlertDialogTitle>
                            <AlertDialogDescription className='space-y-4'>
                              <div>当前用户：{user.name}</div>
                              <div>当前角色：{roleMap[user.role]?.label}</div>
                              <div className='pt-4'>
                                <div className='mb-4'>选择新角色：</div>
                                <RadioGroup
                                  defaultValue={user.role}
                                  onValueChange={(value) =>
                                    setSelectedRole(value as UserRole)
                                  }
                                >
                                  {Object.entries(roleMap).map(
                                    ([role, { label }]) => (
                                      <div
                                        key={role}
                                        className='flex items-center space-x-2'
                                      >
                                        <RadioGroupItem
                                          value={role}
                                          id={`role-${role}`}
                                          disabled={role === user.role}
                                        />
                                        <Label htmlFor={`role-${role}`}>
                                          {label}
                                        </Label>
                                      </div>
                                    )
                                  )}
                                </RadioGroup>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRoleChange(user.id)}
                              disabled={selectedRole === user.role}
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

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => page > 1 && handlePageChange(page - 1)}>上一页</PaginationPrevious>
              </PaginationItem>
              {paginationItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === 'number' ? (
                    <PaginationLink
                      onClick={() => handlePageChange(item)}
                      isActive={item === currentPage}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => page < totalPages && handlePageChange(page + 1)}>下一页</PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </main>
  );
}
