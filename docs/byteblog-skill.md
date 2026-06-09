# ByteBlog 项目经验 Skill —— Vue3 + FastAPI 全栈项目避坑指南

## 适用场景

- Vue 3 + TypeScript + Element Plus 前端
- Python FastAPI + SQLAlchemy + MySQL 后端
- JWT 认证 + 角色权限
- AI API 集成（DeepSeek/OpenAI）
- 前后端分离博客/CMS 系统

---

## 一、技术栈选择（黄金组合）

```
前端: Vue 3 + TS + Vite + Element Plus + Pinia + Vue Router + ByteMD
后端: FastAPI + SQLAlchemy 2.0 + PyMySQL + JWT + bcrypt
数据库: MySQL 8.0 (utf8mb4)
AI: DeepSeek API (httpx 异步调用)
```

---

## 二、10 大常见坑及解决方案

### 坑1：SQLAlchemy Enum 与 MySQL Enum 不兼容 ⚠️⚠️⚠️

**现象**：查询时报 `LookupError: 'xxx' is not among the defined enum values`

**根因**：SQLAlchemy 的 `Enum(MyEnum)` 与 MySQL 原生 `ENUM` 类型在大小写和值匹配上不兼容。

**解决**：**Python 模型一律用 `String` 类型，数据库列用 `VARCHAR`。**

```python
# ❌ 会出问题
class User(Base):
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))

# ✅ 正确做法
class User(Base):
    role: Mapped[str] = mapped_column(String(20), default="user")
```

```sql
-- 数据库列类型
role VARCHAR(20) NOT NULL DEFAULT 'user'
```

状态常量用模块级字符串，不用 Enum 成员：
```python
DRAFT = "draft"
PENDING = "pending"
PUBLISHED = "published"
ARCHIVED = "archived"
```

---

### 坑2：前后端 API 路径不匹配 ⚠️⚠️

**现象**：前端请求 200 OK 但数据为空

**根因**：FastAPI 的 `APIRouter(prefix="/articles")` + `@router.get("/my/articles")` 实际路径是 `/articles/my/articles`，但前端往往写成 `/my/articles`。

**解决**：统一检查所有 API 路径。

```typescript
// 前端 api/index.ts —— 确保 baseURL + path = 后端实际路径
const http = axios.create({ baseURL: '/api' })

// 后端 router = APIRouter(prefix="/articles")
// @router.get("/my/articles") → 实际路径 /api/articles/my/articles
getMyArticles: () => http.get('/articles/my/articles')  // ✅
```

---

### 坑3：Python `__pycache__` 缓存导致代码不生效 ⚠️⚠️

**现象**：改了模型/代码，重启服务后错误依旧

**根因**：Python `.pyc` 字节码缓存未清除，uvicorn reload 模式复用了旧缓存。

**解决**：改模型后强制清除缓存再启动。
```bash
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete
```

启动时避免 reload 模式（生产调试用）：
```python
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
```

---

### 坑4：SQLAlchemy 多外键歧义 ⚠️

**现象**：`AmbiguousForeignKeysError: multiple foreign key paths`

**根因**：一张表有两个外键指向同一张表（如 articles 的 author_id 和 reviewer_id 都指向 users）。

**解决**：每个 relationship 必须显式指定 `foreign_keys`。
```python
# Article 模型
author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
reviewer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))

author = relationship("User", back_populates="articles", foreign_keys=[author_id])
reviewer = relationship("User", foreign_keys=[reviewer_id])

# User 模型
articles = relationship("Article", back_populates="author", foreign_keys="[Article.author_id]")
```

---

### 坑5：passlib 与新版 bcrypt 不兼容 ⚠️

**现象**：`MissingBackendError: bcrypt: no backends available`

**根因**：passlib 1.7.x 不支持 bcrypt 4.x+。

**解决**：直接用 bcrypt 库，不经过 passlib。
```python
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

---

### 坑6：`load_dotenv()` 路径不对 ⚠️

**现象**：改了 .env 不生效，全用默认值

**根因**：`load_dotenv()` 无参时从 CWD 查找 .env，而不是代码文件所在目录。

**解决**：始终用绝对路径 + `override=True`。
```python
import os
from dotenv import load_dotenv

load_dotenv(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'),
    override=True
)
```

---

### 坑7：Element Plus 默认英文 ⚠️

**现象**：分页、日期选择器等显示英文

**解决**：导入中文语言包并传入。
```typescript
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

app.use(ElementPlus, { locale: zhCn })
```

---

### 坑8：ByteMD 编辑器 locale 不生效 ⚠️

**现象**：`locale="zh-Hans"` 传了字符串但工具栏仍是英文

**根因**：ByteMD 的 locale 需要 JSON 对象，不是字符串。

**解决**：导入 JSON 文件并绑定。
```typescript
import zhHans from 'bytemd/locales/zh_Hans.json'
// <Editor :locale="zhHans" />
```

---

### 坑9：SPA 中 `window.open()` 无效 ⚠️

**现象**：点击按钮没反应

**根因**：Vue Router SPA 中应使用 `router.push()`，`window.open()` 会触发完整页面加载。

**解决**：统一用 Vue Router 导航。
```typescript
import { useRouter } from 'vue-router'
const router = useRouter()
router.push(`/article/${id}`)  // ✅
```

---

### 坑10：Uvicorn reload 僵尸进程 ⚠️

**现象**：`netstat` 显示多个 Python 进程占用 8000 端口，杀不掉

**根因**：uvicorn reload 模式下有父进程（reloader）+ 子进程（worker），杀掉子进程后 reloader 会自动重启。

**解决**：
```bash
# Windows
netstat -ano | findstr :8000
taskkill /F /PID <所有PID>

# 或换端口启动
uvicorn.run("main:app", port=8001, reload=False)
```

---

## 三、项目结构黄金模板

```
project/
├── frontend/                 # Vue 3 SPA
│   └── src/
│       ├── api/index.ts      # Axios 封装（拦截器+自动 Token）
│       ├── components/
│       │   ├── admin/        # 后台组件
│       │   ├── front/        # 前台组件
│       │   └── shared/       # 共享组件
│       ├── layouts/          # 布局（FrontLayout + AdminLayout）
│       ├── pages/
│       │   ├── admin/        # 后台页面（Dashboard/List/Editor/Review...）
│       │   └── front/        # 前台页面（Home/Detail/Login/Register）
│       ├── router/index.ts   # 路由 + beforeEach 守卫
│       ├── stores/           # Pinia (auth store)
│       ├── types/index.ts    # TS 接口定义
│       ├── utils/index.ts    # 工具函数
│       └── assets/styles/    # SCSS 全局样式
├── backend/                  # FastAPI
│   └── app/
│       ├── api/              # 路由模块（auth/articles/comments/ai/tags/admin）
│       ├── ai/               # AI 客户端（DeepSeek/OpenAI）
│       ├── core/             # config + security + database
│       ├── models/           # SQLAlchemy 模型（全用 String 不用 Enum）
│       ├── schemas/          # Pydantic 请求/响应模型
│       └── services/         # 业务依赖（auth_deps）
├── sql/init.sql              # 建库脚本 + 种子数据
├── start.bat                 # 一键启动
├── start_backend.py          # 后端启动脚本
└── .gitignore
```

---

## 四、开发流程清单

按以下顺序开发，每步验证后再进入下一步：

| 阶段 | 内容 | 验证方式 |
|:--:|------|------|
| 1 | 数据库建表 + 种子数据 | `SELECT * FROM users` |
| 2 | 后端模型 + 密码哈希 | Python 直接调 `verify_password` |
| 3 | JWT 签发/验证 | Python 直接测试 |
| 4 | 注册/登录 API | curl 或 Swagger UI |
| 5 | 文章 CRUD + 状态流转 | 逐状态 curl 测试 |
| 6 | 前端路由 + 页面骨架 | `npm run dev` 看页面 |
| 7 | 前后端联调 | 浏览器操作 + Network 面板 |
| 8 | AI 功能 | 确认 API Key 有效 |
| 9 | UI 细节（语言包/样式） | 逐页面检查 |
| 10 | 一键启动脚本 + Git 推送 | 全流程测试 |

---

## 五、快速参考

### 新项目初始化命令
```bash
# 前端
npm create vite@latest frontend -- --template vue-ts
cd frontend && npm install element-plus @element-plus/icons-vue vue-router@4 pinia axios bytemd @bytemd/vue-next @bytemd/plugin-gfm @bytemd/plugin-highlight sass

# 后端
pip install fastapi uvicorn sqlalchemy pymysql python-jose bcrypt python-multipart pydantic python-dotenv httpx markdown-it-py
```

### 前端 main.ts 标准配置
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as Icons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
for (const [k, c] of Object.entries(Icons)) app.component(k, c)
app.use(createPinia()).use(router).use(ElementPlus, { locale: zhCn })
app.mount('#app')
```

### vite.config.ts 标准配置
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } },
})
```

### 后端安全模块标准写法
```python
import bcrypt
from jose import jwt
from datetime import datetime, timedelta, timezone

def hash_password(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def verify_password(pw, hp): return bcrypt.checkpw(pw.encode(), hp.encode())
def create_token(data, secret, minutes=1440):
    data = {**data, "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes)}
    return jwt.encode(data, secret, algorithm="HS256")
```
