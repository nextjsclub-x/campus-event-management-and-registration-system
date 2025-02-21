'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user';
import { useSignOut } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { token, role, isAuthenticated } = useUserStore();
  const signOut = useSignOut();
  const router = useRouter();

  const handleSignout = () => {
    signOut.mutate();
  };

  return (
    <div className='w-full bg-orange-100 border-b'>
      <div className='mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-8'>
          <Link
            href='/'
            className='text-xl font-bold hover:text-orange-500 transition-colors'
          >
            校园活动通知管理系统
          </Link>
          <Link href='/announcements'>
            <Button variant='ghost'>社区公告</Button>
          </Link>
          <Link href='/comments'>
            <Button variant='ghost'>社区留言</Button>
          </Link>
          <div className='relative group'>
            <Button variant='ghost'>活动通知</Button>
            <div className='absolute hidden group-hover:block top-full mt-2 w-64 p-4 bg-white rounded-md shadow-lg border'>
              <h4 className='font-medium mb-2'>即将开始的活动</h4>
              <div className='space-y-2'>
                <div className='text-sm p-2 hover:bg-gray-50 rounded'>
                  <div className='font-medium'>暂无</div>

                </div>

              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {isAuthenticated ? (
            <div className='flex items-center space-x-4'>
              {role === 'admin' && (
                <Link href='/admin'>
                  <Button variant='ghost'>管理后台</Button>
                </Link>
              )}
              <Link href='/profile'>
                <Button variant='ghost'>个人信息</Button>
              </Link>
              {/* <Link href='/my-activities'>
                <Button variant='ghost'>我的活动</Button>
              </Link> */}
              <Button
                variant='ghost'
                onClick={handleSignout}
                disabled={signOut.isPending}
              >
                {signOut.isPending ? '退出中...' : '退出登录'}
              </Button>
            </div>
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
    </div>
  );
}

export default Header;
