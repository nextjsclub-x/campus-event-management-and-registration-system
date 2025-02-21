import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserById } from '@/models/user/get-user-by-id';
import { type APIResponse, APIStatusCode } from '@/types/api-response.types';
import type { UserInfo } from '@/types/user.type';
import type { UserRole } from '@/schema/user.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = Number(params.id);
    
    if (Number.isNaN(userId)) {
      const response: APIResponse = {
        code: APIStatusCode.BAD_REQUEST,
        message: '无效的用户ID',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    const user = await getUserById(userId);
    
    if (!user) {
      const response: APIResponse = {
        code: APIStatusCode.NOT_FOUND,
        message: '未找到用户信息',
        data: null
      };
      return NextResponse.json(response, { status: response.code });
    }

    const response: APIResponse<UserInfo> = {
      code: APIStatusCode.SUCCESS,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
    
    return NextResponse.json(response, { status: response.code });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    const response: APIResponse = {
      code: APIStatusCode.INTERNAL_ERROR,
      message: '服务器错误',
      data: null
    };
    return NextResponse.json(response, { status: response.code });
  }
} 
