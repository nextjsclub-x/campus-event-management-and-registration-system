import { NextRequest, NextResponse } from 'next/server';
import { APIStatusCode } from '@/schema/api-response.schema';
import { getUsersWithActivityStats } from '@/models/user.model';

export async function GET(req: NextRequest) {
  try {
    const users = await getUsersWithActivityStats();
    
    return NextResponse.json({
      code: APIStatusCode.OK,
      message: '获取成功',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({
      code: APIStatusCode.INTERNAL_SERVER_ERROR,
      message: '获取用户列表失败',
      data: null
    });
  }
} 
