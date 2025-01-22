/* eslint-disable no-shadow */
export enum APIStatusCode {
  // 成功状态 (0-99)
  SUCCESS = 0, // 操作成功
  PARTIAL_SUCCESS = 1, // 部分操作成功

  // HTTP 标准状态码 (100-599)
  // 2xx 成功状态码
  OK = 200, // 请求成功
  CREATED = 201, // 创建成功
  ACCEPTED = 202, // 请求已接受，但处理尚未完成
  NO_CONTENT = 204, // 请求成功，但无返回内容

  // 3xx 重定向状态码
  MOVED_PERMANENTLY = 301, // 资源已永久移动到新位置
  FOUND = 302, // 资源临时移动到新位置
  NOT_MODIFIED = 304, // 资源未修改，可使用缓存

  // 4xx 客户端错误状态码
  BAD_REQUEST = 400, // 请求无效或不能被服务器理解
  UNAUTHORIZED = 401, // 未授权，需要身份验证
  FORBIDDEN = 403, // 禁止访问，权限不足
  NOT_FOUND = 404, // 请求的资源不存在
  METHOD_NOT_ALLOWED = 405, // 请求方法不允许
  CONFLICT = 409, // 请求冲突，如资源已存在
  PRECONDITION_FAILED = 412, // 预处理条件失败
  UNPROCESSABLE_ENTITY = 422, // 请求格式正确，但语义错误

  // 5xx 服务器错误状态码
  INTERNAL_SERVER_ERROR = 500, // 服务器内部错误
  NOT_IMPLEMENTED = 501, // 服务器不支持请求的功能
  BAD_GATEWAY = 502, // 网关错误
  SERVICE_UNAVAILABLE = 503, // 服务暂时不可用
  GATEWAY_TIMEOUT = 504, // 网关超时

  // 自定义错误码 (1000-1999)
  INVALID_INPUT = 1000, // 输入参数无效
  DATABASE_ERROR = 1001, // 数据库操作错误
  NETWORK_ERROR = 1002, // 网络通信错误
  THIRD_PARTY_SERVICE_ERROR = 1003, // 第三方服务错误
  RATE_LIMIT_EXCEEDED = 1004, // 超出请求频率限制
  RESOURCE_EXHAUSTED = 1005, // 资源耗尽（如存储空间不足）
  DATA_INTEGRITY_ERROR = 1006, // 数据完整性错误
  CONFIGURATION_ERROR = 1007, // 系统配置错误

  // 认证和授权错误 (2000-2099)
  TOKEN_EXPIRED = 2000, // 访问令牌已过期
  INVALID_TOKEN = 2001, // 无效的访问令牌
  INSUFFICIENT_PERMISSIONS = 2002, // 权限不足
  ACCOUNT_LOCKED = 2003, // 账户已锁定
  ACCOUNT_DISABLED = 2004, // 账户已禁用
  MULTI_FACTOR_REQUIRED = 2005, // 需要多因素认证

  // 业务逻辑错误 (3000-3999)
  PAYMENT_REQUIRED = 3000, // 需要付款
  SUBSCRIPTION_EXPIRED = 3001, // 订阅已过期
  QUOTA_EXCEEDED = 3002, // 超出配额限制
  RESOURCE_LOCKED = 3003, // 资源被锁定
  DUPLICATE_ENTRY = 3004, // 重复条目
  DEPENDENCY_FAILED = 3005, // 依赖项操作失败
  BUSINESS_RULE_VIOLATION = 3006, // 违反业务规则

  // 特殊业务状态 (4000-4999)
  ADMIN_REQUIRED = 4000, // 需要管理员权限
  PREMIUM_USER_REQUIRED = 4001, // 需要高级用户权限
  VERIFICATION_REQUIRED = 4002, // 需要验证
  MAINTENANCE_MODE = 4003, // 系统维护模式
  FEATURE_DISABLED = 4004, // 功能已禁用
  BETA_ACCESS_ONLY = 4005, // 仅限测试用户访问

  // 系统状态 (5000-5999)
  SYSTEM_OVERLOADED = 5000, // 系统过载
  SCHEDULED_DOWNTIME = 5001, // 计划停机维护
  DATA_MIGRATION_IN_PROGRESS = 5002, // 数据迁移进行中
  BACKUP_IN_PROGRESS = 5003, // 备份进行中
}

export interface APIJsonResponse<T = any> {
  code: APIStatusCode | number;
  message: string;
  data?: T;
}
