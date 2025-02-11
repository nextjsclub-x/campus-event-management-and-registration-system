'use client';

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
import { post } from '@/utils/request/request';
import { Bell, MessageSquare } from 'lucide-react';

export function NavBar() {
  const router = useRouter();
  const { token, role, username } = useUserStore();

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
