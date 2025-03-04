import { login } from '@/models/user/login';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { LoginClient } from './client';

async function handleLogin(data: { email: string; password: string }) {
	'use server';

	const { token } = await login(data.email, data.password);

	// 计算365天后的时间
	const expires = new Date();
	expires.setDate(expires.getDate() + 365);

	// 设置 cookie
	cookies().set('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		expires, // cookie有效期为365天
	});

	// 重新验证首页数据
	revalidatePath('/');

	// 重定向到首页
	redirect('/');
}

export default function LoginPage() {
	return <LoginClient onSubmit={handleLogin} />;
}
