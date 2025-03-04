import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { verifyToken } from '@/utils/jwt';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUpcomingActivityReminders } from '@/service/notification';

async function handleLogout() {
  'use server';

  // 删除 cookie
  cookies().delete('token');

  // 重新验证所有页面
  revalidatePath('/');

  // 重定向到首页
  redirect('/');
}

// 添加类型定义
interface UpcomingActivity {
  activityId: number;
  title: string;
  startTime: Date;
  location: string;
  minutesToStart: number;
}

export async function Header() {
  // 从 cookie 获取 token
  const token = cookies().get('token')?.value;
  let user = null;
  // 指定具体类型
  let upcomingActivities: UpcomingActivity[] = [];

  // 验证 token 并获取用户信息
  if (token) {
    try {
      user = await verifyToken(token);
      // 如果用户已登录，获取即将开始的活动
      if (user) {
        // 确保 id 是 number 类型
        upcomingActivities = await getUpcomingActivityReminders(
          Number(user.id),
        );
      }
    } catch (error) {
      console.error('Token验证失败:', error);
    }
  }

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
            <Button variant='ghost'>
              活动通知
              {upcomingActivities.length > 0 && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full'>
                  {upcomingActivities.length}
                </span>
              )}
            </Button>
            <div className='absolute hidden group-hover:block top-full mt-2 w-64 p-4 bg-white rounded-md shadow-lg border'>
              <h4 className='font-medium mb-2'>即将开始的活动</h4>
              <div className='space-y-2'>
                {upcomingActivities.length === 0 ? (
                  <div className='text-sm p-2 text-gray-500'>
                    暂无即将开始的活动
                  </div>
                ) : (
                  upcomingActivities.map((activity) => (
                    <Link
                      key={activity.activityId}
                      href={`/activities/${activity.activityId}`}
                      className='block text-sm p-2 hover:bg-gray-50 rounded'
                    >
                      <div className='font-medium'>{activity.title}</div>
                      <div className='text-xs text-gray-500 mt-1'>
                        地点：{activity.location}
                      </div>
                      <div className='text-xs text-orange-500 mt-1'>
                        {Math.floor(activity.minutesToStart / 60)}小时
                        {Math.floor(activity.minutesToStart % 60)}分钟后开始
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          {user ? (
            <div className='flex items-center space-x-4'>
              {user.role === 'admin' && (
                <Link href='/admin'>
                  <Button variant='ghost'>管理后台</Button>
                </Link>
              )}
              <Link href='/profile'>
                <Button variant='ghost'>个人信息</Button>
              </Link>
              <Link href='/profile/activities'>
                <Button variant='ghost'>我的活动</Button>
              </Link>
              <Link href='/profile/registrations'>
                <Button variant='ghost'>我的报名</Button>
              </Link>
              <form action={handleLogout}>
                <Button type='submit'
                  variant='ghost'>
                  退出登录
                </Button>
              </form>
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

