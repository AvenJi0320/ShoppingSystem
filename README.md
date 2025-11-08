# Shopping System - Monorepo

这是一个使用Bun构建的购物系统monorepo项目，包含前端(React + Vite)和后端(Elysia)应用。

## 项目结构

```
shopping-system/
├── frontend/          # React前端应用
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── package.json  # 前端依赖
├── backend/           # Elysia后端API
│   ├── src/          # 源代码
│   └── package.json  # 后端依赖
├── package.json       # 根工作区配置
└── tsconfig.json      # TypeScript配置
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
- `GET /api/health` - 健康检查

前端运行在 http://localhost:5173
后端运行在 http://localhost:3000

