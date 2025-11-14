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

## 主要功能

### 用户系统
- 用户注册和登录
- 用户角色管理（普通用户/管理员）
- JWT身份验证

### 商品管理
- 商品展示和搜索
- 商品分类过滤
- 购物车功能
- 商品评论系统

### 订单管理
- 订单创建和查看
- 订单状态跟踪
- 促销优惠应用

### 管理员功能
- 商品管理（增删改查、上架下架）
- 促销活动管理
- 用户权限控制

### 促销系统
- 多种促销类型（满减、折扣、赠品、限时折扣）
- 灵活的促销规则配置
- 自动优惠计算

## API测试端点

- `GET /` - 基础响应
- `GET /api/users` - 获取用户列表
- `GET /api/products` - 获取商品列表
- `GET /api/comments/product/:id` - 获取商品评论
- `POST /api/comments` - 发表评论
- `GET /api/promotions` - 获取促销活动
- `POST /api/promotions` - 创建促销活动

前端运行在 http://localhost:5173
后端运行在 http://localhost:3000

## 数据库

本项目使用Prisma ORM管理数据库。主要表结构：

### sys_user (用户表)
- `user_id` - 用户ID (主键)
- `phone` - 手机号
- `email` - 邮箱
- `password` - 密码哈希
- `role` - 用户角色 (0:普通用户, 1:管理员)
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

### product_comment (商品评论表)
- `comment_id` - 评论ID (主键)
- `user_id` - 用户ID (外键)
- `product_id` - 商品ID (外键)
- `score` - 评分 (1-5星)
- `content` - 评论内容
- `create_time` - 创建时间

### promotion (促销活动表)
- `promotion_id` - 活动ID (主键)
- `title` - 活动标题
- `description` - 活动描述
- `type` - 活动类型 (1:满减, 2:折扣, 3:赠品, 4:限时折扣)
- `status` - 状态 (0:未开始, 1:进行中, 2:已结束)
- `start_time` - 开始时间
- `end_time` - 结束时间
- `created_by` - 创建者ID
- `created_at` - 创建时间
- `updated_at` - 更新时间

### promotion_rule (促销规则表)
- `rule_id` - 规则ID (主键)
- `promotion_id` - 活动ID (外键)
- `product_id` - 指定商品ID (可选)
- `condition_type` - 条件类型 (1:满金额, 2:满数量)
- `condition_value` - 条件值
- `discount_type` - 优惠类型 (1:减金额, 2:打折, 3:赠品)
- `discount_value` - 优惠值
- `gift_product_id` - 赠品商品ID (可选)

### order (订单表)
- `order_id` - 订单ID (主键)
- `user_id` - 用户ID (外键)
- `total_amount` - 总金额
- `status` - 订单状态
- `promotion_id` - 促销活动ID (可选)
- `discount_amount` - 优惠金额
- `created_at` - 创建时间
- `updated_at` - 更新时间

### order_item (订单商品表)
- `order_item_id` - 订单商品ID (主键)
- `order_id` - 订单ID (外键)
- `product_id` - 商品ID (外键)
- `quantity` - 数量
- `price` - 单价
- `total_price` - 小计

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

