import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';

export async function POST(request: NextRequest) {
  // 创建响应
  const response = NextResponse.json({
    code: APIStatusCode.OK,
    message: '退出登录成功',
    data: null
  });

  // 通过设置过期时间为过去的时间来删除 cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // 立即过期
  });

  return response;
} 
