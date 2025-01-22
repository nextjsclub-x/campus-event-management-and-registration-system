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
- 所有数据库操作必须通过 Model 层方法进行，如 `getCategories()` 来自 `@/models/category.model`

分类管理模块的6个API接口设计：
- [✓] 获取分类列表
- [✓] 创建分类
- [✓] 更新分类
- [✓] 获取分类下的活动
- [✓] 设置活动分类
- [✓] 获取分类统计

活动管理模块的8个API接口设计：
- [ ] 获取活动详情
- [ ] 创建活动
- [ ] 更新活动
- [ ] 删除活动
- [ ] 获取活动列表
- [ ] 更新活动状态
- [ ] 发布活动
- [ ] 取消发布活动
