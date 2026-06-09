---
name: vue3-fastapi-fullstack-pitfalls
description: Vue3+FastAPI全栈项目错误速查+正确写法模板 — 触发条件明确、复制即用
metadata:
  type: reference
---

# Vue3 + FastAPI 全栈项目：错误速查 + 正确模板

> 🔴 触发条件：只要项目中同时出现 Vue3 和 FastAPI，自动加载此 Skill。

---

## 一、启动前必做清单（跳过任何一条都会卡住）

- [ ] 问用户要 MySQL 密码 + AI API Key + GitHub 用户名
- [ ] 写入 backend/.env（绝对路径 + override=True）
- [ ] 写入 .gitignore（确保 .env 不被提交）
- [ ] 模型字段全部用 `mapped_column(String(20))`，不用 `Enum`
- [ ] security.py 直接 `import bcrypt`，不经过 passlib
- [ ] 写完 API 路由后对照前端 api/index.ts 路径

## 零、流程铁律（违反必后悔）

- 🔴 **先做完项目，用户验证通过，再生成论文。** 不要在功能没稳定时生成论文，否则必重写。
- 🔴 **每次改模型/配置后清缓存再重启。** `find . -name "__pycache__" -exec rm -rf {} +`
- 🔴 **不要在用户确认前写任何业务规则代码。** 先问，再写。

---

## 二、错误速查表（见到报错 → 直接查这里）

| 报错关键词 | 根因 | 修复 | 修复后必做 |
|------|------|------|------|
| `LookupError: 'xxx' is not among the defined enum values` | 模型用了 Enum | 改为 `String(20)` | 清缓存重启 |
| `AmbiguousForeignKeysError` | 多外键指向同表 | relationship 加 `foreign_keys=[列名]` | 清缓存重启 |
| `Access denied for user 'root'@'localhost'` | 密码不对 或 load_dotenv 路径错误 | 检查 .env + config.py 路径 | 重启 |
| `ModuleNotFoundError: No module named 'xxx'` | 未安装依赖 | pip install | 重启 |
| `MissingBackendError: bcrypt` | passlib 不兼容新版 bcrypt | 直接用 `import bcrypt` | 重启 |
| 500 Internal Server Error | 代码逻辑错误（看日志） | 查 /tmp/backend.log | 修完清缓存 |
| API 返回 200 但数据为空 | 路径拼写不匹配 | 对账 baseURL + prefix + route_path | 刷新 |
| 前端空白页 | 编译错误或路由问题 | 浏览器 F12 看 Console | 修完重新 npm run dev |
| `JSON parse error` 或 shell 引号问题 | Windows curl JSON 转义 | 改用 Python httpx 测试 | — |
| `UnicodeEncodeError: 'gbk' codec` | Windows 终端编码 | 输出到文件，避免 Emoji | — |
| `[WinError 10054]` 连接重置 | 后端崩溃 | 查看日志修Bug | 重启服务 |
| Element Plus 组件英文 | 没配中文 locale | `import zhCn from 'element-plus/es/locale/lang/zh-cn'` | 重启前端 |
| ByteMD 工具栏英文 | locale 传了字符串 | `import zhHans from 'bytemd/locales/zh_Hans.json'` 绑定对象 | 重启前端 |
| SPA 中点击按钮无反应 | 用了 window.open | 改为 `router.push()` | — |
| uvicorn 端口被占用杀不掉 | reloader 子进程自动重启 | `taskkill /F /PID <所有PID>` | 换端口 |
| Element Plus 组件样式改不动 | scoped 样式穿透失败 | 用 `:deep(.el-xxx)` 穿透 | 检查选择器 |
| 页面在手机端显示异常 | 没做响应式 | 加 media query 或 Element Plus 响应式栅格 | 浏览器 F12 手机模式 |
| `npm run build` 后路由 404 | Vite SPA 需要 fallback | 确认 history 模式 + 服务器配置 | — |

---

## 三、正确写法模板（直接复制）

### 模型：全部用 String

```python
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user")      # 不用 Enum
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Article(Base):
    __tablename__ = "articles"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft")   # 不用 Enum
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    reviewer_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship("User", back_populates="articles", foreign_keys=[author_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])         # 多外键必须指定

# 状态用模块级字符串常量
DRAFT = "draft"
PENDING = "pending"
PUBLISHED = "published"
```

### 安全：直接用 bcrypt

```python
import bcrypt
from jose import jwt
from datetime import datetime, timedelta, timezone

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(data: dict, secret: str, minutes: int = 1440) -> str:
    data = {**data, "exp": datetime.now(timezone.utc) + timedelta(minutes=minutes)}
    return jwt.encode(data, secret, algorithm="HS256")
```

### 配置：load_dotenv 绝对路径

```python
import os
from dotenv import load_dotenv

# __file__ = app/core/config.py → 需要往上 3 级到 backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=True)
```

### 可选认证

```python
security = HTTPBearer(auto_error=False)  # auto_error=False 使认证可选

def get_current_user_or_none(credentials=Depends(security), db=Depends(get_db)):
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    return db.query(User).filter(User.id == int(payload["sub"])).first()
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

### vite.config.ts

```typescript
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } },
})
```

### Git 种子密码：现场生成

```python
# ❌ 不要写死旧 hash
import bcrypt
h = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode()
print(h)  # 复制到 init.sql
```

### SCSS 样式穿透

```scss
// Element Plus 组件样式覆盖
.el-card { :deep(.el-card__body) { padding: 16px; } }

// 表格表头
.el-table { :deep(th.el-table__cell) { background: #f8f9fa; } }
```

### 响应式栅格

```vue
<!-- 大屏3列 → 中屏2列 → 小屏1列 -->
<div class="grid">
  <div class="item" v-for="item in list" :key="item.id">...</div>
</div>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media (max-width: 1024px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .grid { grid-template-columns: 1fr; } }
</style>
```

### 清缓存命令

```bash
find . -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete
```

### Windows 杀进程

```bash
netstat -ano | findstr :8000
taskkill /F /PID <所有的PID>

# 启动不要用 reload 模式
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
```

---

## 四、Playwright 截图命令（直接复制）

```bash
# 首次使用先装浏览器
npx playwright install chromium

# 项目启动后截图（用于论文）
npx playwright screenshot --browser=chromium http://localhost:5173/login docs/login.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/articles docs/articles.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/articles/new docs/editor.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/review docs/review.png
```

CLI 失败时用 MCP：`mcp__playwright__browser_navigate` + `mcp__playwright__browser_take_screenshot`

---

## 五、验证循环标准流程

每次改完代码后执行：

```bash
# 1. 清缓存
find . -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete

# 2. 杀旧进程
netstat -ano | findstr :8000
taskkill /F /PID <PID>

# 3. 重启（无reload模式）
python start_backend.py

# 4. 运行自动化测试
python run_tests.py

# 5. 前端编译
cd frontend && npm run build
```

> 预期迭代次数：第1次必失败（环境），第2次大概率失败（类型/缓存），第3次可能通过，第4次用户反馈调整。

---

## 与流程 Skill 的关系

本 Skill = **技术字典**（见到X错误→做Y修复）。遇到具体技术问题来这里查。

流程 Skill = **时间表**（先做什么→再做什么→什么时候停）。不知道怎么推进项目时去那里查。
