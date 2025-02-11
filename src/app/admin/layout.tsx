'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    title: '活动管理',
    children: [
      { title: '活动列表', path: '/admin/activities' },
      { title: '新增活动', path: '/admin/activities/create' },
      { title: '活动审核', path: '/admin/activities/review' },
    ]
  },
  {
    title: '分类管理',
    children: [
      { title: '分类列表', path: '/admin/categories' },
      { title: '新增分类', path: '/admin/categories/create' },
    ]
  },
  {
    title: '公告管理',
    children: [
      { title: '公告列表', path: '/admin/announcements' },
      { title: '新增公告', path: '/admin/announcements/create' },
    ]
  },
  {
    title: '留言管理',
    children: [
      { title: '留言列表', path: '/admin/comments' },
    ]
  },
  {
    title: '报名管理',
    children: [
      { title: '报名列表', path: '/admin/registrations' },
      { title: '报名审核', path: '/admin/registrations/review' },
    ]
  },
  {
    title: '用户管理',
    children: [
      { title: '用户列表', path: '/admin/users' },
      { title: '新增用户', path: '/admin/users/create' },
      { title: '用户统计', path: '/admin/users/stats' },
    ]
  },
  {
    title: '系统设置',
    children: [
      { title: '权限设置', path: '/admin/permissions' },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b' />
      <div className='flex'>
        <aside className='w-64 min-h-[calc(100vh-73px)] bg-zinc-900 text-zinc-400'>
          <nav className='p-4'>
            {menuItems.map((group) => (
              <div key={group.title}
                className='mb-8'>
                <div className='text-base font-medium text-zinc-100 mb-3 px-3 uppercase tracking-wider'>
                  {group.title}
                </div>
                <div className='space-y-2'>
                  {group.children.map((item) => (
                    <Link key={item.path}
                      href={item.path}>
                      <div className={`px-3 py-2 text-base rounded-md transition-colors hover:bg-zinc-800 hover:text-zinc-200 ${
                        pathname === item.path ? 'bg-zinc-800 text-zinc-200' : ''
                      }`}>
                        {item.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>
        <main className='flex-1 pt-4 px-4'>
          {children}
        </main>
      </div>
    </div>
  );
} 
