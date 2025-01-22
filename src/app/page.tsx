import type { Metadata } from 'next';

import { siteInfo } from '@/constants/site-info';

import { ModeToggle } from '@/components/common/darkmode-toggle';

function delay(ms: number) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export const runtime = 'edge';

export const metadata: Metadata = {
  title: `Home | ${siteInfo.name}`,
  description: siteInfo.description,
};

const MainPage = async () => {
  await delay(3000);
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
        main page for nextjs scaffold
      </div>
      <ModeToggle />
    </main>
  );
};

export default MainPage;
