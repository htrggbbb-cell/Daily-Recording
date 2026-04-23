# 每日记录 - 消费收入网站

一个全栈网站，用于记录每天的消费收入情况。

## 技术栈

### 后端
- Node.js + Express.js
- MySQL
- JWT 认证
- bcrypt 密码加密

### 前端
- Vue 3 + Vite
- Vue Router
- Pinia (状态管理)
- Element Plus (UI 组件库)
- Axios (HTTP 请求)

## 项目结构

```
webtest/
├── backend/           # 后端代码
│   ├── src/
│   │   ├── config/    # 配置文件
│   │   ├── controllers/ # 控制器
│   │   ├── models/    # 数据模型
│   │   ├── routes/    # 路由
│   │   ├── middleware/ # 中间件
│   │   └── app.js     # 主入口
│   ├── .env          # 环境变量
│   └── package.json
├── frontend/         # 前端代码
│   ├── src/
│   │   ├── views/    # 页面组件
│   │   ├── router/   # 路由配置
│   │   ├── store/    # 状态管理
│   │   ├── utils/    # 工具函数
│   │   └── main.js   # 主入口
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql   # 数据库表结构
```

## 安装和运行

### 1. 数据库配置

首先在 MySQL 中创建数据库并执行 schema.sql：

```bash
mysql -u root -p < database/schema.sql
```

或者在 MySQL 客户端中执行：

```sql
source D:/webtest/database/schema.sql
```

### 2. 后端配置

编辑 [backend/.env](file:///D:/webtest/backend/.env) 文件，配置数据库连接信息：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password  # 修改为你的 MySQL 密码
DB_NAME=daily_tracker
JWT_SECRET=your_jwt_secret_key_change_this  # 修改为随机密钥
```

安装依赖并启动后端：

```bash
cd backend
npm install
npm start
```

后端服务将在 http://localhost:3000 启动

### 3. 前端配置

安装依赖并启动前端：

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

## 功能特性

### 用户功能
- 用户注册
- 用户登录 (JWT Token 认证)
- 退出登录

### 消费收入记录功能

## API 接口

### 认证接口
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/user` - 获取当前用户信息

### 饮食记录接口
- GET `/api/food/records` - 获取饮食记录列表
- POST `/api/food/records` - 添加饮食记录
- GET `/api/food/records/:id` - 获取单条饮食记录
- PUT `/api/food/records/:id` - 更新饮食记录
- DELETE `/api/food/records/:id` - 删除饮食记录
- GET `/api/food/stats` - 获取饮食统计数据

### 学习记录接口
- GET `/api/study/records` - 获取学习记录列表
- POST `/api/study/records` - 添加学习记录
- GET `/api/study/records/:id` - 获取单条学习记录
- PUT `/api/study/records/:id` - 更新学习记录
- DELETE `/api/study/records/:id` - 删除学习记录
- GET `/api/study/stats` - 获取学习统计数据

## 使用说明

1. 首次使用请先注册账号
2. 登录后可以添加饮食记录和学习记录
3. 可以编辑和删除已有的记录
4. 所有数据都保存在 MySQL 数据库中

## 注意事项

- 确保 MySQL 服务已启动
- 修改 `.env` 文件中的数据库密码
- JWT_SECRET 应该是一个安全的随机字符串
- 前端和后端需要同时运行才能正常使用

## 🌐 外网访问配置

如果想让朋友通过外网访问你的网站，请参考：[外网访问指南.md](./外网访问指南.md)

推荐使用 **cpolar** 内网穿透工具：
- ✅ 免费版稳定可用
- ✅ 操作简单，有 Windows 客户端
- ✅ 无需购买服务器

快速步骤：
1. 注册并安装 cpolar：https://www.cpolar.com/
2. 创建两条隧道（后端 3000，前端 5173）
3. 启动前后端服务
4. 将前端公网地址分享给朋友

当然也可以自己买域名使用。
