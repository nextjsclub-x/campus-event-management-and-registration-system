import { RegistrationStatus } from '@/schema/registration.schema';

export { RegistrationStatus };

// 注册查询选项接口
export interface GetRegistrationsOptions {
  status?: typeof RegistrationStatus[keyof typeof RegistrationStatus];
  page?: number;
  pageSize?: number;
} 
