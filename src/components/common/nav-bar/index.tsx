'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUserStore } from '@/store/user';
import { ModeToggle } from '@/components/common/darkmode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { get, post } from '@/utils/request/request';
import { Bell, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NavBar() {
  const router = useRouter();
  const { token, role, username } = useUserStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取未读通知
  const fetchNotifications = async () => {
    if (!token) return;

    try {
      const response = await get('/api/notifications?isRead=false&page=1&pageSize=999');
      if (response.code === 200) {
        setUnreadCount(response.data.total);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    }
  };

  // 设置轮询
  useEffect(() => {
    if (!token) return undefined;

    // 首次加载立即获取
    fetchNotifications();

    // 设置 10 秒轮询
    const interval = setInterval(fetchNotifications, 10000);

    // 清理函数
    return () => {
      clearInterval(interval);
      return undefined;
    };
  }, [token]);

  const handleLogout = async () => {
    try {
      await post('/api/sign-out');
      useUserStore.getState().clearUserInfo();
      router.push('/');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <header className='border-b w-full bg-orange-100'>
      <div className='mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-8'>
          <Link href='/'
            className='hover:opacity-80'>
            <h1 className='text-2xl font-bold'>校园活动管理系统</h1>
          </Link>
          <nav className='flex items-center space-x-6'>
            <Link
              href='/notifications'
              className='flex items-center text-muted-foreground hover:text-primary transition-colors relative'
            >
              <Bell className='w-4 h-4 mr-1' />
              通知中心
              {unreadCount > 0 && (
                <Badge
                  variant='destructive'
                  className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0'
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
            <Link
              href='/announcements'
              className='flex items-center text-muted-foreground hover:text-primary transition-colors'
            >
              <Bell className='w-4 h-4 mr-1' />
              站内公告
            </Link>
            <Link
              href='/comments'
              className='flex items-center text-muted-foreground hover:text-primary transition-colors'
            >
              <MessageSquare className='w-4 h-4 mr-1' />
              社区留言
            </Link>
          </nav>
        </div>

        <div className='flex items-center space-x-4'>
          <ModeToggle />
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                  {username || '个人中心'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {role === 'admin' && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>管理后台</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/profile')}>个人信息</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/my-activities')}>我的活动</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>退出登录</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='space-x-4'>
              <Link href='/login'>
                <Button variant='ghost'>登录</Button>
              </Link>
              <Link href='/register'>
                <Button>注册</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
