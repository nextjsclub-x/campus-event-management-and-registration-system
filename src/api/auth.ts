import { post } from '@/utils/request';
import type { UserInfo, UserRegisterRequest, UserPayload } from '@/types/user.type';

/**
 * 用户注册
 * @param data 注册信息
 */
export const signUp = (data: UserRegisterRequest) => post<UserInfo>('/api/sign-up', data);

/**
 * 用户登录
 * @param data 登录信息
 */
export const signIn = (data: { email: string; password: string }) => 
  post<{ token: string; user: UserPayload }>('/api/sign-in', data);

/**
 * 使用示例：
 * const response = await signUp({
 *   email: 'test@example.com',
 *   password: '123456',
 *   name: '张三',
 *   studentId: '12345'
 * });
 * 
 * if (response.code === 200) {
 *   console.log('注册成功', response.data);
 * }
 * 
 * // 登录示例：
 * const loginResponse = await signIn({
 *   email: 'test@example.com',
 *   password: '123456'
 * });
 * 
 * if (loginResponse.code === 200) {
 *   console.log('登录成功', loginResponse.data);
 *   // token 和用户信息在 loginResponse.data 中
 *   const { token, user } = loginResponse.data;
 * }
 */
