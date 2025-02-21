import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/client-provider';

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
      <body className='flex flex-col justify-start items-center w-full'>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
