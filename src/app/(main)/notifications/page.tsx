'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useNotificationList, useMarkNotificationAsRead } from '@/hooks/use-notification';
import type { Notification } from '@/schema/notification.schema';

export default function NotificationsPage() {
  const { data: response, isLoading } = useNotificationList();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const notifications = response?.data?.items || [];

  if (isLoading) {
    return <div className='flex justify-center items-center min-h-[400px]'>加载中...</div>;
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6 flex items-center'>
        <Bell className='w-6 h-6 mr-2' />
        通知中心
      </h1>

      <div className='space-y-4'>
        {notifications.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            暂无通知
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.isRead ? 'bg-muted' : 'bg-white'}`}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground mb-1'>
                    {formatDate(notification.createdAt)}
                  </p>
                  <p className='mb-2'>{notification.message}</p>
                  {notification.activityId && (
                    <p className='text-sm text-muted-foreground'>
                      相关活动ID：{notification.activityId}
                    </p>
                  )}
                </div>
                {!notification.isRead && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => markAsRead(notification.id)}
                  >
                    标记已读
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
