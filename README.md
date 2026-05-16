# 离线办公助手

> 全功能离线办公套件 — 基于 Electron + Vue 3 + TypeScript
>
> 项目归属于向治昌

[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron)](https://www.electronjs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 简介

离线办公助手是一款完全离线可用的跨平台办公套件，无需网络连接即可完成文档编辑、PDF 阅读、OCR 识别、文件转换、笔记管理等日常办公任务。采用 MIT 协议开源。

## ✨ 核心功能

### 📝 文档编辑
| 模块 | 功能 | 状态 |
|------|------|------|
| **Markdown 编辑器** | CodeMirror 6 驱动的双栏编辑器，GFM 语法支持，实时渲染预览，Mermaid 图表（流程图/时序图/甘特图），代码高亮，导出 HTML/MD | ✅ |
| **富文本编辑器** | 粗体/斜体/下划线/删除线，字体字号颜色，对齐缩进，表格插入，超链接图片，导出 HTML | ✅ |
| **纯文本编辑器** | 大文件打开，多语言语法高亮，查找/替换（支持正则），撤销/重做，编码自动检测 | ✅ |
| **电子表格** | 公式计算，单元格格式，排序筛选，多工作表，xlsx/csv 导入导出 | 🚧 开发中 |
| **演示文稿** | 幻灯片编辑，过渡动画，主题模板，PDF 导出 | 🚧 开发中 |

### 📄 PDF 工具
| 功能 | 说明 | 状态 |
|------|------|------|
| **PDF 阅读器** | 基于 pdfjs-dist v4，支持缩略图导航、缩放控制（50%~400%）、键盘快捷键、拖拽打开 | ✅ |
| **PDF 编辑** | 页面提取、拆分合并、加密解密、添加水印标注 | 🚧 规划中 |

### 🔧 实用工具
| 模块 | 功能 | 状态 |
|------|------|------|
| **OCR 文字识别** | 基于 Tesseract.js 离线识别，中英文混合，自动版面分析，支持 PNG/JPG/WebP/BMP/TIFF | ✅ |
| **文件转换** | 图片格式互转、文档格式互转、编码转换、批量处理 | ✅ |
| **文件搜索** | 按文件名/内容全文搜索，正则支持，结果批量操作 | ✅ |
| **批量重命名** | 编号/替换/插入/删除，正则匹配，大小写转换，实时预览 | ✅ |
| **加密解密** | AES-256 对称加密，文件/文本加密，文件安全粉碎 | ✅ |
| **图片处理** | 裁剪/旋转/调整尺寸，滤镜（灰度/锐化/反色等），水印添加 | ✅ |
| **压缩解压** | 支持 ZIP/TAR/GZ，分卷压缩，加密压缩 | ✅ |
| **正则测试器** | 实时匹配高亮，捕获组显示，常用正则库，批量搜索替换 | ✅ |
| **代码片段** | 多语言高亮，分类管理，变量占位符 | ✅ |
| **JSON/XML 格式化** | 树形查看，语法高亮，格式验证，互转 | ✅ |
| **词典翻译** | 内置英汉/汉英词库，划词翻译（离线） | ✅ |
| **计算器** | 基本运算+科学计算，单位换算（长度/重量/面积/温度/货币） | ✅ |

### 📋 笔记与个人信息管理
| 模块 | 功能 | 状态 |
|------|------|------|
| **树形笔记** | 无限层级分类，标签系统，全文搜索，置顶，SQLite 存储 | ✅ |
| **日历日程** | 月视图日历，事件添加/编辑/删除，重复事件，导入导出 iCalendar | ✅ |
| **联系人管理** | 姓名/电话/邮箱/地址/生日，分组管理，快速搜索 | ✅ |
| **待办事项** | 优先级/标签/子任务，到期日期提醒 | ✅ |

### 🤖 自动化
| 功能 | 说明 | 状态 |
|------|------|------|
| **宏录制回放** | 录制键盘鼠标操作，循环执行，快捷键触发 | ✅ |
| **工作流编辑器** | 可视化拖拽步骤，一键批量处理文件，保存模板复用 | ✅ |

### 🎨 系统体验
- **主题系统**：亮色/暗色/跟随系统，CSS 变量体系
- **多语言**：简体中文 + English，vue-i18n 覆盖 180+ 翻译键
- **插件机制**：基于 JavaScript 的插件 API，可扩展新功能
- **数据持久化**：SQLite 本地存储（sql.js WASM），自动保存
- **完全离线**：所有功能无需网络连接

## 🏗️ 技术栈

### 前端
- **框架**：Vue 3.4（Composition API + `<script setup>`）
- **UI 组件库**：Element Plus 2.5
- **状态管理**：Pinia 2.1
- **路由**：Vue Router 4.3（Hash 模式，适配 Electron `file://` 协议）
- **国际化**：vue-i18n 9.10
- **编辑器**：CodeMirror 6（Markdown + 纯文本）
- **Markdown 渲染**：marked 12 + Mermaid 10 + highlight.js 11

### 桌面框架
- **Electron** 28（Node.js 集成，IPC 通信桥）
- **构建工具**：Vite 5（渲染进程）+ TypeScript 5.3（主进程编译）
- **打包**：electron-builder 24（生成 Windows .exe / NSIS 安装包）

### 核心库
| 功能 | 库 |
|------|-----|
| PDF 阅读 | pdfjs-dist 4.0 |
| OCR 识别 | tesseract.js 5.0 |
| 数据库 | sql.js 1.10（SQLite WebAssembly） |
| 表格处理 | xlsx 0.18 |
| 加密 | crypto-js 4.2 |
| 压缩 | archiver 7.0 / jszip 3.10 |

### 开发工具
- **代码规范**：ESLint + Prettier + TypeScript strict mode
- **测试**：Vitest + @vue/test-utils
- **类型检查**：vue-tsc

## 📂 项目结构

```
D:\Office/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 窗口创建、CSP 配置、应用生命周期
│   │   ├── database/            # SQLite 数据库（schema + 自动保存）
│   │   └── ipc/                 # IPC 通信桥（数据库/文件系统/转换/截图/Shell）
│   ├── preload/                 # 预加载脚本（contextBridge API 暴露）
│   ├── renderer/                # Vue 3 渲染进程
│   │   ├── modules/             # 功能模块（15 个，懒加载路由）
│   │   │   ├── home/            # 首页仪表盘
│   │   │   ├── markdown/        # Markdown 编辑器
│   │   │   ├── richtext/        # 富文本编辑器
│   │   │   ├── text/            # 纯文本编辑器
│   │   │   ├── spreadsheet/     # 电子表格（开发中）
│   │   │   ├── presentation/    # 演示文稿（开发中）
│   │   │   ├── pdf/             # PDF 阅读器
│   │   │   ├── converter/       # 文件转换
│   │   │   ├── ocr/             # OCR 文字识别
│   │   │   ├── tools/           # 实用工具集
│   │   │   ├── system/          # 系统工具
│   │   │   ├── pim/             # 个人信息管理
│   │   │   ├── notes/           # 笔记管理
│   │   │   ├── automation/      # 自动化与宏
│   │   │   └── settings/        # 系统设置
│   │   ├── i18n/                # 国际化（zh-CN / en）
│   │   ├── composables/         # Vue Composables（usePDF/useMarkdown/useNotes 等）
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── router/              # 路由配置
│   │   └── styles/              # CSS 变量、主题
│   ├── common/                  # 主进程/渲染进程共享代码
│   └── plugins/                 # 插件类型定义
├── docs/                        # 开发文档
├── resources/                   # 应用图标等资源
├── dist/                        # 构建输出（Vite + tsc）
├── release/                     # electron-builder 打包输出
└── package.json                 # 项目配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9
- Windows 10+ / macOS 11+ / Linux

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/xccloop/offline-office-assistant.git
cd offline-office-assistant

# 安装依赖
npm install

# 开发模式（主进程 + 渲染进程热更新）
npm run dev

# 生产构建
npm run build

# 直接启动
npm start
```

### 打包为安装包

```bash
# 构建 + 打包为 NSIS 安装包（Windows）
npm run package

# 仅打包为免安装目录版本
npx electron-builder --win --x64 --dir

# 输出在 release/ 目录
```

## 🔧 开发中遇到的难点

### 1. Electron file:// 协议下的 CSP 策略

**问题**：Electron 生产模式下使用 `file://` 协议加载 HTML，Vite 5 自动为 `<script>` 和 `<link>` 标签添加 `crossorigin` 属性，但在 `file://` 下浏览器认为跨域请求不合法，导致所有 JS/CSS 加载失败，页面白屏。

**解决**：编写自定义 Vite 插件，在 `transformIndexHtml` 钩子中用正则删除所有 `crossorigin` 属性。同时需要仔细配置 CSP 头：`style-src 'self' 'unsafe-inline'` 是必须的，因为 Element Plus 和 Vue scoped styles 依赖内联样式动态注入。

### 2. Mermaid 图表中文编码问题

**问题**：marked 库在渲染 Markdown 代码块时，会将 `{ } [ ]` 等字符转换为 HTML 实体（`&#123;` `&#125;`），直接传给 `mermaid.render()` 会导致语法解析失败。

**解决**：在调用 mermaid 渲染前，使用 `textarea.innerHTML = code; textarea.value` 的技巧反向解码 HTML 实体，确保传入的是纯文本 Mermaid 代码。

### 3. PDF.js v4 Worker 路径配置

**问题**：pdfjs-dist 4.x 使用 ESM worker（`.mjs` 文件），在 Vite + Electron 环境下 worker 的路径解析与打包配置需要精确对齐，否则运行时找不到 worker 文件。

**解决**：使用 `new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()` 动态生成 worker 路径，确保 Vite 打包时正确解析依赖。

### 4. SQLite WASM 在 Electron 中的集成

**问题**：sql.js 基于 WebAssembly，在浏览器环境和 Electron 主进程中的加载方式不同。主进程需要从文件系统读取 `.wasm` 文件，而非通过 HTTP 加载。

**解决**：在主进程初始化时，使用 `fs.readFileSync` 读取 wasm 二进制数据，通过 sql.js 的 `SQL()` 构造函数传入 wasm buffer，避开浏览器 HTTP 加载路径。

### 5. Electron 手动部署文件路径陷阱

**问题**：使用 `cp -r dist/* app/` 部署到 `resources/app/` 时，旧文件不会被删除（合并模式）。若之前删除了某个模块文件，旧编译产物仍会残留在 `app/` 目录中生效。同时 `package.json` 的 `main` 字段在源码中指向 `dist/app/main/index.js`，部署到 `resources/app/` 后路径层级不同。

**解决**：部署前先 `rm -rf app/main app/renderer app/preload` 清空旧文件再复制。`package.json` 的 `main` 改为相对路径 `main/index.js`，同时确保删除 `app.asar`（否则 asar 优先级高于 app/ 目录）。

### 6. Windows/WSL 环境下 Git Bash 中文编码

**问题**：Git Bash 默认使用 GBK 编码，当 Electron 主进程输出包含中文（如窗口标题 "秋徐晨 · 离线办公助手"）时，`child_process` 捕获的输出会因编码问题出现乱码或异常。

**解决**：在启动命令前添加 `export PYTHONIOENCODING=utf-8`，并确保 Node.js 的文件读写统一使用 UTF-8 编码。

### 7. 国际化文本量巨大

**问题**：项目包含 15 个功能模块，每个模块有大量 UI 文本需要双语翻译。手动维护中英文翻译超过 180+ 个条目，容易出现遗漏或不同步。

**解决**：建立 i18n 审计流程，使用 vue-i18n 的 fallback 机制（英文兜底），所有新增 UI 组件必须同时添加中英文字段。

## 📊 项目统计

- **总代码量**：约 35,000 行
- **功能模块**：15 个（13 个已实现，2 个开发中）
- **IPC 通道**：6 个模块（数据库/文件系统/插件/Shell/转换/截图）
- **数据库表**：6 个（笔记/联系人/待办/剪贴板/设置/代码片段）
- **i18n 翻译**：180+ 条（中文简体 + English）
- **懒加载路由**：15 条（按需加载，减小首屏体积）

## 📄 协议

MIT License — 详见 [LICENSE](LICENSE) 文件

---

