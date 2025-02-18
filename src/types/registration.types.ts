import {RegistrationStatus} from '@/constants/enums'
// 注册查询选项接口
export interface GetRegistrationsOptions {
  status?: typeof RegistrationStatus[keyof typeof RegistrationStatus];
  page?: number;
  pageSize?: number;
} 
