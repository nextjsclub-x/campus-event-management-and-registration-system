# API Draft

## 通用说明

### 系统分层架构
- **路由层 (Route)**: 位于 `src/app/api` 目录，负责处理 HTTP 请求和响应
  - 只负责请求参数验证、调用 Model 层方法、封装响应数据
  - 严禁在路由层直接进行数据库操作
  - 所有数据库操作必须通过 Model 层进行

- **模型层 (Model)**: 位于 `src/models` 目录，负责所有数据库操作
  - 封装所有数据库操作逻辑
  - 提供业务所需的数据处理方法
  - 是路由层访问数据的唯一途径

### 返回格式
```typescript
// 参考: src/schema/api-response.schema.ts
interface APIJsonResponse<T = any> {
  code: number;      // 状态码
  message: string;   // 提示信息
  data: T | null;    // 响应数据
}
```

### 实现参考
- 参考 `src/app/api/sign-in/route.ts` 和 `src/app/api/sign-up/route.ts` 的实现方式
- 使用 try-catch 处理错误
- 统一使用 APIJsonResponse 格式返回数据
- 所有数据库操作必须通过 Model 层方法进行
  - 分类管理相关操作使用 `@/models/category.model` 中的方法，如 `getCategories()`
  - 活动管理相关操作使用 `@/models/activity.model` 中的方法，如 `updateActivity()`

分类管理模块的6个API接口设计：
- [✓] 获取分类列表
- [✓] 创建分类
- [✓] 更新分类
- [✓] 获取分类下的活动
- [✓] 设置活动分类
- [✓] 获取分类统计

活动管理模块的8个API接口设计：
- [x] 获取活动详情
- [x] 创建活动
- [x] 更新活动
- [x] 删除活动
- [x] 获取活动列表
- [x] 更新活动状态
- [x] 发布活动
- [x] 取消发布活动

### 7. 发布活动

```typescript
POST /api/activities/{id}/publish
```

请求参数：
- `id`: 活动ID (路径参数)

响应数据：
```typescript
interface PublishedActivity {
  id: number;           // 活动ID
  status: number;       // 更新后的活动状态（已发布状态）
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 无效的活动ID
- 401: 未授权（需要登录）
- 403: 无权限（不是活动组织者）
- 404: 活动不存在
- 422: 非法的状态转换（只有草稿状态的活动可以发布）
- 500: 服务器内部错误

### 8. 取消发布活动

```typescript
POST /api/activities/{id}/unpublish
```

请求参数：
- `id`: 活动ID (路径参数)

响应数据：
```typescript
interface UnpublishedActivity {
  id: number;           // 活动ID
  status: number;       // 更新后的活动状态（已取消状态）
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 无效的活动ID
- 401: 未授权（需要登录）
- 403: 无权限（不是活动组织者）
- 404: 活动不存在
- 422: 非法的状态转换（只有已发布状态的活动可以取消发布）
- 500: 服务器内部错误

### 6. 更新活动状态

```typescript
PUT /api/activities/{id}/status
```

请求参数：
- `id`: 活动ID (路径参数)

```typescript
interface UpdateActivityStatusRequest {
  status: number;  // 新的活动状态
}
```

响应数据：
```typescript
interface UpdatedActivityStatus {
  id: number;           // 活动ID
  status: number;       // 更新后的活动状态
  updatedAt: Date;      // 更新时间
}
```

状态转换规则：
- 草稿(1) -> 已发布(2)、已删除(0)
- 已发布(2) -> 已取消(3)、已结束(4)
- 已取消(3) -> 已删除(0)
- 已结束(4) -> 已删除(0)
- 已删除(0) -> 不允许任何转换

错误响应：
- 400: 无效的活动ID或状态值
- 401: 未授权（需要登录）
- 403: 无权限（不是活动组织者）
- 404: 活动不存在
- 422: 非法的状态转换
- 500: 服务器内部错误

### 5. 获取活动列表

```typescript
GET /api/activities
```

请求参数：
```typescript
interface ListActivitiesQuery {
  status?: number;      // 活动状态（默认为已发布状态）
  categoryId?: number;  // 分类ID
  startTime?: Date;     // 开始时间范围
  endTime?: Date;       // 结束时间范围
  page?: number;        // 页码（默认为1）
  pageSize?: number;    // 每页数量（默认为20）
  orderBy?: 'startTime' | 'createdAt';  // 排序字段（默认为startTime）
  order?: 'asc' | 'desc';  // 排序方式（默认为desc）
}
```

响应数据：
```typescript
interface ListActivitiesResponse {
  activities: Activity[];  // 活动列表
  pagination: {
    current: number;     // 当前页码
    pageSize: number;    // 每页数量
    total: number;       // 总记录数
    totalPages: number;  // 总页数
  };
}
```

错误响应：
- 400: 无效的查询参数
- 500: 服务器内部错误

### 4. 删除活动

```typescript
DELETE /api/activities/{id}
```

请求参数：
- `id`: 活动ID (路径参数)

响应数据：
```typescript
interface DeletedActivity {
  id: number;           // 活动ID
  status: number;       // 活动状态（已更新为已删除状态）
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 无效的活动ID
- 401: 未授权（需要登录）
- 403: 无权限（不是活动组织者）
- 404: 活动不存在
- 500: 服务器内部错误

### 3. 更新活动

```typescript
PUT /api/activities/{id}
```

请求参数：
- `id`: 活动ID (路径参数)

```typescript
interface UpdateActivityRequest {
  title?: string;        // 活动标题
  description?: string;  // 活动描述
  categoryId?: number;   // 分类ID
  location?: string;     // 活动地点
  startTime?: Date;      // 开始时间
  endTime?: Date;        // 结束时间
  capacity?: number;     // 活动容量
}
```

响应数据：
```typescript
interface Activity {
  id: number;           // 活动ID
  title: string;        // 活动标题
  description: string;  // 活动描述
  categoryId: number;   // 分类ID
  location: string;     // 活动地点
  startTime: Date;      // 开始时间
  endTime: Date;        // 结束时间
  capacity: number;     // 活动容量
  status: number;       // 活动状态
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 无效的活动ID或请求参数
- 401: 未授权（需要登录）
- 403: 无权限（不是活动组织者）
- 404: 活动不存在
- 500: 服务器内部错误

### 2. 创建活动

```typescript
POST /api/activities
```

请求参数：
```typescript
interface CreateActivityRequest {
  title: string;        // 活动标题
  description: string;  // 活动描述
  categoryId: number;   // 分类ID
  location: string;     // 活动地点
  startTime: Date;      // 开始时间
  endTime: Date;        // 结束时间
  capacity: number;     // 活动容量
}
```

响应数据：
```typescript
interface Activity {
  id: number;           // 活动ID
  title: string;        // 活动标题
  description: string;  // 活动描述
  categoryId: number;   // 分类ID
  location: string;     // 活动地点
  startTime: Date;      // 开始时间
  endTime: Date;        // 结束时间
  capacity: number;     // 活动容量
  status: number;       // 活动状态（默认为草稿状态）
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 请求参数无效
- 401: 未授权（需要登录）
- 500: 服务器内部错误

## 活动管理模块API

### 1. 获取活动详情

```typescript
GET /api/activities/{id}
```

请求参数：
- `id`: 活动ID (路径参数)

响应数据：
```typescript
interface Activity {
  id: number;           // 活动ID
  title: string;        // 活动标题
  description: string;  // 活动描述
  categoryId: number;   // 分类ID
  location: string;     // 活动地点
  startTime: Date;      // 开始时间
  endTime: Date;        // 结束时间
  capacity: number;     // 活动容量
  status: number;       // 活动状态
  createdAt: Date;      // 创建时间
  updatedAt: Date;      // 更新时间
}
```

错误响应：
- 400: 无效的活动ID
- 404: 活动不存在
- 500: 服务器内部错误
