
import type { Metadata } from 'next';
import { NavBar } from '@/components/common/nav-bar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <div className='w-full flex flex-col justify-start items-center'>
      {/* <div  className='w-full'> */}
      <NavBar />
      {children}
      {/* </div> */}
    </div>
  );
}


