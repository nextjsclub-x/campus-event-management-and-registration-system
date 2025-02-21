'use server';

import { cookies } from 'next/headers';

/**
 * 用户登出
 * 清除登录 cookie
 */
export async function signout() {
  const cookieStore = cookies();
  cookieStore.delete('token');
} 
