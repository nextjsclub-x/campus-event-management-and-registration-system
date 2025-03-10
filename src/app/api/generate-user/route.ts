import { type NextRequest, NextResponse } from 'next/server';
import { register } from '@/models/user/register';
import type { UserRegisterRequest } from '@/types/user.type';

// 生成随机字符串
function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 生成随机邮箱
function generateRandomEmail(name: string): string {
  const domains = ['example.com', 'test.org', 'mock.net', 'sample.edu', 'demo.io'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${name}@${randomDomain}`;
}

// 生成随机用户信息
function generateMockUser(): UserRegisterRequest {
  const randomSuffix = generateRandomString(6);
  const name = `test_user_${randomSuffix}`;
  
  return {
    name,
    password: 'Test123456', // 统一密码
    email: generateRandomEmail(name),
    // studentId字段是可选的，这里随机决定是否添加
    ...(Math.random() > 0.5 ? { studentId: `S${Math.floor(10000000 + Math.random() * 90000000)}` } : {})
  };
}

/**
 * GET处理函数 - 生成并注册一个随机用户
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 获取查询参数中的数量，默认为1
    const {searchParams} = request.nextUrl;
    const countParam = searchParams.get('count');
    const count = countParam ? Number.parseInt(countParam, 10) : 1;
    
    // 限制单次请求的最大生成数量为50
    const actualCount = Math.min(count, 50);
    
    const results = {
      success: 0,
      failed: 0,
      users: [] as Array<{ name: string; email: string; studentId?: string }>,
      errors: [] as Array<{ error: string }>
    };

    // 生成并注册指定数量的用户
    for (let i = 0; i < actualCount; i += 1) {
      try {
        const mockUser = generateMockUser();
        const newUser = await register(mockUser);
        
        results.success += 1;
        results.users.push({
          name: newUser.name,
          email: newUser.email,
          ...(newUser.studentId ? { studentId: newUser.studentId } : {})
        });
      } catch (error) {
        results.failed += 1;
        results.errors.push({ 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    // 返回结果
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('生成用户时出错:', error);
    return NextResponse.json(
      { 
        error: '生成用户时出错', 
        message: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 
