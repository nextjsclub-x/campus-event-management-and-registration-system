'use client';

import { useEffect, useState } from 'react';
import { get } from '@/utils/request/request';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    activity?: {
        id: number;
        title: string;
    };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await get('/api/notifications');
            if (response.code === 200) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('获取通知失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await get(`/api/notifications/${id}/read`);
            // 更新本地状态
            setNotifications(notifications.map(notification =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            ));
        } catch (error) {
            console.error('标记已读失败:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) {
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
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border ${notification.isRead ? 'bg-muted' : 'bg-white'
                                }`}
                        >
                            <div className='flex justify-between items-start'>
                                <div className='flex-1'>
                                    <p className='text-sm text-muted-foreground mb-1'>
                                        {formatDate(notification.createdAt)}
                                    </p>
                                    <p className='mb-2'>{notification.message}</p>
                                    {notification.activity && (
                                        <p className='text-sm text-muted-foreground'>
                                            相关活动：{notification.activity.title}
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
