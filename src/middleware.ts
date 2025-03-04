import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt';

// 白名单路径，这些路径不需要登录验证
const PUBLIC_PATHS = ['/', '/login', '/register'];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const requestHeaders = new Headers(request.headers);
	const token = request.cookies.get('token')?.value;

	// 如果是白名单路径，直接放行
	if (PUBLIC_PATHS.includes(pathname)) {
		return NextResponse.next();
	}

	// 如果没有token
	if (!token) {
		requestHeaders.set('x-user-id', '');
		requestHeaders.set('x-user-role', 'student');

		// 重定向到登录页
		return NextResponse.redirect(new URL('/login', request.url));
	}

	try {
		const payload = await verifyToken(token);
		requestHeaders.set('x-user-id', payload.id.toString());
		requestHeaders.set('x-user-role', payload.role);

		// 如果访问管理员路由但不是管理员，重定向到首页
		if (pathname.startsWith('/admin') && payload.role !== 'admin') {
			return NextResponse.redirect(new URL('/', request.url));
		}

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	} catch (error) {
		// token无效时重定向到登录页
		return NextResponse.redirect(new URL('/login', request.url));
	}
}

// 修改 matcher，匹配除了静态资源外的所有路径
export const config = {
	matcher: [
		/*
		 * 匹配所有路径，但排除以下路径:
		 * - api (API 路由)
		 * - _next (Next.js 内部路由)
		 * - favicon.ico (浏览器图标)
		 * - 静态文件 (images, etc.)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
