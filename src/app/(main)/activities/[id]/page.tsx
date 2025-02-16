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
  status: 'upcoming' | 'ongoing' | 'ended';
  isRegistered?: boolean;
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { userId, token } = useUserStore();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const response = await get(`/api/activity/${params.id}`);
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

  useEffect(() => {
    fetchActivityDetail();
  }, [params.id]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取活动状态标签
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: '即将开始', variant: 'secondary' },
      ongoing: { label: '进行中', variant: 'success' },
      ended: { label: '已结束', variant: 'destructive' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
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
      const response = await post(`/api/activity/${params.id}/register`, {
        userId,
      });

      if (response.code === 200) {
        toast({
          title: '报名成功',
          description: '您已成功报名参加活动',
        });
        fetchActivityDetail(); // 刷新活动详情
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
    try {
      setRegistering(true);
      const response = await post(`/api/activity/${params.id}/unregister`, {
        userId,
      });

      if (response.code === 200) {
        toast({
          title: '取消成功',
          description: '您已成功取消报名',
        });
        fetchActivityDetail(); // 刷新活动详情
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
    return <div className="container mx-auto py-8">加载中...</div>;
  }

  if (!activity) {
    return <div className="container mx-auto py-8">活动不存在</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{activity.title}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(activity.status)}
                <Badge variant="outline">
                  {activity.category.name}
                </Badge>
              </div>
            </div>
            {userId && activity.status === 'upcoming' && (
              <Button
                onClick={activity.isRegistered ? handleCancelRegistration : handleRegistration}
                disabled={registering}
                variant={activity.isRegistered ? "destructive" : "default"}
              >
                {registering ? '处理中...' : (activity.isRegistered ? '取消报名' : '立即报名')}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* 活动详情 */}
            <div>
              <h3 className="text-lg font-semibold mb-2">活动详情</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>

            <Separator />

            {/* 活动信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">时间信息</h3>
                <div className="space-y-2">
                  <p>🕒 开始时间：{formatDate(activity.startTime)}</p>
                  <p>🕒 结束时间：{formatDate(activity.endTime)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">活动信息</h3>
                <div className="space-y-2">
                  <p>📍 地点：{activity.location}</p>
                  <p>👥 报名情况：{activity.currentParticipants}/{activity.capacity}</p>
                  <p>👤 组织者：{activity.organizer.username}</p>
                </div>
              </div>
            </div>

            {/* 活动须知 */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">活动须知</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>请准时参加活动</li>
                <li>活动开始前24小时内可以取消报名</li>
                <li>如有特殊情况请提前与组织者联系</li>
                <li>请遵守活动场地的相关规定</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 