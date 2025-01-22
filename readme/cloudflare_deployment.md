# Cloudflare 部署注意事项

本文档说明在 Cloudflare Workers 或 Cloudflare Pages 上部署 Next.js 应用时的重要注意事项。

## Node.js 兼容性

Cloudflare Workers 和 Pages 使用的是 V8 引擎，而不是完整的 Node.js 环境。这意味着某些 Node.js API 可能不可用或行为不同。

### 注意事项

1. 避免使用 Node.js 特定的模块，如 `fs`、`path` 等。
2. 使用 Web API 替代 Node.js API，例如使用 `fetch` 而不是 `http` 模块。
3. 某些全局对象（如 `process`）可能不存在或行为不同。

## 使用 Edge Runtime

为了在 Cloudflare 环境中正确运行，我们需要使用 Edge Runtime。这通过在页面或布局文件中添加以下导出来实现：

```typescript
export const runtime = 'edge';
```

## 部署命令

如果您使用 pnpm 进行部署，请使用以下命令：

```bash
pnpm dlx @cloudflare/next-on-pages
```

这个命令会使用 Cloudflare 的 next-on-pages 工具来部署你的 Next.js 应用。
```
