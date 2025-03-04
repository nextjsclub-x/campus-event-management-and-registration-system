/* eslint-disable no-nested-ternary */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
	ActivityStatus,
	ActivityStatusTransitions,
	type ActivityStatusType,
	type Activity,
} from '@/types/activity.types';
import type { User } from '@/schema/user.schema';
import type { ActivityRegistrationItem } from '@/types/registration.types';
import { RegistrationStatus } from '@/types/registration.types';

interface ActivityClientProps {
	activity: Activity & { currentRegistrations: number };
	activityId: number;
	organizer: User;
	registrations: ActivityRegistrationItem[];
	currentUserId: number | null;
	currentUser: User | null;
	permissionInfo: {
		hasPermission: boolean;
		reason: string;
	} | null;
	onRegister: (activityId: number) => Promise<void>;
	onCancel: (activityId: number) => Promise<void>;
	onApprove: (registrationId: number, activityId: number) => Promise<void>;
	onReject: (registrationId: number, activityId: number) => Promise<void>;
	onGetUser: (userId: number) => Promise<User>;
}

export function ActivityClient({
	activity,
	activityId,
	organizer,
	registrations,
	currentUserId,
	currentUser,
	permissionInfo,
	onRegister,
	onCancel,
	onApprove,
	onReject,
	onGetUser,
}: ActivityClientProps) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [users, setUsers] = useState<Record<number, User>>({});
	const currentUserRegistration = currentUserId
		? registrations.find((r) => r.userId === currentUserId)
		: null;

	const displayStatus = ActivityStatusTransitions.getDisplayStatus(
		activity.status as ActivityStatusType,
	);

	useEffect(() => {
		const fetchUsers = async () => {
			const userIds = registrations.map((r) => r.userId);
			const uniqueUserIds = Array.from(new Set(userIds));
			const userMap: Record<number, User> = {};

			for (const userId of uniqueUserIds) {
				try {
					const user = await onGetUser(userId);
					userMap[userId] = user;
				} catch (error) {
					console.error(`Failed to fetch user ${userId}:`, error);
				}
			}

			setUsers(userMap);
		};

		if (registrations.length > 0) {
			fetchUsers();
		}
	}, [registrations, onGetUser]);

	const formatDate = (date: Date | string) =>
		new Date(date).toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});

	const handleRegistration = async () => {
		if (!currentUserId) {
			toast.error('请先登录');
			return;
		}

		setIsPending(true);
		try {
			await onRegister(activityId);
			toast.success('报名成功，请等待审核');
		} catch (error) {
			toast.error('报名失败', {
				description: error instanceof Error ? error.message : '请稍后重试',
			});
		} finally {
			setIsPending(false);
		}
	};

	const handleCancelRegistration = async () => {
		if (!currentUserRegistration || !currentUserId) return;

		setIsPending(true);
		try {
			await onCancel(activityId);
			toast.success('取消报名成功');
		} catch (error) {
			toast.error('取消报名失败', {
				description: error instanceof Error ? error.message : '请稍后重试',
			});
		} finally {
			setIsPending(false);
		}
	};

	const handleApproveRegistration = async (registrationId: number) => {
		try {
			await onApprove(registrationId, activityId);
			toast.success('已通过报名申请');
		} catch (error) {
			toast.error('操作失败', {
				description: error instanceof Error ? error.message : '请稍后重试',
			});
		}
	};

	const handleRejectRegistration = async (registrationId: number) => {
		try {
			await onReject(registrationId, activityId);
			toast.success('已拒绝报名申请');
		} catch (error) {
			toast.error('操作失败', {
				description: error instanceof Error ? error.message : '请稍后重试',
			});
		}
	};

	return (
  <div className='container mx-auto py-8'>
    <div className='mb-6'>
      <Button
        variant='outline'
        onClick={() => router.push('/')}
        className='flex items-center gap-2'
				>
        ← 返回活动列表
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle className='text-2xl'>{activity.title}</CardTitle>
            <div className='mt-2'>
              <Badge variant={displayStatus.variant}>
                {displayStatus.status}
              </Badge>
            </div>
          </div>
          <div className='space-x-4'>
            {currentUserRegistration ? (
              <Button
                variant='outline'
                onClick={handleCancelRegistration}
                disabled={isPending}
								>
                {isPending ? '取消中...' : '取消报名'}
              </Button>
							) : (
  <Button
    onClick={handleRegistration}
    disabled={
										isPending ||
										activity.currentRegistrations >= activity.capacity ||
										activity.status !== ActivityStatus.PUBLISHED
									}
								>
    {isPending
										? '报名中...'
										: activity.currentRegistrations >= activity.capacity
											? '名额已满'
											: '立即报名'}
  </Button>
							)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          <div>
            <h3 className='font-medium mb-2'>活动详情</h3>
            <p className='whitespace-pre-wrap text-muted-foreground'>
              {activity.description}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h3 className='font-medium mb-2'>活动时间</h3>
              <p className='text-muted-foreground'>
                {formatDate(activity.startTime)} -{' '}
                {formatDate(activity.endTime)}
              </p>
            </div>
            <div>
              <h3 className='font-medium mb-2'>活动地点</h3>
              <p className='text-muted-foreground'>{activity.location}</p>
            </div>
            <div>
              <h3 className='font-medium mb-2'>报名人数</h3>
              <p className='text-muted-foreground'>
                {activity.currentRegistrations}/{activity.capacity}
              </p>
            </div>
            <div>
              <h3 className='font-medium mb-2'>组织者</h3>
              <p className='text-muted-foreground'>{organizer.name}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='font-medium mb-4'>报名记录</h3>
            <div className='mb-4 p-3 bg-muted rounded-md'>
              <p className='text-sm text-muted-foreground'>
                {permissionInfo?.hasPermission
										? permissionInfo.reason
										: currentUser
											? '您没有权限审核报名申请'
											: '登录后才能查看权限信息'}
              </p>
              {currentUser && (
              <p className='text-xs text-muted-foreground mt-1'>
                当前身份：
                {currentUser.role === 'admin'
											? '管理员'
											: currentUser.role === 'teacher'
												? '教师'
												: activity.organizerId === currentUser.id
													? '活动组织者'
													: '普通用户'}
              </p>
								)}
            </div>
            {registrations.length === 0 ? (
              <p className='text-center py-8 text-muted-foreground'>
                暂无报名记录
              </p>
							) : (
  <div className='space-y-4'>
    {registrations.map((registration) => {
										const user = users[registration.userId];
										return (
  <div
    key={registration.id}
    className='flex items-center justify-between p-4 rounded-lg border'
											>
    <div>
      <p className='font-medium'>
        {user?.name || '加载中...'}
      </p>
      <p className='text-sm text-muted-foreground'>
        报名时间：{formatDate(registration.registeredAt)}
      </p>
    </div>
    <div className='flex items-center gap-4'>
      <Badge
        variant={
															registration.status === RegistrationStatus.PENDING
																? 'outline'
																: registration.status ===
																		RegistrationStatus.APPROVED
																	? 'default'
																	: 'destructive'
														}
													>
        {registration.status === RegistrationStatus.PENDING
															? '待审核'
															: registration.status ===
																	RegistrationStatus.APPROVED
																? '已通过'
																: '已拒绝'}
      </Badge>
      {permissionInfo?.hasPermission &&
														registration.status ===
															RegistrationStatus.PENDING && (
															<div className='flex gap-2'>
  <Button
    size='sm'
    onClick={() =>
																		handleApproveRegistration(registration.id)
																	}
																>
    通过
  </Button>
  <Button
    size='sm'
    variant='destructive'
    onClick={() =>
																		handleRejectRegistration(registration.id)
																	}
																>
    拒绝
  </Button>
															</div>
														)}
    </div>
  </div>
										);
									})}
  </div>
							)}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
	);
}
