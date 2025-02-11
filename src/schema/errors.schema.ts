// 定义错误类型
export type ServiceErrorCode = 'EMAIL_EXISTS' | 'INVALID_INPUT' | 'SERVER_ERROR';

export type ServiceError = {
  message: string;
  code: ServiceErrorCode;
  status: number;
};

// 错误类
export class EmailExistsError extends Error {
  constructor() {
    super('该邮箱已被注册');
    this.name = 'EmailExistsError';
  }
}

// 创建错误的辅助函数
export const createServiceError = (
  message: string,
  code: ServiceErrorCode,
  status: number = 400
): ServiceError => ({
  message,
  code,
  status
}); 
