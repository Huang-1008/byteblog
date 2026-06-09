---
name: from-doc-to-project-workflow
description: 触发驱动型项目全流程 — 7个STOP检查点、每阶段执行模板、决策树前置、多文档优先级、安全拦截应对、Windows适配、工具清单
metadata:
  type: reference
---

# 从文档到项目：触发驱动全流程

> 🔴 触发条件：用户给了一个需求文档或任务书 → 自动加载此 Skill。
>
> 核心原则：**每个阶段结束必须 STOP 让用户确认，不跨阶段。先要密钥，再写代码。**

---

## 快速决策树（先跑这个）

```
拿到文档
  │
  ├─ 🔴 STOP 0: 问用户要密钥！(API Key + DB密码 + GitHub用户名)
  │
  ├─ 选题方向？ → AI增强+传统基础 = 最优解
  ├─ 前端框架？ → 文档推荐哪个选哪个
  ├─ 后端语言？ → FastAPI(快速) / SpringBoot(加分)
  ├─ 数据库？   → MySQL（文档推荐）
  ├─ 做几端？   → 前台+后台（完整） / 仅后台（省时）
  ├─ 有AI加分？ → 用户有API Key就做
  │
  └─ 🔴 STOP 1: 输出完整架构 Prompt 让用户逐项确认
```

---

## 阶段0：需求解码 + 收集密钥

### 🔴 STOP 0：收到文档后、写代码前，先问密钥

**直接复制这段发给用户：**

```
我看了文档，在开始之前需要你提供：

1. 你的 AI API Key（有就做AI功能，没有就跳过）
2. 你的 MySQL root 密码
3. 你的 GitHub 用户名（建仓库用）
4. 你的学校、班级、姓名、学号（论文封面用）

密码和 Key 只在本地 .env 使用，不会提交到 GitHub。
```

收到后立即：
```
backend/.env    ← 填密码 + API Key
.gitignore     ← 加入 .env、node_modules、__pycache__
.env.example   ← 不含真实密码的模板
generate_paper.js ← 填学校/班级/姓名/学号
```

### 读文档三步

1. 提取强制项（"必须""强制""要求"）→ 不可妥协
2. 提取加分项（"推荐""鼓励""加分"）→ 技术选型加权
3. 画出决策树 → 每个分叉给推荐选项 + 理由

### 确认4问

Q1: 选题方向？ Q2: 技术栈偏好？ Q3: 有API Key吗？ Q4: UI风格偏好？ Q5: 前端样式个性化？

### 0.2.5 前端样式个性化（🔴 必问）

**不能让所有项目都长一样。每个项目给用户 3-5 个选择维度。**

#### 标准问法

```
在设计前端界面前，请选择你喜欢的风格：

1. 整体风格：
   A. 线条风（细线边框、轻阴影、现代感）  ← 推荐
   B. 卡片风（大阴影、圆角、Material Design）
   C. 极简风（无边框、大留白、Apple 风格）

2. 主色调：
   A. 深蓝系（#1a1a2e 专业/技术感）  ← 推荐
   B. 蓝色系（#409EFF Element Plus 默认）
   C. 绿色系（清爽/环保）
   D. 暗黑系（深色背景 #141414）

3. 布局风格：
   A. 侧边栏+顶栏（经典后台）  ← 推荐
   B. 纯顶栏（简洁，适合少菜单）
   C. 混合式（侧边栏收起+顶栏）

4. 动效程度：
   A. 适度动效（过渡+悬停，推荐）
   B. 无动效（最简洁）
   C. 丰富动效（页面切换+交互动画）

5. 圆角风格：
   A. 小圆角（4px，干练）
   B. 中圆角（8px，现代）  ← 推荐
   C. 大圆角（16px，柔和）

（说"随便"我就用 ← 标记的推荐值）
```

#### "用户说随便"的默认值

```
整体风格: 线条风（1px border + 轻阴影）
主色调: 深蓝系 #1a1a2e + 强调色 #e94560
布局: 侧边栏+顶栏
动效: 适度（0.2s transition + hover 上浮）
圆角: 8px
字体: Inter / PingFang SC / system-ui
```

### 多文档处理

用户补充额外规范文档时，优先级：
```
结课论文要求（具体） > 学校通用规范（通用） > 默认格式
```

---

## 阶段1：架构设计 + 工具盘点

### ⚠️ 工具使用纪律（每次启动项目必须重新确认）

**确保每个工具在正确的时机被调用。不允许跳过。**

#### 工具 → 使用时机对照表

| 工具 | 必须使用的节点 | 具体做什么 | 不可用时降级 |
|------|------|------|------|
| **MySQL MCP** | 阶段0 收到密码后 | `mcp__mysql__execute_query` 检查 MySQL 是否在线 | Python pymysql |
| **MySQL MCP** | 阶段2 建库后 | `mcp__mysql__execute_query` 验证表结构和种子数据 | Python pymysql |
| **MySQL MCP** | 阶段3 每次改模型后 | `mcp__mysql__describe_table` 确认列类型正确 | Python pymysql |
| **GitHub MCP** | 阶段6 交付前 | `mcp__github__create_repository` 建仓库 | 手动 git |
| **GitHub MCP** | 阶段6 交付前 | `mcp__github__push_files` 或手动 `git push` | — |
| **Playwright CLI** | 阶段4 系统可运行后 | `npx playwright screenshot` 截4张论文图 | Playwright MCP |
| **Playwright MCP** | 阶段4 CLI快照异常时 | `mcp__playwright__browser_snapshot` 精细化调试 | Playwright CLI |
| **docx Skill** | 阶段5 用户确认后 | 生成 .docx 论文 | — |
| **code-review Skill** | 阶段4 Bug修复后 | 检查代码质量 | — |

#### 🔴 铁律

```
MySQL MCP 只读 ≠ 不能用它帮用户配置数据库！
即使 MCP 只有 SELECT 权限，也要用它：
  1. 检查数据库是否在线
  2. 检查表是否存在
  3. 检查列类型是否正确
  4. 验证种子数据是否插入成功
  
写操作（CREATE/INSERT）用 Python pymysql 脚本执行，
但验证必须用 MySQL MCP 重复确认。
```

#### 标准安装命令

| 工具 | 安装命令 | 谁来装 |
|------|------|------|
| npm 依赖 | `npm install` | Claude 自行 |
| pip 依赖 | `pip install -r requirements.txt` | Claude 自行 |
| Playwright 浏览器 | `npx playwright install chromium` | Claude 自行 |
| docx npm | `npm install docx` | Claude 自行 |
| GitHub MCP | VSCode 设置中配置 | 提示用户 |
| MySQL MCP | VSCode 设置中配置 | 提示用户 |
| Playwright MCP | VSCode 设置中配置 | 提示用户（备选） |

#### 标准问法

```
我会自动安装的：
- npm/pip 依赖、Playwright 浏览器、docx 生成器

需要确认你有没有授权的：
- GitHub MCP（没有我用 git 命令）
- MySQL MCP（没有我用 pymysql，但强烈建议配置）

即使 MCP 只是只读的，我也会用它来验证每一步，
写操作我用 Python 脚本。
```

### 🔴 STOP 0.5：数据库建好后立刻用 MySQL MCP 验证

```sql
-- 用 MCP 执行这些查询，逐项确认
SHOW DATABASES;                    -- blog_db 存在？
USE blog_db; SHOW TABLES;          -- 6张表都在？
SELECT * FROM users;               -- admin 用户存在？role 正确？
SELECT * FROM tags;                -- 10个标签？中文没乱码？
DESCRIBE articles;                 -- status 是 VARCHAR 不是 ENUM？
```

### 🔴 STOP 0.6：系统可运行后立刻用 Playwright CLI 截图

```bash
npx playwright screenshot --browser=chromium http://localhost:5173/login docs/login.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/articles docs/articles.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/articles/new docs/editor.png
npx playwright screenshot --browser=chromium http://localhost:5173/admin/review docs/review.png
```

### 🔴 STOP 1：输出完整架构 Prompt

**直接复制这个模板，填好后发给用户确认：**

```
===== 项目确认清单 =====

项目名称：[XXX]
技术栈：[前端框架+UI库+后端+数据库+AI]
页面路由：[列出所有路由]
组件树：[列出所有组件]
数据库：6张表 [列出表名]
API：18个端点 [列出模块]
分阶段计划：[列出阶段数]
加分覆盖：[列出所有加分项]
UI风格：[整体风格/主色调/布局/动效/圆角]  ← 来自0.2.5的用户选择

需要你确认的：
🔲 选题方向：[XXX]
🔲 技术栈：[XXX]
🔲 AI功能：[做/不做]
🔲 UI风格：[用户选择的风格]  ← 关键！不同项目要不一样
🔲 前台页面：[做/不做]
🔲 GitHub仓库：[用户名]
🔲 论文封面：[学校/班级/姓名/学号]

请逐项确认，全通过后我开始写代码。
```

---

## 阶段2：骨架搭建

### 后端优先（数据层先通）

按顺序执行，每步做完验证：

```
1. backend/.env → 验证：python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
2. database.py → 验证：python -c "from app.core.database import engine; engine.connect()"
3. models/    → 验证：python -c "from app.models import *; print('OK')"
4. security.py → 验证：python -c "from app.core.security import hash_password; print(hash_password('test'))"
5. schemas/   → 无独立验证（依赖 models）
6. auth_deps.py → 验证：import 无报错
7. api/       → 逐个 curl 测试
8. main.py    → 验证：curl http://localhost:8000/
```

**关键原则：**
- 所有状态字段用 `String(20)`，不用 `Enum`
- bcrypt 直接 import，不经过 passlib
- load_dotenv 用绝对路径 + override=True

### 前端继之

```
1. npm create vite@latest → npm install 所有依赖
2. vite.config.ts（proxy /api → localhost:8000）
3. main.ts（Element Plus 中文 + Pinia + Router）
4. types/ → api/ → stores/ → router/
5. layouts/ → pages/（简单→复杂）
```

### Agent 并行创建

如果 Agent 报错 `thinking options type cannot be disabled`，放弃 Agent，直接手动 Write。

---

## 阶段3 + 3.5：验证循环

### 🔴 STOP 2：写完代码后先跑这个

```bash
# 1. 清缓存
find . -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete

# 2. 启动后端（新端口，不用 reload）
python -c "import uvicorn; uvicorn.run('main:app', port=8002, reload=False)"
```

### 自动化测试脚本模板

```python
# run_tests.py 结构
# 1. 数据库连接测试
# 2. 密码/JWT 逻辑测试
# 3. 启动临时服务
# 4. 逐一调 API（注册→登录→CRUD→状态流转→AI→评论）
# 5. 输出 [PASS]/[FAIL] 汇总
```

### 迭代预期（每个项目都会经历）

| 轮次 | 错误类型 | 示例 |
|:--:|------|------|
| 1 | 环境/依赖 | ModuleNotFoundError, Access denied |
| 2 | 类型/缓存 | LookupError Enum, pyc 残留 |
| 3 | 路径/权限 | API 404, 403, 200 但空数据 |
| 4 | 用户反馈 | UI/交互/业务规则调整 |
| 5 | 通过 | — |

### 安全拦截应对

如果自动模式反复拦截 Bash 命令：
1. 写 Python 测试脚本让用户手动执行
2. 输出写到文件避免 GBK 错误
3. 避免 Emoji
4. 终极方案：让用户添加权限规则

### Windows 适配

- 用 `taskkill /F /PID` 不用 `pkill`
- 用 Python urllib 代替 curl
- 路径统一用 `/`
- print 不加 Emoji

---

## 阶段4：Bug修复模式

### 🔴 STOP 3：用户报 Bug 时

```
1. 不要猜 → 查代码定位根因
2. 修复 → 告知改了哪个文件哪一行 + 为什么
3. 清缓存 → 重启 → 让用户验证
```

---

## 阶段5：论文生成

### 🔴 STOP 4：用户手动验证完所有功能后才生成！

> ⚠️ 本项目最大的教训：不要在功能没稳定时生成论文！我们重生了 3 遍。

**论文生成前置条件（全部满足才能开始）：**

- [ ] 用户已手动跑过完整业务流程
- [ ] 用户明确说"没问题了"或"可以生成论文了"
- [ ] 所有 Bug 已修复，用户已验证通过
- [ ] API 全部通过 `run_tests.py`
- [ ] 前端 `npm run build` 零错误
- [ ] 启动脚本 `start.bat` 用户实测通过
- [ ] 代码已推 GitHub，用户确认仓库可见

**为什么不能提前生成：**
1. 后续改功能会导致论文内容过时
2. 论文文件被占用（Word 打开着）导致重新生成失败
3. 每改一次代码就要改一次论文，浪费 token 和时间
4. 用户验证过程中会提出新需求，论文必须反映最终状态

**生成前提醒用户关闭 Word。**

用 npm docx 包生成，核心要素：
- 字体：SimSun 小四(12pt) / SimHei 三号(16pt)
- 表格：三线表（上下粗线+表头下细线）
- 图表：占位符文字，用户手动插入截图
- 格式优先级：结课论文要求 > 学校通用规范 > 默认

### 论文章节模板

```
1. 需求分析    — 背景 + 角色 + 功能列表 + 用例图占位
2. 概要设计    — 架构图占位 + 技术选型 + 路由设计
3. 数据库设计  — ER图占位 + 表结构三线表
4. 系统实现    — 环境 + 关键代码 + 界面截图占位
5. 系统测试    — 黑盒测试用例三线表 + 结论
6. 项目部署    — DB配置 + BAT一键启动 + Git部署
7. AI工具使用  — 工具名 + 场景 + 代码占比 + 评价
8. 总结反思    — 完成情况 + 问题 + 收获 + 改进
```

---

## 阶段6：交付清单

### 🔴 STOP 5：交付前逐项检查

- [ ] `npm run build` 零错误
- [ ] `python run_tests.py` 全部 PASS
- [ ] `sql/init.sql` 可一键执行
- [ ] `start.bat` 双击能跑通
- [ ] `.gitignore` 忽略 .env / node_modules / __pycache__ / 含密钥的脚本
- [ ] README 含：启动说明 + GitHub 链接 + 技术栈 + 业务规则 + API 列表
- [ ] 论文含 8 章节 + 图表占位
- [ ] Git 历史 ≥ 2 个有意义的 commit
- [ ] 代码已推 GitHub

---

## 阶段7：经验沉淀

### 🔴 STOP 6：交付后生成两个 Skill

```
1. 技术避坑 Skill（错误→修复速查表）
2. 流程方法 Skill（本文档）
```

存入两个位置：
- `docs/` → GitHub 可见
- `~/.claude/projects/.../memory/` → Claude 自动读取

---

## 与 [[vue3-fastapi-fullstack-pitfalls]] 的协作

| 场景 | 查哪个 Skill |
|------|------|
| 不知道下一步做什么 | 本文档（流程） |
| 遇到具体报错不知道怎么修 | 避坑 Skill（技术字典） |
| 需要复制代码模板 | 避坑 Skill 第三章 |
| 需要发给用户的确认 Prompt | 本文档的 STOP 节点 |
| 交付前最后的检查 | 本文档阶段6 |
