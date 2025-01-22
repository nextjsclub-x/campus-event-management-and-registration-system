import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as UserModel from '@/models/userl.model';

export async function middleware(request: NextRequest) {
  // 1. 不需要验证的路由
  if (request.nextUrl.pathname === '/api/user' && request.method === 'POST') {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === '/api/user/login') {
    return NextResponse.next();
  }

  // 2. 获取并验证token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json(
      { error: '未登录' },
      { status: 401 }
    );
  }

  try {
    // 3. 验证token
    const decoded = UserModel.validateToken(token) as any;
    const { userId, role } = decoded;

    // 4. 检查权限
    // 管理员接口
    if (request.nextUrl.pathname.includes('/admin')) {
      if (role !== 'admin') {
        return NextResponse.json(
          { error: '需要管理员权限' },
          { status: 403 }
        );
      }
    }

    // 获取用户列表
    if (request.nextUrl.pathname === '/api/user' && request.method === 'GET') {
      if (role !== 'admin') {
        return NextResponse.json(
          { error: '需要管理员权限' },
          { status: 403 }
        );
      }
    }

    // 用户操作自己的数据
    const pathMatch = request.nextUrl.pathname.match(/\/api\/user\/(\d+)/);
    if (pathMatch) {
      const targetUserId = parseInt(pathMatch[1], 10);
      if (targetUserId !== userId && role !== 'admin') {
        return NextResponse.json(
          { error: '无权操作其他用户数据' },
          { status: 403 }
        );
      }
    }

    // 5. 验证通过
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', userId.toString());
    requestHeaders.set('X-User-Role', role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '无效的token' },
      { status: 401 }
    );
  }
}

// 配置需要中间件处理的路由
export const config = {
  matcher: '/api/user/:path*'
};
