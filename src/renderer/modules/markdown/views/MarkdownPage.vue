<template>
  <div class="markdown-page">
    <!-- Toolbar -->
    <div class="markdown-toolbar">
      <div class="toolbar-left">
        <el-button-group class="action-group">
          <el-tooltip :content="$t('markdown.toolbar.save')" placement="bottom">
            <el-button size="small" @click="handleSave">
              <el-icon><FolderOpened /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.exportHtml')" placement="bottom">
            <el-button size="small" @click="handleExportHtml">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.exportPdf')" placement="bottom">
            <el-button size="small" disabled @click="handleExportPdf">
              <el-icon><Printer /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group class="action-group">
          <el-tooltip :content="$t('markdown.toolbar.bold')" placement="bottom">
            <el-button size="small" @click="insertFormat('**', '**', 'bold text')">
              <strong>B</strong>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.italic')" placement="bottom">
            <el-button size="small" @click="insertFormat('*', '*', 'italic text')">
              <em>I</em>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.heading')" placement="bottom">
            <el-button size="small" @click="insertLineStart('## ', 'Heading')">
              H
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.code')" placement="bottom">
            <el-button size="small" @click="insertFormat('`', '`', 'code')">
              &lt;/&gt;
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.link')" placement="bottom">
            <el-button size="small" @click="insertLink">
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.image')" placement="bottom">
            <el-button size="small" @click="insertImage">
              <el-icon><PictureFilled /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.list')" placement="bottom">
            <el-button size="small" @click="insertLineStart('- ', 'List item')">
              <el-icon><List /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('markdown.toolbar.table')" placement="bottom">
            <el-button size="small" @click="insertTable">
              <el-icon><Grid /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-switch
          v-model="showPreview"
          active-text="Preview"
          size="small"
        />
      </div>
    </div>

    <!-- Editor + Preview Split Pane -->
    <div class="markdown-body" :class="{ 'preview-hidden': !showPreview }">
      <!-- CodeMirror Editor Panel -->
      <div class="editor-panel">
        <div ref="editorContainer" class="editor-container"></div>
      </div>

      <!-- Preview Panel -->
      <div v-if="showPreview" class="preview-panel">
        <div class="preview-header">
          <span class="preview-title">{{ $t('markdown.preview.title') }}</span>
        </div>
        <div
          class="preview-content markdown-rendered"
          v-html="renderedHtml"
        ></div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="markdown-statusbar">
      <span class="status-item">{{ $t('markdown.stats.words') }}: {{ wordCount }}</span>
      <span class="status-item">{{ $t('markdown.stats.chars') }}: {{ charCount }}</span>
      <span class="status-item">{{ $t('markdown.stats.lines') }}: {{ lineCount }}</span>
      <span v-if="isDirty" class="status-item status-dirty">
        {{ $t('common.unsaved') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  FolderOpened,
  Download,
  Printer,
  Link,
  PictureFilled,
  List,
  Grid,
} from '@element-plus/icons-vue'
import { useMarkdown } from '@/renderer/composables/useMarkdown'

const { t } = useI18n()

const {
  renderedHtml,
  wordCount,
  lineCount,
  charCount,
  isDirty,
  editorViewRef,
  initEditor,
  destroyEditor,
  saveMarkdownFile,
  exportHtmlFile,
} = useMarkdown()

/** Toggle preview panel visibility */
const showPreview = ref(true)

/** Container element for the CodeMirror editor */
const editorContainer = ref<HTMLElement | null>(null)

/** Sample initial content to demonstrate features */
const sampleContent = `# Welcome to Markdown Editor

## Features

- **GitHub Flavored Markdown** support
- *Real-time* preview
- Mermaid diagram rendering
- Code syntax highlighting

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| GFM | ✓ |
| Mermaid | ✓ |
| Export | ✓ |

## Mermaid Diagram

\`\`\`mermaid
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do it]
  B -->|No| D[Skip]
  C --> E[Done]
  D --> E
\`\`\`

> Blockquote: Markdown is awesome!
`

/**
 * Initialize the CodeMirror editor on mount.
 */
onMounted(async () => {
  await nextTick()
  if (editorContainer.value) {
    initEditor(
      editorContainer.value,
      t('markdown.editor.placeholder'),
      sampleContent
    )
  }
})

/**
 * Clean up the editor on unmount.
 */
onBeforeUnmount(() => {
  destroyEditor()
})

/**
 * Save the current document as a .md file.
 */
function handleSave(): void {
  saveMarkdownFile()
  ElMessage.success(t('markdown.messages.saved'))
}

/**
 * Export the rendered document as an HTML file.
 */
function handleExportHtml(): void {
  try {
    exportHtmlFile()
    ElMessage.success(t('markdown.messages.exportSuccess'))
  } catch {
    ElMessage.error(t('markdown.messages.exportFailed'))
  }
}

/**
 * PDF export placeholder.
 */
function handleExportPdf(): void {
  ElMessage.info(t('markdown.messages.pdfComingSoon'))
}

/**
 * Get current cursor position or selection range.
 */
function getSelectionRange(): { from: number; to: number; text: string } {
  const view = editorViewRef.value
  if (!view) return { from: 0, to: 0, text: '' }
  const { from, to } = view.state.selection.main
  const text = view.state.sliceDoc(from, to)
  return { from, to, text }
}

/**
 * Replace the current selection with new text.
 */
function replaceSelection(text: string, cursorOffset = 0): void {
  const view = editorViewRef.value
  if (!view) return
  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length + cursorOffset },
  })
  view.focus()
}

/**
 * Insert text with a wrapper (e.g., **bold**, `code`).
 */
function insertFormat(
  prefix: string,
  suffix: string,
  placeholder: string
): void {
  const view = editorViewRef.value
  if (!view) return
  const { from, to, text } = getSelectionRange()

  if (text) {
    replaceSelection(`${prefix}${text}${suffix}`)
  } else {
    replaceSelection(`${prefix}${placeholder}${suffix}`, -suffix.length - placeholder.length)
  }
}

/**
 * Insert text at the start of the current line.
 */
function insertLineStart(prefix: string, placeholder: string): void {
  const view = editorViewRef.value
  if (!view) return
  const { from } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const lineStart = line.from

  view.dispatch({
    changes: { from: lineStart, insert: prefix },
    selection: { anchor: lineStart + prefix.length },
  })
  view.focus()
}

/**
 * Insert a link [text](url).
 */
function insertLink(): void {
  const { text } = getSelectionRange()
  if (text) {
    replaceSelection(`[${text}](url)`, -4)
  } else {
    replaceSelection('[link text](url)', -4)
  }
}

/**
 * Insert an image ![alt](url).
 */
function insertImage(): void {
  const { text } = getSelectionRange()
  if (text) {
    replaceSelection(`![${text}](url)`, -4)
  } else {
    replaceSelection('![alt text](url)', -4)
  }
}

/**
 * Insert a basic table template.
 */
function insertTable(): void {
  const table = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell     | Cell     | Cell     |
| Cell     | Cell     | Cell     |
`.trim()
  replaceSelection(`\n${table}\n`)
}
</script>

<style scoped>
.markdown-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  background: var(--bg-primary, #fff);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e4e7ed);
}

/* ── Toolbar ── */
.markdown-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-light, #ebeef5);
  background: var(--bg-secondary, #f5f7fa);
  flex-shrink: 0;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-group {
  margin: 0 2px;
}

/* ── Split Body ── */
.markdown-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.markdown-body.preview-hidden .editor-panel {
  flex: 1;
}

/* ── Editor Panel ── */
.editor-panel {
  flex: 1;
  min-width: 0;
  border-right: 1px solid var(--border-light, #ebeef5);
}

.markdown-body.preview-hidden .editor-panel {
  border-right: none;
}

.editor-container {
  height: 100%;
  overflow: hidden;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-container :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  line-height: 1.6;
}

.editor-container :deep(.cm-content) {
  padding: 12px 16px;
}

/* ── Preview Panel ── */
.preview-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
}

.preview-header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-light, #ebeef5);
  background: var(--bg-secondary, #f5f7fa);
  flex-shrink: 0;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #606266);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* ── Markdown Rendered Styles ── */
.markdown-rendered :deep(h1),
.markdown-rendered :deep(h2),
.markdown-rendered :deep(h3),
.markdown-rendered :deep(h4),
.markdown-rendered :deep(h5),
.markdown-rendered :deep(h6) {
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary, #303133);
}

.markdown-rendered :deep(h1) {
  font-size: 1.8em;
  border-bottom: 2px solid var(--border-light, #ebeef5);
  padding-bottom: 8px;
}

.markdown-rendered :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-light, #ebeef5);
  padding-bottom: 6px;
}

.markdown-rendered :deep(h3) { font-size: 1.25em; }
.markdown-rendered :deep(h4) { font-size: 1.1em; }

.markdown-rendered :deep(p) {
  margin: 8px 0;
  line-height: 1.7;
  color: var(--text-primary, #303133);
}

.markdown-rendered :deep(a) {
  color: var(--el-color-primary, #409eff);
  text-decoration: none;
}

.markdown-rendered :deep(a:hover) {
  text-decoration: underline;
}

.markdown-rendered :deep(blockquote) {
  border-left: 4px solid var(--el-color-primary, #409eff);
  padding: 8px 16px;
  margin: 12px 0;
  color: var(--text-secondary, #606266);
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 0 4px 4px 0;
}

.markdown-rendered :deep(ul),
.markdown-rendered :deep(ol) {
  padding-left: 24px;
  margin: 8px 0;
}

.markdown-rendered :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
}

.markdown-rendered :deep(code) {
  background: var(--bg-secondary, #f5f7fa);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.markdown-rendered :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
  line-height: 1.5;
}

.markdown-rendered :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.9em;
}

.markdown-rendered :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-rendered :deep(th),
.markdown-rendered :deep(td) {
  border: 1px solid var(--border-color, #e4e7ed);
  padding: 8px 12px;
  text-align: left;
}

.markdown-rendered :deep(th) {
  background: var(--bg-secondary, #f5f7fa);
  font-weight: 600;
}

.markdown-rendered :deep(tr:nth-child(even)) {
  background: var(--bg-secondary, #f5f7fa);
}

.markdown-rendered :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.markdown-rendered :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color, #e4e7ed);
  margin: 20px 0;
}

/* ── Mermaid ── */
.markdown-rendered :deep(.mermaid-container) {
  text-align: center;
  margin: 16px 0;
  padding: 12px;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-rendered :deep(.mermaid-container svg) {
  max-width: 100%;
  height: auto;
}

.markdown-rendered :deep(.mermaid-error) {
  color: var(--el-color-danger, #f56c6c);
  background: #fef0f0;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #fde2e2;
}

/* ── Status Bar ── */
.markdown-statusbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 16px;
  border-top: 1px solid var(--border-light, #ebeef5);
  background: var(--bg-secondary, #f5f7fa);
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-placeholder, #c0c4cc);
}

.status-item {
  white-space: nowrap;
}

.status-dirty {
  color: var(--el-color-warning, #e6a23c);
  font-weight: 500;
  margin-left: auto;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .markdown-body {
    flex-direction: column;
  }

  .editor-panel {
    flex: none;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid var(--border-light, #ebeef5);
  }

  .preview-panel {
    flex: 1;
  }

  .markdown-toolbar {
    padding: 4px 8px;
    gap: 4px;
  }

  .toolbar-left {
    gap: 2px;
  }
}
</style>
