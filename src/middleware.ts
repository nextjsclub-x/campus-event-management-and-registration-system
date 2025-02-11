import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt/token-utils';
import { APIStatusCode } from '@/schema/api-response.schema';

// 定义公开路由白名单
const PUBLIC_ROUTES = [
  '/api/sign-up',
  '/api/sign-in',
  '/api/category',
  '/api/activity',          // 活动列表
  '/api/activity/[0-9]+',   // 活动详情（使用正则匹配数字ID）
] as const;

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  console.log('当前访问路径:', pathname);

  // 检查是否为公开路由
  if (PUBLIC_ROUTES.some(route => {
    if (route.includes('[0-9]+')) {
      // 对于包含正则的路由，使用正则匹配
      const regex = new RegExp(`^${  route.replace('[0-9]+', '\\d+')  }$`);
      return regex.test(pathname);
    }
    // 对于普通路由，使用完全匹配
    return route === pathname;
  })) {
    console.log('当前为公开路由，无需验证');
    return NextResponse.next();
  }

  // 获取token（优先从cookie获取，其次从Authorization header获取）
  let token = request.cookies.get('token')?.value;
  console.log('从cookie中获取的token:', token);

  if (!token) {
    token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('从Authorization header中获取的token:', token);
  }

  if (!token) {
    console.log('未找到token，用户未登录');
    return NextResponse.json({
      code: APIStatusCode.UNAUTHORIZED,
      message: '未登录',
      data: null
    });
  }

  try {
    // 验证token
    const decoded = await verifyToken(token);
    const { id, role } = decoded;
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('解析出的用户信息:', { userId, role });

    // 将用户信息添加到请求头
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', userId.toString());
    requestHeaders.set('X-User-Role', role as string);
    console.log('已将用户信息添加到请求头:', { 'X-User-Id': userId.toString(), 'X-User-Role': role });

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (error: any) {
    console.log('token验证失败:', error.message);
    return NextResponse.json({
      code: APIStatusCode.INVALID_TOKEN,
      message: '无效的token',
      data: null
    });
  }
}

// 配置需要中间件处理的路由
export const config = {
  matcher: [
    '/api/:path*'
  ]
};
