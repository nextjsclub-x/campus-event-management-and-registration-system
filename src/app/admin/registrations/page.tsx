'use client';

import { useEffect, useState } from 'react';
import { get, put } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast, { Toaster } from 'react-hot-toast';

interface Registration {
  id: number;
  status: number;
  registeredAt: string;
  userId: number;
  activityId: number;
  userName: string;
  userEmail: string;
  activityTitle: string;
  activityStartTime: string;
}

const statusMap = {
  0: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  1: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  2: { label: '已批准', color: 'bg-green-100 text-green-800' },
  3: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
  4: { label: '候补名单', color: 'bg-blue-100 text-blue-800' },
  5: { label: '已参加', color: 'bg-purple-100 text-purple-800' },
  6: { label: '未出席', color: 'bg-orange-100 text-orange-800' }
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRegistrations = async () => {
    try {
      const response = await get(`/api/admin/registrations?page=${currentPage}`);
      if (response.code === APIStatusCode.OK) {
        setRegistrations(response.data.registrations);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取报名记录失败:', error);
      toast.error('获取报名记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage]);

  const handleApprove = async (registrationId: number) => {
    try {
      const response = await put(`/api/admin/registrations/${registrationId}`, {
        status: 2 // 已批准
      });
      
      if (response.code === APIStatusCode.OK) {
        toast.success('审核通过成功');
        fetchRegistrations(); // 刷新列表
      } else {
        toast.error(response.message || '审核失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    }
  };

  const handleReject = async (registrationId: number) => {
    try {
      const response = await put(`/api/admin/registrations/${registrationId}`, {
        status: 3 // 已拒绝
      });
      
      if (response.code === APIStatusCode.OK) {
        toast.success('审核拒绝成功');
        fetchRegistrations(); // 刷新列表
      } else {
        toast.error(response.message || '审核失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    }
  };

  if (loading) {
    return <div className='container mx-auto p-4'>加载中...</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <Toaster />
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>报名管理</h1>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>活动</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>报名时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>{registration.id}</TableCell>
                <TableCell>
                  <div>
                    <div>{registration.userName}</div>
                    <div className='text-sm text-gray-500'>{registration.userEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{registration.activityTitle}</div>
                    <div className='text-sm text-gray-500'>
                      {new Date(registration.activityStartTime).toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={statusMap[registration.status as keyof typeof statusMap].color}
                  >
                    {statusMap[registration.status as keyof typeof statusMap].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(registration.registeredAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {registration.status === 1 && (
                    <div className='flex gap-2'>
                      <Button 
                        variant='outline' 
                        size='sm'
                        onClick={() => handleApprove(registration.id)}
                      >
                        通过
                      </Button>
                      <Button 
                        variant='outline' 
                        size='sm'
                        onClick={() => handleReject(registration.id)}
                      >
                        拒绝
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-center gap-2 mt-4'>
        <Button
          variant='outline'
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        <Button
          variant='outline'
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
} 
