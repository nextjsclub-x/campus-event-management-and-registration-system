#!/bin/bash

# 错误处理函数
handle_error() {
    echo "错误: $1"
    exit 1
}

# 创建 Prisma 客户端文件
create_prisma_client() {
    cat > src/database/prisma.client.ts << 'EOL'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
EOL
}

# 创建 Drizzle 客户端文件
create_drizzle_client() {
    cat > src/database/drizzle.client.ts << 'EOL'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const client = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client)
EOL
}

# 确保目录存在
ensure_directory() {
    mkdir -p src/database || handle_error "无法创建 src/database 目录"
}

# 安全地移除包
safe_remove_package() {
    local package=$1
    if pnpm list | grep -q "$package"; then
        pnpm remove "$package" || handle_error "移除 $package 失败"
    fi
}

echo "选择要使用的 ORM:"
echo "1) Prisma"
echo "2) Drizzle"
read -p "请输入选项 (1 或 2): " choice

# 确保必要的目录存在
ensure_directory

case $choice in
    1)
        echo "切换到 Prisma..."
        
        # 安全地移除 Drizzle 相关依赖
        safe_remove_package "drizzle-orm"
        safe_remove_package "@libsql/client"
        safe_remove_package "drizzle-kit"
        
        # 安装 Prisma 相关依赖
        echo "安装 Prisma 依赖..."
        pnpm add @prisma/client || handle_error "安装 @prisma/client 失败"
        pnpm add -D prisma || handle_error "安装 prisma 失败"
        
        # 删除旧的数据库客户端文件
        rm -f src/database/drizzle.client.ts
        
        # 创建 Prisma 客户端文件
        create_prisma_client
        
        # 初始化 Prisma
        echo "初始化 Prisma..."
        npx prisma init || handle_error "Prisma 初始化失败"
        
        echo "已成功切换到 Prisma"
        echo "提示: 请确保配置 .env 文件中的 DATABASE_URL"
        ;;
    2)
        echo "切换到 Drizzle..."
        
        # 安全地移除 Prisma 相关依赖
        safe_remove_package "@prisma/client"
        safe_remove_package "prisma"
        
        # 安装 Drizzle 相关依赖
        echo "安装 Drizzle 依赖..."
        pnpm add drizzle-orm @libsql/client || handle_error "安装 Drizzle 依赖失败"
        pnpm add -D drizzle-kit || handle_error "安装 drizzle-kit 失败"
        
        # 删除旧的数据库客户端文件
        rm -f src/database/prisma.client.ts
        
        # 创建 Drizzle 客户端文件
        create_drizzle_client
        
        # 删除 Prisma 相关文件
        rm -rf prisma
        
        echo "已成功切换到 Drizzle"
        echo "提示: 请确保在 .env 文件中配置以下变量:"
        echo "  - DATABASE_URL"
        echo "  - DATABASE_AUTH_TOKEN"
        ;;
    *)
        handle_error "无效的选项"
        ;;
esac

# 最后的检查
echo "检查安装结果..."
if [ $choice -eq 1 ]; then
    if ! pnpm list | grep -q "@prisma/client"; then
        handle_error "Prisma 安装验证失败"
    fi
elif [ $choice -eq 2 ]; then
    if ! pnpm list | grep -q "drizzle-orm"; then
        handle_error "Drizzle 安装验证失败"
    fi
fi

echo "切换完成！"
