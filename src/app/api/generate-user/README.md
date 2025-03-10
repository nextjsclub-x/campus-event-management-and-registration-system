# 批量生成测试用户 API

此API提供了一种通过HTTP请求快速生成测试用户的方法，无需运行命令行脚本。

## API 说明

- **URL**: `/api/generate-user`
- **方法**: `GET`
- **描述**: 生成并注册随机测试用户

## 参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| count  | 数字 | 否   | 1      | 要生成的用户数量（最大50） |

## 响应示例

```json
{
  "success": 2,
  "failed": 1,
  "users": [
    {
      "name": "test_user_abc123",
      "email": "test_user_abc123@example.com",
      "studentId": "S12345678"
    },
    {
      "name": "test_user_def456",
      "email": "test_user_def456@test.org"
    }
  ],
  "errors": [
    {
      "error": "该邮箱已被注册"
    }
  ]
}
```

## 使用方法

### 浏览器访问

直接在浏览器中访问以下URL即可生成用户：

```
http://localhost:3020/api/generate-user
```

若要一次性生成多个用户，可以使用 `count` 参数：

```
http://localhost:3020/api/generate-user?count=10
```

### 使用 curl 命令

```bash
# 生成1个用户
curl http://localhost:3020/api/generate-user

# 生成10个用户
curl http://localhost:3020/api/generate-user?count=10
```

### 使用 Postman 或其他 API 工具

1. 新建一个 GET 请求
2. 输入URL: `http://localhost:3020/api/generate-user`
3. 可选：添加查询参数 `count` 设置要生成的用户数量
4. 发送请求

## 用户生成规则

- 用户名格式: `test_user_` + 随机字符串
- 密码: 统一为 `Test123456`
- 邮箱: 随机生成，格式为 `用户名@随机域名`
- 学号: 随机决定是否生成，格式为 `S` + 8位随机数字

## 注意事项

1. 此API仅用于测试环境，不应在生产环境中启用
2. 单次请求最多生成50个用户，以避免服务器负载过高
3. 如果邮箱已被注册，该用户将注册失败 
