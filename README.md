# Shopping System - Monorepo

这是一个使用Bun构建的购物系统monorepo项目，包含前端(React + Vite)和后端(Elysia)应用。

## 项目结构

```
shopping-system/
├── frontend/         # React前端应用
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── package.json  # 前端依赖
├── backend/          # Elysia后端API
│   ├── src/          # 源代码
│   └── package.json  # 后端依赖
├── package.json      # 根工作区配置
└── tsconfig.json     # TypeScript配置
```

## 快速开始

### 安装依赖
```bash
bun install
```

### 开发模式
同时启动前端和后端开发服务器：
```bash
bun run dev
```

或者分别启动：
```bash
# 启动后端 (端口 3000)
cd backend && bun run dev

# 启动前端 (端口 5173)
cd frontend && bun run dev
```

## 技术栈

- **运行时**: Bun
- **前端**: React 18 + Vite + TypeScript
- **后端**: Elysia + TypeScript
- **包管理**: Bun Workspaces

## API测试端点

- `GET /` - 基础响应
- `GET /api/users` - 获取用户列表
- `GET /api/products` - 获取商品列表

前端运行在 http://localhost:5173
后端运行在 http://localhost:3000

## 数据库

本项目使用Prisma ORM管理数据库。主要表结构：

### sys_user (用户表)
- `id` - 用户ID (主键)
- `username` - 用户名
- `email` - 邮箱
- `created_at` - 创建时间
- `updated_at` - 更新时间

### product (商品表)
- `product_id` - 商品ID (主键)
- `category_id` - 分类ID
- `product_name` - 商品名称
- `product_img` - 商品图片URL
- `price` - 价格
- `stock` - 库存数量
- `description` - 商品描述
- `status` - 状态 (0:下架, 1:上架)
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 数据库初始化
```bash
# 需要手动分步执行

# 生成Prisma客户端
cd backend && bunx prisma generate

# 迁移数据库 
bunx prisma migrate dev --name init

# 运行种子数据
bun run src/db/seed.ts
```

## 开发说明

### Prisma生成文件
`backend/src/generated/` 目录中的文件是Prisma自动生成的，不应提交到版本控制。这些文件会在运行 `bunx prisma generate` 时重新生成。

