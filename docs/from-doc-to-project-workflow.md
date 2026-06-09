---
name: from-doc-to-project-workflow
description: 从读取需求文档到完整项目交付的全流程方法论 — 决策树、提前避坑、验证驱动、论文生成
metadata:
  type: reference
---

# 从文档到项目：全流程生成方法论

> 适用场景：拿到一个课程/比赛需求文档 → 交付完整项目 + 论文

---

## 阶段0：需求解码（15分钟）

### 0.1 读文档三步法

**第一步：提取强制项**
从文档中提取所有"必须""强制""要求"关键词，列成清单。这些不能妥协。

**第二步：提取加分项**
找出所有"加分""推荐""鼓励"关键词，作为技术选型的额外维度。

**第三步：画出决策树**
把所有需要用户选择的点列出来，每个点给推荐选项 + 理由。

### 0.2 必须向用户确认的4个问题

Q1: 选题方向？（传统/AI增强/自定义）
Q2: 技术栈偏好？（前端框架 + 后端语言 + 数据库）
Q3: 现有资源？（已有API Key？有基础代码？）
Q4: UI风格偏好？（管理后台风/内容创作风？要不要前台？）

> ⚠️ 不要在用户确认前写任何代码！

### 0.3 常见选题推荐

| 类型 | 推荐选题 | 原因 |
|------|------|------|
| 稳妥型 | 个人博客 | 资料多，状态流转天然适合 |
| 加分型 | AI增强博客/待办 | AI加分项 + 传统项目基础 |
| 创新型 | AI知识库 | 差异化明显，但风险高 |

---

## 阶段1：架构设计（10分钟）

### 1.1 生成 Prompt 模板

在写代码前，先输出一份确认清单给用户：

```
项目名称、技术栈（含版本号）、页面路由表、组件树、数据库ER草图、API列表、分阶段计划、所需skills/agents
```

用户确认后再动手。

### 1.2 数据库设计原则

- 所有状态字段用 VARCHAR，不用 ENUM
- 所有外键关系明确 foreign_keys
- 种子数据脚本一起写好（管理员账号 + 预设标签）
- 字符集 utf8mb4（支持中文和 emoji）

### 1.3 API 设计原则

- 先定路由前缀再写路径：`router = APIRouter(prefix="/xxx")`
- 保证前端 `baseURL + path === 后端实际路径`
- 分模块：auth / articles / comments / ai / tags / admin

---

## 阶段2：骨架搭建（20分钟）

### 2.1 后端优先（数据层先通）

```
1. 写 .env + config.py（load_dotenv 绝对路径 + override=True）
2. 写 database.py（engine + SessionLocal + Base）
3. 写 models（全用 String 类型）
4. 写 security.py（bcrypt 直接调，不经过 passlib）
5. 写 schemas（Pydantic 请求/响应）
6. 写 auth_deps.py（get_current_user + get_current_user_or_none + get_admin_user）
7. 写 API 路由（一个一个模块写）
8. 写 main.py（CORS + include_router）
```

### 2.2 前端继之

```
1. 脚手架：npm create vite@latest -- --template vue-ts
2. 装依赖：Element Plus + Vue Router + Pinia + Axios + ByteMD + SCSS
3. 配 vite.config.ts（@ alias + proxy /api → localhost:8000）
4. 写 types/index.ts（所有 TS 接口）
5. 写 api/index.ts（Axios 封装 + 拦截器 + 所有 API 函数）
6. 写 stores/auth.ts（Pinia 认证状态）
7. 写 router/index.ts（路由表 + beforeEach 守卫）
8. 写 main.ts（注册 Element Plus 中文 + Pinia + Router）
9. 写全局 SCSS（颜色/卡片/动画/Element Plus 覆写）
10. 写布局组件（FrontLayout + AdminLayout）
11. 写页面组件（逐个实现）
```

### 2.3 文件创建顺序

先创建这些目录，避免后续报错：
```
frontend/src/{api,assets/styles,components/{admin,front,shared},layouts,pages/{admin,front},router,stores,types,utils}
backend/app/{api,ai,core,models,schemas,services}
```

---

## 阶段3：验证阶段（最关键！）

### 3.1 每写完一个模块就验证

不要全部写完再测试！按这个顺序逐步验证：

```
1. Python 直接测 DB 连接
2. Python 直接测密码哈希
3. Python 直接测 JWT 签发/验证
4. curl 测注册/登录 API
5. curl 测文章 CRUD + 状态流转
6. 前端 npm run dev 看页面是否渲染
7. 浏览器操作完整业务流程
```

### 3.2 自动化测试脚本

写一个 `run_tests.py`，每次改完代码跑一遍，秒级反馈。

### 3.3 常见验证失败及修复

| 错误 | 第一时间检查 |
|------|------|
| `ModuleNotFoundError` | pip install 了没？用哪个 Python？ |
| `ImportError` | 清除 `__pycache__` |
| `Access denied` | .env 密码对不对？load_dotenv 路径对不对？ |
| 500 Internal Server Error | 查看后端日志 `cat /tmp/backend.log` |
| 前端空白页 | 打开浏览器 Console 看报错 |
| API 返回 404 | 路径拼写检查：baseURL + path |

---

## 阶段3.5：反复验证循环（核心！）

> 从来没有一次通过的。验证 → 失败 → 定位 → 修复 → 再验证，循环直到通过。

### 循环1：依赖与启动

```
启动后端 → ModuleNotFoundError → pip install → 再启动 → 成功
```

**提前避免**：先 `pip install -r requirements.txt`，确认无报错再写启动命令。

### 循环2：数据库连接

```
启动后端 → Access denied → 改.env密码 → 再启动 → SQLAlchemy mapper error → 改模型 → 再启动 → 成功
```

**提前避免**：
1. `.env` 密码不要用默认值占位，直接问用户真实密码
2. 模型写完先 `python -c "from app.models import *"` 验证导入无报错

### 循环3：ORM类型兼容

```
注册API → 500 Error → 查日志 → LookupError Enum → 改模型String → 清除缓存 → 重启 → 再测 → 还报错 → 发现缓存没清干净 → 再清 → 再重启 → 通过
```

**提前避免**：
1. 模型字段全部用 `String` 不用 `Enum`（坑1）
2. 改模型后 `find . -name "__pycache__" -exec rm -rf {} +`
3. **不要用 uvicorn reload 模式**，reloader 会缓存旧代码

### 循环4：业务逻辑验证

```
登录API → 密码错误 → 查DB → bcrypt hash不匹配 → 重新生成hash → 更新DB → 再登录 → 通过
创建文章 → 通过 → 提交审核 → 通过 → 审核通过 → 通过 → 归档 → 通过
文章列表 → 空 → 检查API路径 → 发现 /my/articles ≠ /articles/my/articles → 修复 → 通过
```

**提前避免**：
1. 种子数据用 `bcrypt.hashpw()` 现场生成 hash，不要用旧的占位hash
2. 写完后端路由立刻对照前端 API 调用路径检查

### 循环5：用户反馈迭代

```
用户："看不到文章内容" → 检查 → 编辑权限只允许draft → 放宽到draft+published → 通过
用户："管理列表没查看按钮" → 添加 → window.open在SPA无效 → 改router.push → 通过
用户："草稿权限泄漏" → 管理员能看到别人的草稿 → 加过滤条件 → 通过
用户："都是英文" → Element Plus没配中文 → import zhCn → 通过 → ByteMD没配 → import zhHans.json → 通过
```

**提前避免**：
1. 业务规则写死前先让用户确认
2. Element Plus + ByteMD 中文配置写在项目模板里
3. SPA 中永远用 `router.push()`，不用 `window.open()`

### 循环6：论文生成

```
生成论文 → 成功 → 用户要求补充 → 文件被占用 → 换文件名 → 再生成 → 覆盖原文件 → 通过
```

**提前避免**：论文生成前提醒用户关闭 Word。

### 验证循环的本质规律

```
第1次: 启动失败（环境/依赖/密码）
第2次: 500错误（代码逻辑/类型/缓存）
第3次: 200但数据不对（路径/权限/业务规则）
第4次: 用户反馈调整（UI/体验/边界）
第5次: 通过
```

**核心原则：每次改完代码 → 清缓存 → 重启 → 用脚本自动化验证，不要手动一个个试。**

---

## 阶段4：Bug修复模式

### 4.1 定位 Bug 的标准流程

```
1. 看前端 Network 面板：请求发出去了吗？状态码？
2. 看后端日志：有没有 Traceback？
3. 缩小范围：直接用 Python import 测试相关模块
4. 改代码 → 清除缓存 → 重启 → 验证
```

### 4.2 最重要的习惯

**每次改模型/配置后必做**：
```bash
find . -name "__pycache__" -exec rm -rf {} +
pkill -f "python.*main\|uvicorn"
# 再重启
```

### 4.3 用户反馈驱动迭代

用户每提一个 bug，不要猜，直接查代码定位根因。修完后告知改了什么、为什么。

---

## 阶段5：论文生成

### 5.1 论文生成时机

所有功能验证通过、用户确认无 bug 后再生成论文。

### 5.2 docx 生成要点

- 使用 npm `docx` 包（JavaScript 生成 .docx）
- 字体设置：正文 SimSun 小四，标题 SimHei 三号/四号
- 表格用三线表格式
- 封面单独一页，目录自动生成
- 图表位置用占位符，让用户手动插入截图

### 5.3 论文章节标准结构

```
1. 需求分析 — 背景 + 用户角色 + 功能列表 + 用例图
2. 概要设计 — 架构图 + 技术选型 + 路由设计
3. 数据库设计 — ER图 + 表结构（三线表）
4. 系统实现 — 环境 + 关键代码说明 + 界面截图
5. 系统测试 — 黑盒测试用例表 + 结论
6. 项目部署 — 数据库配置 + BAT一键启动 + Git部署
7. AI工具使用 — 工具名 + 场景 + 代码占比 + 思考评价
8. 总结反思 — 完成情况 + 问题解决 + 收获 + 改进
```

---

## 阶段6：交付清单

- [ ] 前端 `npm run build` 零错误
- [ ] 后端 API 全部验证通过
- [ ] 数据库建库脚本可一键执行
- [ ] 一键启动脚本（start.bat）
- [ ] .gitignore 忽略 node_modules/__pycache__/.env
- [ ] README 含启动说明 + GitHub 链接 + API 文档
- [ ] 论文 .docx 含 8 章节 + 图表占位
- [ ] Git 提交记录体现开发过程
- [ ] 代码已推 GitHub

---

## 关键决策树

```
读取需求文档
    │
    ├── 选题方向？ → AI增强 + 稳妥基础 = 最优解
    ├── 前端框架？ → Vue3（课程推荐） / React
    ├── 后端语言？ → FastAPI（开发快） / SpringBoot（加分多）
    ├── 数据库？   → MySQL（推荐） / SQLite（更轻量）
    ├── 做几端？   → 前台+后台（完整） / 仅后台（省时间）
    ├── UI风格？   → 线条风（现代） / 传统（省事）
    └── TypeScript？→ 用（加分项明确提到）
```

## 与 [[vue3-fastapi-fullstack-pitfalls]] 的关系

本 Skill 是**流程**，那个 Skill 是**技术细节**。两个配合使用：
- 流程告诉你"什么时候做什么"
- 技术细节告诉你"具体怎么写不会出错"
