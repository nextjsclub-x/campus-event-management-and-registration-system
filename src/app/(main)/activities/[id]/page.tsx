/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { get, post } from '@/utils/request/request';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user';

// 活动状态类型
type ActivityStatus = 'upcoming' | 'ongoing' | 'ended';

// 报名记录接口
interface Registration {
  id: number;
  userId: number;
  user: {
    username: string;
  };
  registeredAt: string;
  status: number;
}

// 活动接口
interface Activity {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  currentParticipants: number;
  categoryId: number;
  category: {
    name: string;
  };
  organizer: {
    id: number;
    username: string;
  };
  status: number;  // 改为数字类型，因为后端返回的是数字
  isRegistered?: boolean;
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { userId, token } = useUserStore();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // 将数字状态转换为字符串状态
  const getActivityStatus = (activity: Activity): ActivityStatus => {
    const now = new Date();
    const startTime = new Date(activity.startTime);
    const endTime = new Date(activity.endTime);

    if (endTime < now) {
      return 'ended';
    }
    if (startTime <= now && now <= endTime) {
      return 'ongoing';
    }
    return 'upcoming';
  };

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const response = await get(`/api/activities/${params.id}`);
      if (response.code === 200) {
        setActivity(response.data);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取活动详情失败',
        description: '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取报名记录
  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const response = await get(`/api/registrations?activityId=${params.id}`);
      if (response.code === 200) {
        setRegistrations(response.data.registrations);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '获取报名记录失败',
        description: '请稍后重试'
      });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    fetchActivityDetail();
    fetchRegistrations();
  }, [params.id]);

  // 格式化日期
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

  // 获取活动状态标签
  const getStatusBadge = (activity: Activity) => {
    const status = getActivityStatus(activity);
    const statusConfig = {
      upcoming: { label: '即将开始', variant: 'secondary' as const },
      ongoing: { label: '进行中', variant: 'default' as const },
      ended: { label: '已结束', variant: 'destructive' as const },
    } as const;
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 获取报名状态标签
  const getRegistrationStatusBadge = (status: number) => {
    const statusConfig = {
      0: { label: '待审核', variant: 'secondary' as const },
      1: { label: '已确认', variant: 'default' as const },
      2: { label: '已取消', variant: 'destructive' as const },
      3: { label: '已拒绝', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[0];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 处理报名
  const handleRegistration = async () => {
    if (!userId) {
      toast({
        title: '请先登录',
        description: '登录后即可报名参加活动',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRegistering(true);
      const response = await post('/api/registrations', {
        activityId: parseInt(params.id, 10)
      });

      if (response.code === 200) {
        toast({
          title: '报名成功',
          description: '您已成功报名参加活动',
        });
        // 刷新活动详情和报名列表
        await Promise.all([
          fetchActivityDetail(),
          fetchRegistrations()
        ]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '报名失败',
        description: error.message || '请稍后重试',
      });
    } finally {
      setRegistering(false);
    }
  };

  // 处理取消报名
  const handleCancelRegistration = async () => {
    if (!activity?.isRegistered) {
      return;
    }

    try {
      setRegistering(true);
      // 首先获取用户在此活动的报名记录
      const registrationResponse = await get(`/api/registrations?activityId=${params.id}`);
      if (registrationResponse.code !== 200) {
        throw new Error('获取报名记录失败');
      }

      const userRegistration = registrationResponse.data.registrations.find(
        (reg: Registration) => reg.userId === userId
      );

      if (!userRegistration) {
        throw new Error('未找到报名记录');
      }

      // 调用取消报名接口
      const response = await post(`/api/registrations/${userRegistration.id}/cancel`, {});

      if (response.code === 200) {
        toast({
          title: '取消成功',
          description: '您已成功取消报名',
        });
        // 刷新活动详情和报名列表
        await Promise.all([
          fetchActivityDetail(),
          fetchRegistrations()
        ]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '取消失败',
        description: error.message || '请稍后重试',
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className='container mx-auto py-8'>加载中...</div>;
  }

  if (!activity) {
    return <div className='container mx-auto py-8'>活动不存在</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-2xl mb-2'>{activity.title}</CardTitle>
              <div className='flex items-center gap-2'>
                {getStatusBadge(activity)}
                <Badge variant='outline'>
                  {activity.category?.name || '未分类'}
                </Badge>
              </div>
            </div>
            {userId && getActivityStatus(activity) === 'upcoming' && (
              <Button
                onClick={activity.isRegistered ? handleCancelRegistration : handleRegistration}
                disabled={registering || activity.currentParticipants >= activity.capacity}
                variant={activity.isRegistered ? 'destructive' : 'default'}
              >
                {registering ? '处理中...' : 
                  activity.isRegistered ? '取消报名' : 
                  activity.currentParticipants >= activity.capacity ? '名额已满' : '立即报名'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-6'>
            {/* 活动详情 */}
            <div>
              <h3 className='text-lg font-semibold mb-2'>活动详情</h3>
              <p className='text-muted-foreground whitespace-pre-wrap'>
                {activity.description}
              </p>
            </div>

            <Separator />

            {/* 活动信息 */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h3 className='text-lg font-semibold mb-2'>时间信息</h3>
                <div className='space-y-2'>
                  <p>🕒 开始时间：{formatDate(activity.startTime)}</p>
                  <p>🕒 结束时间：{formatDate(activity.endTime)}</p>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>活动信息</h3>
                <div className='space-y-2'>
                  <p>📍 地点：{activity.location}</p>
                  <p>👥 报名情况：{activity.currentParticipants}/{activity.capacity}</p>
                  <p>👤 组织者：{activity.organizer?.username || '未知'}</p>
                </div>
              </div>
            </div>

            {/* 活动须知 */}
            <Separator />
            <div>
              <h3 className='text-lg font-semibold mb-2'>活动须知</h3>
              <ul className='list-disc list-inside space-y-2 text-muted-foreground'>
                <li>请准时参加活动</li>
                <li>活动开始前24小时内可以取消报名</li>
                <li>如有特殊情况请提前与组织者联系</li>
                <li>请遵守活动场地的相关规定</li>
              </ul>
            </div>

            {/* 报名记录 */}
            <Separator />
            <div>
              <h3 className='text-lg font-semibold mb-2'>报名记录</h3>
              {loadingRegistrations ? (
                <p className='text-muted-foreground'>加载中...</p>
              ) : registrations.length > 0 ? (
                <div className='space-y-4'>
                  {registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className='flex items-center justify-between p-4 rounded-lg border'
                    >
                      <div className='space-y-1'>
                        <div className='font-medium'>{registration.user.username}</div>
                        <div className='text-sm text-muted-foreground'>
                          报名时间：{formatDate(registration.registeredAt)}
                        </div>
                      </div>
                      {getRegistrationStatusBadge(registration.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>暂无报名记录</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
