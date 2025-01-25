'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <Link href='/admin'>
                <Button variant='ghost'>
                  管理后台
                </Button>
              </Link>
            </div>
            <Link href='/'>
              <Button variant='outline'>
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className='container mx-auto px-4 py-8'>
        {children}
      </main>
    </div>
  );
} 
