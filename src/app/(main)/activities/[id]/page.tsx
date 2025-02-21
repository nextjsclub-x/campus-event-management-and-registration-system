/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-nested-ternary */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/store/user';
import { useActivity } from '@/hooks/use-activity';
import { useActivityRegistrations, useCreateRegistration, useCancelRegistration, useRegistrationList } from '@/hooks/use-registration';
import type { Activity as ActivityType } from '@/types/activity.types';
import { getUserInfo } from '@/api/user';
import type { UserInfo } from '@/types/user.type';
import type { ActivityRegistrationItem } from '@/types/registration.types';
import { RegistrationStatus } from '@/types/registration.types';

// 活动状态类型
type ActivityStatus = 'upcoming' | 'ongoing' | 'ended';

// 注册相关接口定义
interface EnrichedUserInfo extends UserInfo {
  name: string;
}

interface RegistrationWithUser extends ActivityRegistrationItem {
  user: EnrichedUserInfo;
}

// 扩展Activity类型，添加isRegistered属性
interface Activity extends ActivityType {
  isRegistered?: boolean;
  currentParticipants: number;
  category: {
    name: string;
  };
  organizer: {
    id: number;
    username: string;
  };
}

export default function ActivityDetailPage({
  params,
}: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id: userId } = useUserStore();
  const { data: activityResponse, isLoading: isLoadingActivity } = useActivity(Number(params.id));
  const { data: registrationResponse, isLoading: isLoadingRegistrations } = useActivityRegistrations(
    Number(params.id),
    { page: 1, pageSize: 100 }
  );

  const { mutateAsync: createRegistration, isPending: isRegistering } = useCreateRegistration();
  const { mutateAsync: cancelRegistration, isPending: isCancelling } = useCancelRegistration();

  // 从API响应中获取活动详情
  const activity = activityResponse?.data as Activity | undefined;
  const registrations = registrationResponse?.data?.registrations || [];

  // 检查当前用户是否已报名
  const userRegistration = useMemo(() =>
    registrations.find(reg => reg.userId === Number(userId)),
    [registrations, userId]
  );

  // 提取用户ID并获取用户信息
  const userIds = useMemo(() =>
    Array.from(new Set(registrations.map(reg => reg.userId))),
    [registrations]
  );

  // 使用 useQueries 批量获取用户信息
  const userQueries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => getUserInfo(id),
      enabled: !!id,
    }))
  });

  const isLoadingUsers = userQueries.some(query => query.isLoading);

  // 组装带用户信息的报名列表
  const registrationsWithUser = useMemo(() =>
    registrations.map((registration) => {
      const userInfo = userQueries
        .find(q => q.data?.data?.id === registration.userId)
        ?.data?.data;
      return {
        ...registration,
        user: {
          ...userInfo,
          name: userInfo?.name || '未知用户'
        }
      } as RegistrationWithUser;
    }),
    [registrations, userQueries]
  );

  // 格式化日期
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取活动状态标签
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
      4: { label: '候补名单', variant: 'secondary' as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig[0];
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
      await createRegistration({
        activityId: Number(params.id),
      });
      toast({
        title: '报名成功',
        description: '您已成功报名该活动',
        variant: 'default',
      });
    } catch (error) {
      console.error('报名失败:', error);
      let errorMessage = '活动不可报名或已结束';

      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          errorMessage = '您已经报名过该活动';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: '报名失败',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // 处理取消报名
  const handleCancelRegistration = async () => {
    if (!activity?.isRegistered || !userId) return;

    try {
      const userRegistration = registrations.find(reg => Number(reg.userId) === Number(userId));
      if (!userRegistration) {
        throw new Error('未找到报名记录');
      }

      await cancelRegistration(userRegistration.id);
      toast({
        title: '取消成功',
        description: '您已成功取消报名',
        variant: 'default',
      });
    } catch (error) {
      console.error('取消报名失败:', error);
      toast({
        title: '取消报名失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 获取报名按钮状态
  const getRegistrationButton = () => {
    if (!userId) {
      return (
        <Button
          onClick={handleRegistration}
          disabled
          variant='default'
        >
          请先登录
        </Button>
      );
    }

    if (userRegistration) {
      return (
        <div className='flex items-center gap-2'>
          {getRegistrationStatusBadge(userRegistration.status)}
          {userRegistration.status !== 2 && ( // 如果不是已取消状态
            <Button
              onClick={handleCancelRegistration}
              disabled={isCancelling}
              variant='destructive'
            >
              {isCancelling ? '取消中...' : '取消报名'}
            </Button>
          )}
        </div>
      );
    }

    const isFull = activity && activity.currentParticipants >= activity.capacity;
    if (isFull) {
      return (
        <Button disabled
          variant='default'>
          名额已满
        </Button>
      );
    }

    return (
      <Button
        onClick={handleRegistration}
        disabled={isRegistering}
        variant='default'
      >
        {isRegistering ? '报名中...' : '立即报名'}
      </Button>
    );
  };

  if (isLoadingActivity || isLoadingRegistrations || isLoadingUsers) {
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
            {getActivityStatus(activity) === 'upcoming' && getRegistrationButton()}
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
                  <p>
                    👥 报名情况：{activity.currentParticipants}/
                    {activity.capacity}
                  </p>
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
              {isLoadingRegistrations || isLoadingUsers ? (
                <p className='text-muted-foreground'>加载中...</p>
              ) : registrationsWithUser.length > 0 ? (
                <div className='space-y-4'>
                  {registrationsWithUser.map((registration) => (
                    <div
                      key={registration.id}
                      className='flex items-center justify-between p-4 rounded-lg border'
                    >
                      <div className='space-y-1'>
                        <div className='font-medium'>
                          {registration.user.name}
                        </div>
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
