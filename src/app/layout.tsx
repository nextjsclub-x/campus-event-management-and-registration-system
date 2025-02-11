
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/common/nav-bar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body className='flex flex-col justify-start items-center'>
        <div  className='w-full max-w-7xl mx-auto'>
          <NavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
