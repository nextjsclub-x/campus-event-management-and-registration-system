'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { get } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  name: string;
  role: number;
  createdAt: string;
  activityCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get('/api/admin/users');
        if (response.code === APIStatusCode.OK) {
          setUsers(response.data.users);
        } else {
          toast.error(response.message || '获取用户列表失败');
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        toast.error('获取用户列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleBadge = (role: number) => {
    switch (role) {
      case 0:
        return <Badge variant='secondary'>普通用户</Badge>;
      case 1:
        return <Badge>管理员</Badge>;
      default:
        return <Badge variant='outline'>未知角色</Badge>;
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
          {loading ? (
            <div className='text-center py-4'>加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>参与活动数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                    <TableCell className='text-red-500 font-medium'>{user.activityCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
