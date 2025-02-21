import Header from '@/components/header';

import { signout } from '@/models/user';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='w-full flex flex-col justify-start items-center'>
      <Header />
      {children}
    </div>
  );
}


