'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { get, post } from '@/utils/request/request';
import { APIStatusCode } from '@/schema/api-response.schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';

interface Registration {
  id: number;
  userId: number;
  userName: string;
  status: number;
  registeredAt: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentRegistrations: number;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{
    registered: boolean;
    status: number | null;
  }>({ registered: false, status: null });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await get(`/api/activities/${params.id}`);
        if (response.code === APIStatusCode.OK) {
          setActivity(response.data);
        }
      } catch (error) {
        console.error('获取活动详情失败:', error);
      }
    };

    const fetchRegistrations = async () => {
      try {
        const response = await get(`/api/activities/${params.id}/registrations`);
        if (response.code === APIStatusCode.OK) {
          setRegistrations(response.data.registrations);
        }
      } catch (error) {
        console.error('获取报名记录失败:', error);
      }
    };

    const fetchRegistrationStatus = async () => {
      try {
        const response = await get(`/api/activities/${params.id}/registration-status`);
        if (response.code === APIStatusCode.OK) {
          setRegistrationStatus(response.data);
        }
      } catch (error) {
        console.error('获取报名状态失败:', error);
      }
    };

    if (params.id) {
      fetchActivity();
      fetchRegistrations();
      fetchRegistrationStatus();
    }
  }, [params.id]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await post(`/api/activities/${params.id}/register`);
      if (response.code === APIStatusCode.OK) {
        toast.success('报名成功！');
        // 刷新活动信息和报名记录
        const updatedActivity = await get(`/api/activities/${params.id}`);
        const updatedRegistrations = await get(`/api/activities/${params.id}/registrations`);
        if (updatedActivity.code === APIStatusCode.OK) {
          setActivity(updatedActivity.data);
        }
        if (updatedRegistrations.code === APIStatusCode.OK) {
          setRegistrations(updatedRegistrations.data.registrations);
        }
        // 更新报名状态
        const updatedStatus = await get(`/api/activities/${params.id}/registration-status`);
        if (updatedStatus.code === APIStatusCode.OK) {
          setRegistrationStatus(updatedStatus.data);
        }
      } else {
        toast.error(response.message || '报名失败，请重试');
      }
    } catch (error: any) {
      toast.error(error.message || '报名失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!activity) {
    return <div>加载中...</div>;
  }

  const isRegistrationDisabled = 
    loading || 
    registrationStatus.registered || 
    activity.currentRegistrations >= activity.capacity;

  const getRegistrationStatusText = () => {
    if (loading) return '报名中...';
    if (registrationStatus.registered) {
      switch (registrationStatus.status) {
        case 0: return '已取消报名';
        case 1: return '待审核';
        case 2: return '已通过';
        case 3: return '已拒绝';
        case 4: return '候补名单';
        default: return '已报名';
      }
    }
    if (activity.currentRegistrations >= activity.capacity) return '名额已满';
    return '立即报名';
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-1 container mx-auto px-4 py-8'>
        <Card className='max-w-3xl mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl'>{activity.title}</CardTitle>
            <CardDescription>
              时间：{new Date(activity.startTime).toLocaleString()} - {new Date(activity.endTime).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>活动地点</h3>
                <p className='text-muted-foreground'>{activity.location}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>活动详情</h3>
                <p className='text-muted-foreground'>{activity.description}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>报名情况</h3>
                <p className='text-muted-foreground'>
                  已报名 {activity.currentRegistrations} / {activity.capacity} 人
                </p>
              </div>
              
              {/* 报名记录列表 */}
              <div>
                <h3 className='font-semibold mb-2'>报名记录</h3>
                <div className='border rounded-lg'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>报名时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>{registration.userName}</TableCell>
                          <TableCell>
                            {registration.status === 0 && '已取消'}
                            {registration.status === 1 && '待审核'}
                            {registration.status === 2 && '已通过'}
                            {registration.status === 3 && '已拒绝'}
                            {registration.status === 4 && '候补名单'}
                          </TableCell>
                          <TableCell>
                            {new Date(registration.registeredAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline'
              onClick={() => router.back()}>返回
            </Button>
            <Button 
              onClick={handleRegister} 
              disabled={isRegistrationDisabled}
            >
              {getRegistrationStatusText()}
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className='border-t'>
        <div className='container mx-auto px-4 py-6 text-center text-muted-foreground'>
          <p>© 2024 校园活动管理系统. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
