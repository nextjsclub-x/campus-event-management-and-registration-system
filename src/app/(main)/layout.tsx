import { Header } from '@/components/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function handleLogout() {
	'use server';

	// 删除 cookie
	cookies().delete('token');

	// 重新验证所有页面
	revalidatePath('/');

	// 重定向到首页
	redirect('/');
}

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
