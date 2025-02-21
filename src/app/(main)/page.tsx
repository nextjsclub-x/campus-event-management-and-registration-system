'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel } from '@/components/Carousel';
import { ActivityTable } from './ActivityTable';

export default function HomePage() {
  return (
    <main className='flex-1 w-full mx-auto px-4 py-8'>
      <div className='space-y-6'>
        <div className='mb-8'>
          <Carousel />
        </div>

        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <h1 className='text-2xl font-bold'>全部活动</h1>
          <Link href='/activities/create'>
            <Button>创建活动</Button>
          </Link>
        </div>

        <ActivityTable />
      </div>
    </main>
  );
}
