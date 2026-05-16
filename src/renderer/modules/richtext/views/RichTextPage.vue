<template>
  <div class="richtext-page">
    <!-- File toolbar -->
    <div class="toolbar file-toolbar">
      <div class="toolbar-group">
        <el-button size="small" @click="handleNew" :title="$t('richtext.newDoc')">
          <el-icon><Plus /></el-icon>
          <span class="btn-label">{{ $t('richtext.newDoc') }}</span>
        </el-button>
        <el-button size="small" @click="handleOpen" :title="$t('richtext.openFile')">
          <el-icon><FolderOpened /></el-icon>
          <span class="btn-label">{{ $t('richtext.openFile') }}</span>
        </el-button>
        <el-button size="small" type="primary" @click="handleSave" :title="$t('richtext.save')">
          <el-icon><Check /></el-icon>
          <span class="btn-label">{{ $t('richtext.save') }}</span>
        </el-button>
        <el-button size="small" @click="handleExport" :title="$t('richtext.exportHtml')">
          <el-icon><Download /></el-icon>
          <span class="btn-label">{{ $t('richtext.exportHtml') }}</span>
        </el-button>
      </div>
      <div class="toolbar-spacer" />
      <div v-if="currentFileName" class="file-name">
        <el-icon><Document /></el-icon>
        <span>{{ currentFileName }}</span>
        <span v-if="isDirty" class="dirty-marker">●</span>
      </div>
    </div>

    <!-- Formatting toolbar -->
    <div class="toolbar format-toolbar">
      <!-- Undo / Redo -->
      <div class="toolbar-group">
        <el-button size="small" text @click="editor.undo()" :title="$t('richtext.undo')">
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
        <el-button size="small" text @click="editor.redo()" :title="$t('richtext.redo')">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </div>
      <el-divider direction="vertical" />

      <!-- Bold / Italic / Underline / Strikethrough -->
      <div class="toolbar-group">
        <el-button size="small" text @click="editor.bold()" :title="$t('richtext.bold')">
          <strong>B</strong>
        </el-button>
        <el-button size="small" text @click="editor.italic()" :title="$t('richtext.italic')">
          <em>I</em>
        </el-button>
        <el-button size="small" text @click="editor.underline()" :title="$t('richtext.underline')">
          <u>U</u>
        </el-button>
        <el-button size="small" text @click="editor.strikethrough()" :title="$t('richtext.strikethrough')">
          <s>S</s>
        </el-button>
      </div>
      <el-divider direction="vertical" />

      <!-- Font size -->
      <div class="toolbar-group">
        <el-select
          size="small"
          :model-value="fontSize"
          @change="handleFontSizeChange"
          :placeholder="$t('richtext.fontSize')"
          style="width: 90px"
        >
          <el-option
            v-for="sz in fontSizes"
            :key="sz.value"
            :label="sz.label"
            :value="sz.value"
          />
        </el-select>
      </div>

      <!-- Text color -->
      <div class="toolbar-group">
        <el-color-picker
          size="small"
          :model-value="textColor"
          @change="handleTextColorChange"
          :predefine="predefineColors"
          show-alpha
        />
        <span class="color-label">{{ $t('richtext.textColor') }}</span>
      </div>
      <el-divider direction="vertical" />

      <!-- Alignment -->
      <div class="toolbar-group">
        <el-button size="small" text @click="editor.alignLeft()" :title="$t('richtext.alignLeft')">
          <el-icon><AlignLeft /></el-icon>
        </el-button>
        <el-button size="small" text @click="editor.alignCenter()" :title="$t('richtext.alignCenter')">
          <el-icon><AlignCenter /></el-icon>
        </el-button>
        <el-button size="small" text @click="editor.alignRight()" :title="$t('richtext.alignRight')">
          <el-icon><AlignRight /></el-icon>
        </el-button>
        <el-button size="small" text @click="editor.justify()" :title="$t('richtext.justify')">
          <el-icon><Operation /></el-icon>
        </el-button>
      </div>
      <el-divider direction="vertical" />

      <!-- Lists -->
      <div class="toolbar-group">
        <el-button size="small" text @click="editor.insertUnorderedList()" :title="$t('richtext.unorderedList')">
          <el-icon><List /></el-icon>
        </el-button>
        <el-button size="small" text @click="editor.insertOrderedList()" :title="$t('richtext.orderedList')">
          <el-icon><Tickets /></el-icon>
        </el-button>
      </div>
      <el-divider direction="vertical" />

      <!-- Insert: link / image / table -->
      <div class="toolbar-group">
        <el-button size="small" text @click="showLinkDialog = true" :title="$t('richtext.insertLink')">
          <el-icon><Link /></el-icon>
        </el-button>
        <el-button size="small" text @click="showImageDialog = true" :title="$t('richtext.insertImage')">
          <el-icon><Picture /></el-icon>
        </el-button>
        <el-button size="small" text @click="showTableDialog = true" :title="$t('richtext.insertTable')">
          <el-icon><Grid /></el-icon>
        </el-button>
      </div>
      <el-divider direction="vertical" />

      <!-- Clear formatting -->
      <div class="toolbar-group">
        <el-button size="small" text @click="editor.removeFormat()" :title="$t('richtext.clearFormat')">
          <el-icon><Remove /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Editor area -->
    <div class="editor-wrapper">
      <div
        ref="editorEl"
        class="editor-content"
        contenteditable="true"
        :data-placeholder="$t('richtext.placeholder')"
        @input="editor.onEditorInput()"
        @paste="editor.onEditorPaste($event)"
        @keydown="handleKeydown"
      />
    </div>

    <!-- Status bar -->
    <div class="status-bar">
      <span>{{ $t('richtext.words') }}: {{ wordCount }}</span>
      <span class="status-separator">|</span>
      <span>{{ $t('richtext.chars') }}: {{ charCount }}</span>
    </div>

    <!-- Insert Link Dialog -->
    <el-dialog
      v-model="showLinkDialog"
      :title="$t('richtext.insertLink')"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top" @submit.prevent="handleInsertLink">
        <el-form-item :label="$t('richtext.linkUrl')">
          <el-input v-model="linkUrl" placeholder="https://example.com" clearable />
        </el-form-item>
        <el-form-item :label="$t('richtext.linkText')">
          <el-input v-model="linkText" placeholder="Link display text" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLinkDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleInsertLink">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Insert Image Dialog -->
    <el-dialog
      v-model="showImageDialog"
      :title="$t('richtext.insertImage')"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top" @submit.prevent="handleInsertImage">
        <el-form-item :label="$t('richtext.imageUrl')">
          <el-input v-model="imageUrl" placeholder="https://example.com/image.png" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showImageDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleInsertImage">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Insert Table Dialog -->
    <el-dialog
      v-model="showTableDialog"
      :title="$t('richtext.insertTable')"
      width="360px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top" @submit.prevent="handleInsertTable">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('richtext.tableRows')">
              <el-input-number v-model="tableRows" :min="1" :max="10" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('richtext.tableCols')">
              <el-input-number v-model="tableCols" :min="1" :max="10" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showTableDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleInsertTable">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  Plus,
  FolderOpened,
  Check,
  Download,
  Document,
  RefreshLeft,
  RefreshRight,
  Operation,
  Switch,
  List,
  Tickets,
  Link,
  PictureFilled,
  Grid,
  Remove,
} from '@element-plus/icons-vue'
import { useRichText } from '@/renderer/composables/useRichText'

const { t } = useI18n()

// ── Composable ────────────────────────────────────────────────────

const editor = useRichText()

// Destructure reactive refs for template use
const {
  isDirty,
  currentFileName,
  wordCount,
  charCount,
  editorElement,
} = editor

// ── Template ref for the contentEditable element ───────────────────

const editorEl = ref<HTMLElement | null>(null)

onMounted(() => {
  editorElement.value = editorEl.value
  editor.applyContent()
})

onBeforeUnmount(() => {
  editorElement.value = null
})

// ── Font size state ────────────────────────────────────────────────

const fontSize = ref('3')
const fontSizes = [
  { label: '12px', value: '1' },
  { label: '14px', value: '2' },
  { label: '16px', value: '3' },
  { label: '18px', value: '4' },
  { label: '24px', value: '5' },
  { label: '32px', value: '6' },
  { label: '48px', value: '7' },
]

function handleFontSizeChange(val: string): void {
  fontSize.value = val
  editor.setFontSize(val)
}

// ── Text color state ───────────────────────────────────────────────

const textColor = ref('#303133')
const predefineColors = [
  '#303133',
  '#606266',
  '#909399',
  '#c0c4cc',
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#ff0000',
  '#ff6600',
  '#ffff00',
  '#00ff00',
  '#0000ff',
  '#800080',
  '#000000',
  '#ffffff',
]

function handleTextColorChange(val: string | null): void {
  if (val) {
    textColor.value = val
    editor.setTextColor(val)
  }
}

// ── Dialog state ───────────────────────────────────────────────────

const showLinkDialog = ref(false)
const linkUrl = ref('')
const linkText = ref('')

const showImageDialog = ref(false)
const imageUrl = ref('')

const showTableDialog = ref(false)
const tableRows = ref(3)
const tableCols = ref(3)

// ── Dialog handlers ────────────────────────────────────────────────

function handleInsertLink(): void {
  if (!linkUrl.value.trim()) return
  editor.insertLink(linkUrl.value.trim(), linkText.value.trim() || undefined)
  showLinkDialog.value = false
  linkUrl.value = ''
  linkText.value = ''
}

function handleInsertImage(): void {
  if (!imageUrl.value.trim()) return
  editor.insertImage(imageUrl.value.trim())
  showImageDialog.value = false
  imageUrl.value = ''
}

function handleInsertTable(): void {
  editor.insertTable(tableRows.value, tableCols.value)
  showTableDialog.value = false
  tableRows.value = 3
  tableCols.value = 3
}

// ── File operations ────────────────────────────────────────────────

async function handleNew(): Promise<void> {
  if (isDirty.value) {
    try {
      await ElMessageBox.confirm(
        'You have unsaved changes. Create a new document?',
        t('richtext.newDoc'),
        { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel'), type: 'warning' }
      )
    } catch {
      return
    }
  }
  editor.newDocument()
}

async function handleOpen(): Promise<void> {
  const success = await editor.openFile()
  if (!success) {
    ElMessage.error(t('richtext.loadError'))
  }
}

async function handleSave(): Promise<void> {
  const success = await editor.saveFile()
  if (success) {
    ElMessage.success(t('richtext.saveSuccess'))
  }
}

function handleExport(): void {
  editor.exportHtmlFile()
  ElMessage.success(t('richtext.exportSuccess'))
}

// ── Keyboard shortcuts ─────────────────────────────────────────────

function handleKeydown(event: KeyboardEvent): void {
  const mod = event.ctrlKey || event.metaKey

  if (mod && event.key === 's') {
    event.preventDefault()
    handleSave()
  } else if (mod && event.key === 'b') {
    event.preventDefault()
    editor.bold()
  } else if (mod && event.key === 'i') {
    event.preventDefault()
    editor.italic()
  } else if (mod && event.key === 'u') {
    event.preventDefault()
    editor.underline()
  }
}
</script>

<style scoped>
.richtext-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

/* ── Toolbar ────────────────────────────────────────────────────── */

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.file-toolbar {
  gap: 8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-spacer {
  flex: 1;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dirty-marker {
  color: var(--el-color-warning);
  font-size: 16px;
  line-height: 1;
}

.btn-label {
  margin-left: 4px;
}

.color-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.format-toolbar .el-button + .el-button {
  margin-left: 0;
}

.format-toolbar .el-divider--vertical {
  height: 20px;
  margin: 0 6px;
}

/* ── Editor ─────────────────────────────────────────────────────── */

.editor-wrapper {
  flex: 1;
  overflow: auto;
  padding: 24px 32px;
}

.editor-content {
  min-height: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 40px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  outline: none;
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-primary);
  word-break: break-word;
}

.editor-content:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}

/* Placeholder */
.editor-content:empty::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
  pointer-events: none;
}

.editor-content:empty:not(:focus)::before {
  content: attr(data-placeholder);
  color: var(--text-placeholder);
}

/* Rich text inner styles */
.editor-content :deep(h1) { font-size: 2em; margin: 0.67em 0; font-weight: 600; }
.editor-content :deep(h2) { font-size: 1.5em; margin: 0.75em 0; font-weight: 600; }
.editor-content :deep(h3) { font-size: 1.17em; margin: 0.83em 0; font-weight: 600; }
.editor-content :deep(h4) { margin: 1em 0; font-weight: 600; }
.editor-content :deep(p) { margin: 0.5em 0; }
.editor-content :deep(blockquote) {
  border-left: 4px solid var(--el-color-primary);
  padding-left: 16px;
  margin: 12px 0;
  color: var(--text-secondary);
}
.editor-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}
.editor-content :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}
.editor-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}
.editor-content :deep(td),
.editor-content :deep(th) {
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  min-width: 40px;
  text-align: left;
}
.editor-content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}
.editor-content :deep(ul),
.editor-content :deep(ol) {
  padding-left: 24px;
  margin: 8px 0;
}
.editor-content :deep(li) {
  margin: 4px 0;
}
.editor-content :deep(a) {
  color: var(--el-color-primary);
  text-decoration: underline;
}
.editor-content :deep(img) {
  max-width: 100%;
  height: auto;
}

/* ── Status bar ─────────────────────────────────────────────────── */

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
  user-select: none;
}

.status-separator {
  color: var(--border-color);
}
</style>
