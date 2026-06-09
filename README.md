# ByteBlog —— AI 增强的个人博客系统

> 软件生产实习结课项目 | 2025-2026 学年第二学期

基于 **Vue 3 + FastAPI + MySQL + DeepSeek AI** 的前后端分离博客系统。支持完整的文章审核发布流程、AI 智能摘要与标签推荐、权限分级管理。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript + Vite | 3.x |
| UI 框架 | Element Plus（中文） | 2.7+ |
| 状态管理 | Pinia | 2.1+ |
| 路由 | Vue Router 4 | 4.3+ |
| Markdown | ByteMD（中文） | 1.x |
| CSS | SCSS | — |
| HTTP | Axios | 1.7+ |
| 后端框架 | FastAPI | 0.111+ |
| ORM | SQLAlchemy | 2.0+ |
| 认证 | JWT (python-jose + bcrypt) | — |
| 数据库 | MySQL 8.0 | — |
| AI | DeepSeek API | chat |

## 快速开始

### 1. 数据库

确保 MySQL 已启动，执行建库脚本：

```bash
mysql -u root -p < sql/init.sql
```

默认管理员：`admin` / `admin123`

### 2. 后端

```bash
cd blog-system
pip install -r backend/requirements.txt

# 编辑 backend/.env，修改数据库密码和 DeepSeek API Key
python start_backend.py
```

后端运行在 http://localhost:8000 ，自动生成 OpenAPI 文档：http://localhost:8000/docs

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 项目结构

```
blog-system/
├── frontend/              # Vue 3 前端 SPA
│   ├── src/
│   │   ├── api/           # Axios 封装（自动附带 JWT Token）
│   │   ├── assets/styles/ # SCSS 全局样式（线条风格）
│   │   ├── components/    # 共享组件
│   │   │   ├── admin/     # AdminSidebar, AdminHeader
│   │   │   ├── front/     # FrontNav, ArticleCard
│   │   │   └── shared/    # StatusBadge, AiToolbar
│   │   ├── layouts/       # FrontLayout, AdminLayout
│   │   ├── pages/         # 所有页面组件
│   │   │   ├── front/     # HomePage, ArticleDetailPage, LoginPage, RegisterPage
│   │   │   └── admin/     # DashboardPage, ArticleListPage, ArticleEditorPage, ReviewPage, CommentManagePage, SettingsPage
│   │   ├── router/        # 路由 + 导航守卫
│   │   ├── stores/        # Pinia (auth)
│   │   ├── types/         # TypeScript 接口定义
│   │   └── utils/         # 工具函数 (formatDate, debounce)
│   └── vite.config.ts     # 代理 /api → localhost:8000
├── backend/               # FastAPI 后端
│   ├── app/
│   │   ├── api/           # auth, articles, comments, ai, tags, admin
│   │   ├── ai/            # DeepSeek 客户端（摘要 + 标签推荐）
│   │   ├── core/          # config, security (JWT+bcrypt), database
│   │   ├── models/        # User, Article, Tag, Comment, AiLog
│   │   ├── schemas/       # Pydantic 请求/响应模型
│   │   └── services/      # auth_deps（认证依赖注入）
│   ├── main.py            # 应用入口
│   └── .env               # 环境变量配置
├── sql/                   # 建库建表脚本 + 种子数据
├── docs/                  # 论文图表（用例图、架构图、ER 图）
├── start_backend.py       # 后端一键启动脚本
├── run_tests.py           # API 自动化测试
└── README.md
```

## 业务规则

### 文章状态流转

```
草稿(Draft) ──→ 待审核(Pending) ──→ 已发布(Published) ──→ 已归档(Archived)
                     │                                            │
                     └──→ 驳回(退回草稿) ←─────────────────────────┘
```

### 角色权限矩阵

| 操作 | 普通用户 | 管理员 |
|------|:---:|:---:|
| 创建文章 | ✅ | ✅ |
| 编辑自己的草稿/已发布 | ✅ | ✅ |
| 提交审核 | ✅（自己的） | ✅（所有） |
| 删除自己的草稿/已发布 | ✅ | ✅ |
| 删除任意状态文章 | ❌ | ✅ |
| 审核文章 | ❌ | ✅ |
| 发表评论 | ✅ | ✅ |
| 管理所有评论 | ❌ | ✅ |
| 查看所有非草稿文章 | ❌ | ✅ |

### 业务规则明细

- 草稿状态可自由编辑
- 提交审核后不可编辑，等待管理员审核
- 审核不通过返回草稿（含驳回理由，悬停状态可见）
- 已发布文章收到评论后通知作者（仪表盘可见）
- 仅已发布文章对外公开可见
- 归档文章不可评论

## API 接口

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户信息 |

### 文章
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 公开文章列表（仅已发布） |
| GET | `/api/articles/:id` | 文章详情（登录后可看自己的未发布） |
| POST | `/api/articles` | 创建文章 |
| PUT | `/api/articles/:id` | 编辑文章（草稿/已发布） |
| PATCH | `/api/articles/:id/status` | 状态流转 |
| DELETE | `/api/articles/:id` | 删除文章 |
| GET | `/api/articles/my/articles` | 我的文章列表 |

### AI
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/generate-summary` | AI 生成摘要 |
| POST | `/api/ai/suggest-tags` | AI 推荐标签 |

### 评论 / 标签 / 管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/comments/articles/:id/comments` | 评论列表 / 发表 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/admin/dashboard` | 管理员仪表盘 |
| GET | `/api/admin/my-dashboard` | 用户仪表盘（含评论通知） |
| GET | `/api/admin/review/pending` | 待审核列表 |

## 加分项覆盖

- ✅ Vue 3 + TypeScript + Pinia + Vue Router 完整生态
- ✅ Element Plus UI 框架 + 中文语言包 + 自定义线条风格主题
- ✅ 完整的 RESTful API 设计
- ✅ AI 增强功能（DeepSeek 摘要 + 标签推荐）
- ✅ 创新性选题：AI 辅助写作的个人博客
- ✅ 完整的业务生命周期与状态流转
- ✅ JWT 认证 + 角色权限控制
- ✅ 响应式前端，清晰的代码结构
