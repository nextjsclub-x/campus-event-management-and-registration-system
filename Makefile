.PHONY: help install lint test build clean dev switch-orm

# 默认目标，显示帮助信息
help:
	@echo "Available commands:"
	@echo "  make install    - Install project dependencies using pnpm"
	@echo "  make lint       - Run ESLint to check code"
	@echo "  make test       - Run tests"
	@echo "  make build      - Build the project"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make dev        - Start development server"
	@echo "  make switch-orm - Switch between Prisma and Drizzle ORM"

# 安装依赖
install:
	pnpm install

# 运行 lint
lint:
	pnpm lint

# 运行测试
test:
	pnpm test

# 构建项目
build:
	pnpm build

# 清理构建产物
clean:
	rm -rf .next
	rm -rf node_modules/.cache

# 启动开发服务器
dev:
	pnpm dev

# 切换 ORM
switch-orm:
	@chmod +x ./scripts/switch-orm.sh
	@./scripts/switch-orm.sh

# 组合命令：运行 lint、test 和 build
all: lint test build
