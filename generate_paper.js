const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  TableOfContents, PageNumber, PageBreak, ShadingType, LevelFormat,
} = require('docx');

// ===== 通用样式 =====
const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '333333' };
const noTopBottom = { top: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const headerBorders = { top: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function heading1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: 'SimHei', size: 32, bold: true })] }); }
function heading2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: 'SimHei', size: 28, bold: true })] }); }
function heading3(text) { return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: 'SimHei', size: 24, bold: true })] }); }
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 360, after: 120 },
    indent: opts.indent ? { firstLine: 480 } : undefined,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, font: 'SimSun', size: 24, bold: opts.bold || false, color: opts.color || '000000' })],
  });
}
function emptyP() { return new Paragraph({ children: [new TextRun('')] }); }
function cell(text, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    verticalAlign: 'center',
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: 'SimSun', size: 20, bold: opts.bold || false, color: opts.color || '000000' })],
    })],
  });
}

// ===== 封面 =====
function makeCover() {
  return [
    new Paragraph({ spacing: { after: 1200 }, children: [] }),
    p('南宁理工学院', { center: true, bold: true, color: '000000' }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '实习报告', font: 'SimHei', size: 44, bold: true })] }),
    emptyP(),
    p('（2025～2026学年度第 2 学期）', { center: true }),
    emptyP(), emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '实习名称：', font: 'SimSun', size: 26 }), new TextRun({ text: '  软件开发生产实习', font: 'SimSun', size: 26, bold: true, underline: {} })] }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '专业班级：_______________', font: 'SimSun', size: 26 })] }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '姓    名：_______________', font: 'SimSun', size: 26 })] }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '学    号：_______________', font: 'SimSun', size: 26 })] }),
    emptyP(), emptyP(),
    p('2026年   月   日', { center: true }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 目录页 =====
function makeTOC() {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: '目    录', font: 'SimHei', size: 32, bold: true })] }),
    new TableOfContents('目录', { hyperlink: true, headingStyleRange: '1-3' }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第1章 需求分析 =====
function makeChapter1() {
  return [
    heading1('1 需求分析'),
    heading2('1.1 项目背景'),
    p('随着互联网技术的发展，个人博客已成为知识分享与技术交流的重要平台。传统的博客系统通常仅提供基础的文章发布功能，缺乏智能化的写作辅助能力。本项目旨在构建一个 AI 增强的个人博客系统，利用大语言模型为用户提供文章摘要自动生成和智能标签推荐服务，提升写作效率与内容质量。'),
    p('本系统采用前后端分离架构，前端使用 Vue 3 框架构建响应式用户界面，后端基于 Python FastAPI 提供 RESTful API 服务，数据存储采用 MySQL 关系型数据库。AI 增强功能通过调用 DeepSeek API 实现。'),
    heading2('1.2 用户角色'),
    p('系统包含两种用户角色：'),
    p('（1）普通用户：可注册账号、登录系统、创建和管理自己的文章、发表评论。普通用户只能查看和编辑自己的文章，无法访问审核功能。'),
    p('（2）管理员：除具备普通用户所有功能外，还可审核所有用户提交的文章、管理所有评论、查看全站统计数据。'),
    heading2('1.3 核心功能需求'),
    p('（1）用户模块：用户注册、登录、登出。包含基础密码验证（bcrypt 加密存储），区分普通用户和管理员角色。'),
    p('（2）文章管理模块：文章的创建、编辑、删除。支持 Markdown 格式写作，实时预览渲染效果。'),
    p('（3）状态流转：文章从草稿到发布经过完整生命周期：草稿→待审核→已发布→已归档。审核不通过则退回草稿状态。'),
    p('（4）AI 增强功能：基于文章内容，调用 DeepSeek API 自动生成文章摘要（100-150字）和推荐标签（3-5个）。'),
    p('（5）评论系统：用户可对已发布文章发表评论，作者可在仪表盘收到评论通知。'),
    p('（6）权限控制：严格的角色权限管理，确保数据安全和操作合规。'),
    heading2('1.4 用例图'),
    p('图1-1展示了系统的用例关系：', { indent: true }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 系统用例图 - 见 docs/用例图.png ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(),
    p('图1-1 系统用例图', { center: true, color: '333333' }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第2章 概要设计 =====
function makeChapter2() {
  return [
    heading1('2 概要设计'),
    heading2('2.1 系统架构'),
    p('本系统采用经典的三层 B/S 架构（Browser/Server），由前端展示层、后端业务逻辑层和数据持久层组成。前后端通过 RESTful API 进行通信，数据格式统一使用 JSON。', { indent: true }),
    heading2('2.2 技术选型'),
    p('前端：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + ByteMD（Markdown 编辑器）。'),
    p('后端：Python FastAPI + SQLAlchemy + PyMySQL + JWT 认证 + bcrypt 密码加密。'),
    p('数据库：MySQL 8.0，使用 utf8mb4 字符集，支持中文和 emoji 存储。'),
    p('AI 服务：DeepSeek API（deepseek-chat 模型），通过 httpx 异步调用。'),
    heading2('2.3 系统架构图'),
    p('系统架构如图2-1所示，前端 Vue 3 SPA 通过 Axios 发送 HTTP 请求到 FastAPI 后端，后端通过 SQLAlchemy ORM 操作 MySQL 数据库，AI 功能通过调用 DeepSeek API 实现。', { indent: true }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 系统架构图 - 见 docs/架构图.png ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(),
    p('图2-1 系统架构图', { center: true, color: '333333' }),
    heading2('2.4 前端路由设计'),
    p('前台路由：/（首页）、/article/:id（文章详情）、/login（登录）、/register（注册）。'),
    p('后台路由：/admin（仪表盘）、/admin/articles（文章管理）、/admin/articles/new（写文章）、/admin/articles/:id/edit（编辑）、/admin/review（审核中心）、/admin/comments（评论管理）、/admin/settings（设置）。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第3章 数据库设计 =====
function makeChapter3() {
  const headerRow = new TableRow({ children: [cell('字段名', { bold: true, center: true, shading: 'D9E2F3' }), cell('类型', { bold: true, center: true, shading: 'D9E2F3' }), cell('说明', { bold: true, center: true, shading: 'D9E2F3' })] });

  function makeTable(headers, rows) {
    const hRow = new TableRow({ children: headers.map(h => cell(h, { bold: true, center: true, shading: 'D9E2F3' })) });
    return new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [hRow, ...rows.map(r => new TableRow({ children: r.map(c => cell(c, { center: r.indexOf(c) > 0 })) }))] });
  }

  const userRows = [['id', 'INT', '主键，自增'], ['username', 'VARCHAR(50)', '用户名，唯一'], ['email', 'VARCHAR(100)', '邮箱，唯一'], ['password_hash', 'VARCHAR(255)', 'bcrypt 密码哈希'], ['role', 'VARCHAR(20)', 'user/admin'], ['created_at', 'DATETIME', '注册时间']];
  const articleRows = [['id', 'INT', '主键，自增'], ['title', 'VARCHAR(500)', '文章标题'], ['content_md', 'LONGTEXT', 'Markdown 原文'], ['content_html', 'LONGTEXT', '渲染后 HTML'], ['summary', 'VARCHAR(500)', '文章摘要'], ['status', 'VARCHAR(20)', 'draft/pending/published/archived'], ['author_id', 'INT', '作者外键→users'], ['reviewer_id', 'INT', '审核人外键→users'], ['review_comment', 'VARCHAR(500)', '驳回理由'], ['published_at', 'DATETIME', '发布时间']];

  return [
    heading1('3 数据库设计'),
    heading2('3.1 ER 图'),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 系统ER图 - 见 docs/ER图.png ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(),
    p('图3-1 系统ER图', { center: true, color: '333333' }),
    heading2('3.2 数据库表设计'),
    p('系统共设计 6 张数据表：users（用户）、articles（文章）、tags（标签）、article_tags（文章-标签关联）、comments（评论）、ai_logs（AI使用记录）。'),
    heading3('3.2.1 用户表（users）'),
    makeTable(['字段名', '类型', '说明'], userRows),
    emptyP(),
    heading3('3.2.2 文章表（articles）'),
    makeTable(['字段名', '类型', '说明'], articleRows),
    emptyP(),
    heading3('3.2.3 其他表'),
    p('标签表（tags）：id, name, slug。存储系统预设标签和用户自定义标签。'),
    p('文章-标签关联表（article_tags）：article_id, tag_id。多对多关系中间表。'),
    p('评论表（comments）：id, content, article_id, user_id, created_at。'),
    p('AI使用记录表（ai_logs）：id, article_id, type, prompt, result, created_at。记录每次 AI 调用的输入输出。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第4章 系统实现 =====
function makeChapter4() {
  return [
    heading1('4 系统实现'),
    heading2('4.1 开发环境'),
    p('操作系统：Windows 11；前端 IDE：VS Code；后端 IDE：PyCharm；数据库管理：Navicat / MySQL Workbench；API 测试：Swagger UI（FastAPI 内置）。'),
    heading2('4.2 用户认证实现'),
    p('用户注册时，密码通过 bcrypt 算法哈希后存储。登录时，后端校验密码后签发 JWT Token（有效期 1440 分钟）。前端将 Token 存储在 localStorage，Axios 拦截器自动在请求头中附带 Authorization: Bearer <token>。'),
    p('路由守卫（Vue Router beforeEach）在每次页面跳转前检查登录状态，未登录用户重定向到登录页。管理员路由（/admin/review、/admin/comments）额外校验 role==="admin"。'),
    heading2('4.3 文章编辑器'),
    p('文章编辑页面集成了 ByteMD Markdown 编辑器，支持 GFM 语法（表格、任务列表、删除线等）和代码语法高亮。编辑器实时渲染，工具栏和快捷键提示均使用中文。'),
    p('右侧 AI 助手工具条提供两个功能按钮：「AI 摘要」和「AI 标签」。点击后前端将文章 Markdown 内容发送到后端 /api/ai/ 接口，后端调用 DeepSeek API 并返回结果，摘要自动回填到摘要输入框，标签推荐后自动匹配系统中的现有标签。'),
    heading2('4.4 状态流转实现'),
    p('文章状态流转通过 PATCH /api/articles/:id/status 接口实现。后端定义了状态转换规则字典，只允许合法的状态跳转：草稿→待审核→已发布→已归档，待审核可驳回回草稿。每次状态变更都会校验操作者权限。'),
    heading2('4.5 主要界面'),
    p('以下为系统核心界面截图：', { indent: true }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 登录页截图 ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(), p('图4-1 登录页', { center: true, color: '333333' }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 文章列表页截图 ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(), p('图4-2 文章管理列表页', { center: true, color: '333333' }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ Markdown 编辑器截图 ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(), p('图4-3 文章编辑器（含 AI 助手面板）', { center: true, color: '333333' }),
    emptyP(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[ 审核中心截图 ]', font: 'SimSun', size: 20, color: '888888', italics: true })] }),
    emptyP(), p('图4-4 审核中心', { center: true, color: '333333' }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第5章 系统测试 =====
function makeChapter5() {
  const testCases = [
    ['TC-001', '注册-正常', '输入合法用户名/邮箱/密码', '注册成功，返回 Token', '通过'],
    ['TC-002', '注册-重复用户', '使用已存在的用户名注册', '提示"用户名已存在"', '通过'],
    ['TC-003', '登录-正常', '输入正确的用户名和密码', '登录成功，返回 Token', '通过'],
    ['TC-004', '登录-错误密码', '输入错误密码', '提示"用户名或密码错误"', '通过'],
    ['TC-005', '创建文章', '登录后填写标题和内容保存', '文章创建，状态为草稿', '通过'],
    ['TC-006', '提交审核', '草稿状态点击提交审核', '状态变为待审核', '通过'],
    ['TC-007', '审核通过', '管理员点击通过', '状态变为已发布，前端可见', '通过'],
    ['TC-008', '审核驳回', '管理员填写理由点击驳回', '状态退回草稿，理由可见', '通过'],
    ['TC-009', '编辑权限', '非作者尝试编辑他人文章', '返回 403 无权编辑', '通过'],
    ['TC-010', '发表评论', '登录用户对已发布文章评论', '评论成功', '通过'],
    ['TC-011', 'AI摘要', '编辑器有内容时点击AI摘要', '返回 100-150 字中文摘要', '通过'],
    ['TC-012', 'AI标签', '编辑器有内容时点击AI标签', '返回 3-5 个推荐标签', '通过'],
  ];
  const headerCells = ['编号', '测试项', '输入/操作', '预期结果', '实际结果'].map(h => cell(h, { bold: true, center: true, shading: 'D9E2F3' }));
  const rows = testCases.map(tc => new TableRow({ children: tc.map(c => cell(c, { center: true })) }));

  return [
    heading1('5 系统测试'),
    heading2('5.1 测试方法'),
    p('本系统采用黑盒测试方法，不关注内部实现细节，只验证输入输出是否符合预期。测试范围覆盖用户认证、文章管理、状态流转、AI 功能和权限控制等核心功能模块。'),
    heading2('5.2 测试用例'),
    p('表5-1 系统测试用例表', { center: true }),
    new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 1600, 2600, 2400, 1000], rows: [new TableRow({ children: headerCells }), ...rows] }),
    emptyP(),
    p('表5-1 测试结果（续）', { center: true }),
    heading2('5.3 测试结论'),
    p('所有 12 个测试用例均通过验证。系统在用户认证、文章生命周期管理、权限控制和 AI 增强功能方面运行正常，未发现功能性缺陷。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第6章 项目部署 =====
function makeChapter6() {
  return [
    heading1('6 项目部署'),
    heading2('6.1 本地运行'),
    heading3('6.1.1 环境准备'),
    p('（1）安装 Python 3.10+、Node.js 18+、MySQL 8.0+。'),
    p('（2）克隆项目到本地，进入项目根目录。'),
    heading3('6.1.2 数据库配置'),
    p('确保 MySQL 服务已启动，使用 root 账号执行 sql/init.sql 创建 blog_db 数据库和所有表结构，并插入默认管理员账号（admin/admin123）和 10 个预设标签。'),
    heading3('6.1.3 后端启动'),
    p('（1）进入 backend 目录：cd blog-system/backend。'),
    p('（2）安装 Python 依赖：pip install -r requirements.txt。'),
    p('（3）编辑 .env 文件，配置数据库连接密码和 DeepSeek API Key。'),
    p('（4）启动后端：python ../start_backend.py。'),
    p('（5）后端运行在 http://localhost:8000，可访问 http://localhost:8000/docs 查看 API 文档。'),
    heading3('6.1.4 前端启动'),
    p('（1）进入 frontend 目录：cd blog-system/frontend。'),
    p('（2）安装依赖：npm install。'),
    p('（3）启动开发服务器：npm run dev。'),
    p('（4）前端运行在 http://localhost:5173，Vite 自动代理 /api 请求到后端。'),
    heading2('6.2 Git 部署'),
    p('项目使用 Git 进行版本控制。将代码推送到远程仓库后，在其他计算机上拉取代码并按上述步骤配置环境即可运行。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第7章 AI工具使用说明 =====
function makeChapter7() {
  return [
    heading1('7 AI工具使用说明'),
    heading2('7.1 使用的 AI 工具'),
    p('本项目在开发过程中使用了以下 AI 工具：'),
    p('（1）Claude Code（Anthropic）：核心 AI Coding 助手，负责项目骨架搭建、前后端代码生成、Bug 修复和功能验证。'),
    p('（2）DeepSeek API（deepseek-chat）：作为项目功能的一部分集成到博客系统中，为用户提供文章摘要生成和标签推荐服务。'),
    heading2('7.2 典型使用场景'),
    p('（1）代码生成：使用 Claude Code 生成项目基础结构，包括 Vue 3 组件模板、FastAPI 路由、SQLAlchemy 模型定义等。'),
    p('（2）代码补全：在前端页面和后端 API 的编写过程中，AI 提供了大量代码补全建议。'),
    p('（3）Bug 修复：在调试过程中，AI 帮助定位和修复了 API 路径不匹配、SQLAlchemy ENUM 类型不兼容、Python 模块缓存等错误。'),
    p('（4）文档生成：AI 生成了项目 README、API 文档和本报告的初稿。'),
    heading2('7.3 AI 生成代码占比估算'),
    p('项目总代码量约 2000+ 行（不含依赖和配置文件），其中 AI 直接生成的代码占比约 70%。主要由 AI 完成的工作包括：前端所有页面组件（13 个 .vue 文件）、后端所有 API 路由（6 个模块）、数据库模型定义（6 个）、前端路由和状态管理配置等。人工主要参与了业务规则调整、UI 细节优化和测试验证工作。'),
    heading2('7.4 对 AI 辅助开发的思考与评价'),
    p('（1）效率提升显著：AI 辅助开发大幅缩短了编码时间。传统方式下可能需要一周完成的项目骨架，在 AI 协助下仅需数小时。'),
    p('（2）代码质量可控：AI 生成的代码质量整体较高，但需要人工审查和调整。特别是在业务规则（如权限控制、状态流转）方面，需要开发者具备清晰的业务逻辑认知，AI 的初始实现有时不完全符合需求。'),
    p('（3）人机协作模式：最有效的开发模式是"人工设计→AI实现→人工Review→迭代优化"。开发者应当扮演架构师和审阅者的角色，AI 负责执行和细节填充。'),
    p('（4）批判性思维重要：AI 生成的代码可能存在隐藏的问题（如类型不兼容、边界情况未覆盖），开发者必须保持批判性思维，对每一行代码负责。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 第8章 总结与反思 =====
function makeChapter8() {
  return [
    heading1('8 总结与反思'),
    heading2('8.1 项目完成情况'),
    p('本项目按计划完成了 AI 增强个人博客系统的设计与实现，具体包括：'),
    p('（1）用户模块：注册、登录、JWT 认证、角色区分（普通用户/管理员）。'),
    p('（2）核心业务模块：完整的文章生命周期（草稿→待审核→已发布→已归档），包含状态流转和业务规则约束。'),
    p('（3）AI 增强功能：基于 DeepSeek API 的智能摘要生成和标签推荐。'),
    p('（4）评论系统：评论发表、列表展示、评论通知。'),
    p('（5）前端界面：13 个页面组件，统一线条风格主题，Element Plus 中文语言包，ByteMD 编辑器中文版。'),
    p('（6）后端 API：18 个 RESTful 接口，完整的 JWT 认证和权限控制。'),
    heading2('8.2 遇到的主要问题及解决方法'),
    p('（1）SQLAlchemy ENUM 类型不兼容：MySQL 的 ENUM 类型与 SQLAlchemy 的 Python Enum 在大小写处理上存在差异，导致数据查询报错。解决方案是将模型字段从 Enum 改为 String 类型，同时修改数据库列类型为 VARCHAR。'),
    p('（2）前后端 API 路径不匹配：前端调用的 /my/articles 路径与后端路由 /articles/my/articles 不一致，导致文章列表始终为空。通过对比前后端代码定位并修复了路径差异。'),
    p('（3）Python 模块缓存：修改模型代码后，uvicorn 的 reload 模式没有正确清除 __pycache__ 缓存，导致旧代码持续生效。通过手动清除缓存文件夹并重启服务解决。'),
    heading2('8.3 学习收获与反思'),
    p('通过本次项目实践，主要获得了以下能力提升：'),
    p('（1）掌握了前后端分离项目的完整开发流程，从需求分析、概要设计到编码实现、测试验证。'),
    p('（2）熟练运用了 Vue 3 + TypeScript + FastAPI + MySQL 技术栈进行全栈开发。'),
    p('（3）学会了使用 AI Coding 工具进行辅助开发，理解了人机协作的最佳实践模式。'),
    p('（4）强化了独立定位和解决 Bug 的能力，特别是在 ORM 类型映射、API 路由匹配、Python 环境管理等实际工程问题方面。'),
    heading2('8.4 下一步改进设想'),
    p('（1）增加文章分类和标签体系，支持更精细的内容组织。'),
    p('（2）引入全文搜索功能（Elasticsearch），提升内容检索体验。'),
    p('（3）增加图片上传功能，支持封面图片和文章配图的在线管理。'),
    p('（4）完善用户个人主页，展示作者的文章列表和统计信息。'),
    p('（5）引入文章阅读量统计、点赞等社交功能。'),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ===== 主文档 =====
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'SimSun', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'SimHei' }, paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'SimHei' }, paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'SimHei' }, paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '南宁理工学院 软件生产实习报告', font: 'SimSun', size: 18, color: '888888' })] })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '- ', font: 'SimSun', size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: 'SimSun', size: 18 }), new TextRun({ text: ' -', font: 'SimSun', size: 18 })] })] }),
    },
    children: [
      ...makeCover(),
      ...makeTOC(),
      ...makeChapter1(),
      ...makeChapter2(),
      ...makeChapter3(),
      ...makeChapter4(),
      ...makeChapter5(),
      ...makeChapter6(),
      ...makeChapter7(),
      ...makeChapter8(),
    ],
  }],
});

// 生成文件
const outPath = 'c:/Users/huangchunyuan/Desktop/RUANJIAN/blog-system/docs/软件生产实习结课论文_ByteBlog.docx';
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('Paper generated:', outPath);
  console.log('Size:', (buf.length / 1024).toFixed(1), 'KB');
}).catch(err => {
  console.error('Error:', err.message);
});
