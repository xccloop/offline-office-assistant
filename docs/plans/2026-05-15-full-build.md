# 离线办公助手 — 从零生成执行计划

> **For Hermes:** 分批派遣 Subagent 并行构建，Phase 1 先行，Phase 2+ 后续。

**Goal:** 从零生成可运行的 Electron + Vue 3 离线办公助手桌面应用

**Architecture:** Electron 主进程 + Vue 3 渲染进程，Pinia 状态管理，Element Plus UI，sql.js 本地数据库，TypeScript 严格模式

**Tech Stack:** Electron 28+, Vue 3 + Composition API + Pinia, Element Plus, Vite, sql.js, TypeScript, Vitest

---

## Phase 1: 核心框架 (地基 — 必须先行)

### Stream A: 项目脚手架 + 构建配置
- package.json (依赖、脚本、electron-builder 配置)
- vite.config.ts (主进程 + 渲染进程双配置)
- tsconfig.json (严格模式)
- .eslintrc.cjs, .prettierrc
- 目录结构 (src/main, src/preload, src/renderer, src/common)

### Stream B: Electron 主进程 + Preload
- src/main/index.ts (BrowserWindow, CSP, 安全配置)
- src/main/ipc/index.ts (IPC 注册中心)
- src/preload/index.ts (contextBridge API)
- electron 安全规范 (no nodeIntegration, contextIsolation true)

### Stream C: Vue 3 渲染进程骨架
- src/renderer/main.ts (Vue 入口)
- src/renderer/App.vue
- src/renderer/layouts/DefaultLayout.vue (侧边栏 + 内容区)
- src/renderer/router/index.ts (模块路由)
- src/renderer/stores/ (Pinia stores)

### Stream D: 主题系统 + i18n
- src/renderer/styles/themes/ (亮色/暗色主题 CSS 变量)
- src/renderer/stores/theme.ts (主题切换 Pinia store)
- src/renderer/i18n/index.ts (i18n 初始化)
- src/renderer/i18n/locales/zh-CN.ts, en.ts

### Stream E: 数据库层 (SQLite)
- src/main/database/index.ts (sql.js 初始化)
- src/main/database/schema.ts (核心表结构)
- src/main/ipc/database.ts (数据库 IPC 处理)

### Stream F: 插件系统 API
- src/plugins/types.ts (插件接口定义)
- src/main/ipc/plugins.ts (插件加载 IPC)
- src/renderer/stores/plugins.ts (插件状态)

---

## Phase 2-5: 功能模块 (可并行，依赖 Phase 1)

### Phase 2: 文档编辑器
- Markdown 编辑器 (CodeMirror 6)
- 富文本编辑器 (Quill/TipTap)
- 纯文本编辑器 (大文件流式读取)

### Phase 3: PDF 模块
- PDF 阅读器 (pdf.js)
- PDF 基础编辑

### Phase 4: 文件转换
- 格式转换 UI
- 压缩解压

### Phase 5: OCR
- Tesseract.js 集成
- OCR 识别页面

---

## 执行策略

1. **Phase 1 Streams A-F** → 6 个子 Agent 并行
2. 集成验证 → 确认 npm run dev 可启动
3. Phase 2-5 按需追加
