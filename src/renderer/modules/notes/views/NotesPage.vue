<template>
  <div class="notes-page">
    <!-- 左侧边栏 -->
    <aside class="notes-sidebar">
      <!-- 顶部操作栏 -->
      <div class="sidebar-header">
        <el-button type="primary" size="small" :icon="Plus" @click="handleCreate">
          {{ $t('notes.newNote') }}
        </el-button>
      </div>

      <!-- 搜索栏 -->
      <div class="sidebar-search">
        <el-input
          v-model="searchText"
          :placeholder="$t('notes.searchPlaceholder')"
          size="small"
          clearable
          :prefix-icon="Search"
          @input="onSearch"
        />
      </div>

      <!-- 标签过滤 -->
      <div class="sidebar-tags" v-if="store.allTags.length > 0">
        <el-select
          v-model="store.selectedTag"
          size="small"
          :placeholder="$t('notes.allTags')"
          clearable
          class="tag-select"
        >
          <el-option
            v-for="tag in store.allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <!-- 笔记列表 -->
      <div class="sidebar-list" v-loading="store.loading">
        <div
          v-for="note in store.filteredNotes"
          :key="note.id"
          class="note-item"
          :class="{ active: note.id === store.selectedId }"
          @click="store.selectNote(note.id)"
        >
          <div class="note-item-header">
            <span class="note-item-title">{{ note.title || $t('notes.untitled') }}</span>
            <el-icon v-if="note.isPinned" class="pin-icon"><StarFilled /></el-icon>
          </div>
          <div class="note-item-preview">{{ getPreview(note.content) }}</div>
          <div class="note-item-footer">
            <span class="note-item-date">{{ formatDate(note.updatedAt) }}</span>
            <div class="note-item-tags" v-if="note.tags.length > 0">
              <el-tag
                v-for="tag in note.tags.slice(0, 2)"
                :key="tag"
                size="small"
                class="mini-tag"
              >{{ tag }}</el-tag>
            </div>
          </div>
        </div>
        <el-empty
          v-if="!store.loading && store.filteredNotes.length === 0"
          :description="store.notes.length === 0 ? $t('notes.emptyMessage') : $t('common.noData')"
          :image-size="80"
        />
      </div>
    </aside>

    <!-- 右侧编辑区 -->
    <main class="notes-editor">
      <template v-if="store.selectedNote">
        <!-- 标题栏 -->
        <div class="editor-header">
          <input
            ref="titleInputRef"
            class="title-input"
            :value="store.selectedNote.title"
            :placeholder="$t('notes.titlePlaceholder')"
            @input="onTitleChange"
            @blur="handleSave"
          />

          <div class="editor-actions">
            <!-- 编辑/预览切换 -->
            <el-button-group size="small">
              <el-button
                :type="store.viewMode === 'edit' ? 'primary' : 'default'"
                @click="store.setViewMode('edit')"
              >
                <el-icon><Edit /></el-icon>
                {{ $t('notes.edit') }}
              </el-button>
              <el-button
                :type="store.viewMode === 'preview' ? 'primary' : 'default'"
                @click="store.setViewMode('preview')"
              >
                <el-icon><View /></el-icon>
                {{ $t('notes.preview') }}
              </el-button>
            </el-button-group>

            <!-- 标签编辑 -->
            <el-popover
              v-model:visible="tagPopoverVisible"
              placement="bottom"
              :width="260"
              trigger="click"
            >
              <template #reference>
                <el-button size="small">
                  <el-icon><PriceTag /></el-icon>
                  {{ $t('notes.editTags') }}
                </el-button>
              </template>
              <div class="tag-editor">
                <el-tag
                  v-for="tag in editingTags"
                  :key="tag"
                  closable
                  size="small"
                  @close="removeEditingTag(tag)"
                  class="editing-tag"
                >{{ tag }}</el-tag>
                <el-input
                  v-if="tagInputVisible"
                  ref="tagInputRef"
                  v-model="tagInputValue"
                  size="small"
                  class="tag-new-input"
                  @keyup.enter="confirmTagInput"
                  @blur="confirmTagInput"
                />
                <el-button
                  v-else
                  size="small"
                  @click="showTagInput"
                >+ {{ $t('notes.addTag') }}</el-button>
                <div class="tag-actions">
                  <el-button size="small" type="primary" @click="saveTags">{{ $t('common.confirm') }}</el-button>
                </div>
              </div>
            </el-popover>

            <!-- 置顶 -->
            <el-button
              size="small"
              :type="store.selectedNote.isPinned ? 'warning' : 'default'"
              @click="togglePin"
            >
              <el-icon><StarFilled /></el-icon>
            </el-button>

            <!-- 删除 -->
            <el-popconfirm
              :title="$t('notes.deleteConfirm')"
              :confirm-button-text="$t('common.confirm')"
              :cancel-button-text="$t('common.cancel')"
              @confirm="handleDelete"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <!-- 格式化工具栏（仅编辑模式） -->
        <div class="editor-toolbar" v-if="store.viewMode === 'edit'">
          <el-button-group size="small">
            <el-button @click="execCmd('bold')" :type="cmdState.bold ? 'primary' : 'default'">
              <strong>B</strong>
            </el-button>
            <el-button @click="execCmd('italic')" :type="cmdState.italic ? 'primary' : 'default'">
              <em>I</em>
            </el-button>
            <el-button @click="execCmd('underline')" :type="cmdState.underline ? 'primary' : 'default'">
              <u>U</u>
            </el-button>
            <el-button @click="execCmd('strikeThrough')" :type="cmdState.strikeThrough ? 'primary' : 'default'">
              <s>S</s>
            </el-button>
          </el-button-group>

          <el-button-group size="small">
            <el-button @click="execCmd('insertUnorderedList')">
              <el-icon><List /></el-icon>
            </el-button>
            <el-button @click="execCmd('insertOrderedList')">
              <el-icon><Tickets /></el-icon>
            </el-button>
          </el-button-group>

          <el-select
            size="small"
            :model-value="currentHeading"
            @change="setHeading"
            class="heading-select"
            :placeholder="$t('notes.titlePlaceholder')"
          >
            <el-option label="P" value="div" />
            <el-option label="H1" value="h1" />
            <el-option label="H2" value="h2" />
            <el-option label="H3" value="h3" />
          </el-select>
        </div>

        <!-- 编辑/预览内容区 -->
        <div class="editor-body">
          <!-- 编辑模式 -->
          <div
            v-show="store.viewMode === 'edit'"
            ref="editorRef"
            class="content-editable"
            contenteditable="true"
            :placeholder="$t('notes.contentPlaceholder')"
            @input="onContentChange"
            @blur="handleSave"
            @keydown="onEditorKeydown"
            @paste="onEditorPaste"
            v-html="safeContent"
          />

          <!-- 预览模式 -->
          <div
            v-show="store.viewMode === 'preview'"
            class="content-preview"
            v-html="safeContent"
          />
        </div>

        <!-- 底部状态栏 -->
        <div class="editor-footer">
          <span>{{ $t('notes.updated') }}: {{ formatDate(store.selectedNote.updatedAt) }}</span>
          <span v-if="dirty" class="dirty-indicator">● {{ $t('common.edit') }}</span>
        </div>
      </template>

      <!-- 无选中笔记 -->
      <div v-else class="editor-empty">
        <el-empty :description="$t('notes.emptyMessage')" :image-size="120">
          <el-button type="primary" @click="handleCreate">
            {{ $t('notes.newNote') }}
          </el-button>
        </el-empty>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Plus, Search, Edit, View, Delete, StarFilled,
  List, Tickets, PriceTag,
} from '@element-plus/icons-vue'
import { useNotesStore } from '@/renderer/stores/notes'
import { useNotes } from '@/renderer/composables/useNotes'

const { t } = useI18n()
const store = useNotesStore()
const { fetchNotes, createNote, saveNote, deleteNote, searchNotesLocally } = useNotes()

// Refs
const editorRef: Ref<HTMLElement | null> = ref(null)
const titleInputRef: Ref<HTMLInputElement | null> = ref(null)
const tagInputRef: Ref<HTMLInputElement | null> = ref(null)

// Local state
const searchText = ref('')
const dirty = ref(false)
const tagPopoverVisible = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const editingTags = ref<string[]>([])
const cmdState = ref<Record<string, boolean>>({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
})

// 当前选中的 heading 标签
const currentHeading = ref('div')

// 安全内容：转义初始 load 时的潜在问题
const safeContent = computed(() => {
  return store.selectedNote?.content || ''
})

// ===== 生命周期 =====
onMounted(() => {
  fetchNotes()
  document.addEventListener('selectionchange', updateCmdState)
})

// 监听选中笔记变化 — 重置 dirty 状态 + 同步 editingTags
watch(() => store.selectedId, () => {
  dirty.value = false
  if (store.selectedNote) {
    editingTags.value = [...store.selectedNote.tags]
    nextTick(() => {
      if (store.viewMode === 'edit' && editorRef.value && store.selectedNote) {
        editorRef.value.innerHTML = store.selectedNote.content
      }
    })
  }
})

// 监听 viewMode 切换（切换到编辑模式时重新注入 HTML）
watch(() => store.viewMode, (mode) => {
  if (mode === 'edit' && editorRef.value && store.selectedNote) {
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = store.selectedNote!.content
      }
    })
  }
})

// ===== 创建 =====
async function handleCreate(): Promise<void> {
  await createNote()
  dirty.value = false
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
      editorRef.value.focus()
    }
  })
}

// ===== 搜索 =====
function onSearch(val: string): void {
  searchNotesLocally(val)
}

// ===== 标题变更 =====
function onTitleChange(e: Event): void {
  const target = e.target as HTMLInputElement
  if (!store.selectedId) return
  store.updateNote(store.selectedId, { title: target.value })
  dirty.value = true
}

// ===== 内容变更 =====
function onContentChange(): void {
  if (!store.selectedId || !editorRef.value) return
  const html = editorRef.value.innerHTML
  store.updateNote(store.selectedId, { content: html })
  dirty.value = true
}

// ===== 保存 =====
async function handleSave(): Promise<void> {
  if (!store.selectedId || !dirty.value) return
  const note = store.selectedNote
  if (!note) return
  const ok = await saveNote(store.selectedId, {
    title: note.title,
    content: note.content,
    tags: note.tags,
  })
  if (ok) dirty.value = false
}

// ===== 删除 =====
async function handleDelete(): Promise<void> {
  if (!store.selectedId) return
  await deleteNote(store.selectedId)
  dirty.value = false
}

// ===== 置顶 =====
async function togglePin(): Promise<void> {
  if (!store.selectedId || !store.selectedNote) return
  const pinned = !store.selectedNote.isPinned
  store.updateNote(store.selectedId, { isPinned: pinned })
  await saveNote(store.selectedId, { isPinned: pinned })
}

// ===== 格式化命令 =====
function execCmd(command: string, value?: string): void {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateCmdState()
  onContentChange()
}

function updateCmdState(): void {
  cmdState.value.bold = document.queryCommandState('bold')
  cmdState.value.italic = document.queryCommandState('italic')
  cmdState.value.underline = document.queryCommandState('underline')
  cmdState.value.strikeThrough = document.queryCommandState('strikeThrough')

  // 检测当前 heading
  const tags = ['h1', 'h2', 'h3']
  for (const tag of tags) {
    if (document.queryCommandState('formatBlock') || document.queryCommandValue('formatBlock') === tag) {
      currentHeading.value = tag
      return
    }
  }
  currentHeading.value = 'div'
}

function setHeading(tag: string): void {
  execCmd('formatBlock', tag === 'div' ? 'div' : tag)
}

// ===== 键盘事件 =====
function onEditorKeydown(e: KeyboardEvent): void {
  // Ctrl/Cmd+S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

// ===== 粘贴清理 =====
function onEditorPaste(e: ClipboardEvent): void {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

// ===== 标签编辑 =====
function showTagInput(): void {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function confirmTagInput(): void {
  const val = tagInputValue.value.trim()
  if (val && !editingTags.value.includes(val)) {
    editingTags.value.push(val)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

function removeEditingTag(tag: string): void {
  editingTags.value = editingTags.value.filter(t => t !== tag)
}

async function saveTags(): Promise<void> {
  if (!store.selectedId) return
  store.updateNote(store.selectedId, { tags: [...editingTags.value] })
  tagPopoverVisible.value = false
  await saveNote(store.selectedId, { tags: editingTags.value })
}

// ===== 辅助函数 =====
function getPreview(html: string): string {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || '').slice(0, 80)
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.notes-page {
  display: flex;
  height: calc(100vh - 110px);
  background: var(--main-bg, #f5f7fa);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--box-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.08));
}

/* ===== 侧边栏 ===== */
.notes-sidebar {
  width: 280px;
  min-width: 280px;
  background: var(--bg-primary, #fff);
  border-right: 1px solid var(--border-color, #ebeef5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
}

.sidebar-header .el-button {
  width: 100%;
}

.sidebar-search {
  padding: 8px 12px;
}

.sidebar-tags {
  padding: 0 12px 8px;
}

.tag-select {
  width: 100%;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.note-item {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 2px;
  transition: background 0.15s;
}

.note-item:hover {
  background: #f0f2f5;
}

.note-item.active {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-left: 3px solid var(--el-color-primary, #409eff);
  padding-left: 9px;
}

.note-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.note-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.pin-icon {
  color: var(--el-color-warning, #e6a23c);
  font-size: 12px;
  flex-shrink: 0;
}

.note-item-preview {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.note-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-item-date {
  font-size: 11px;
  color: #c0c4cc;
}

.note-item-tags {
  display: flex;
  gap: 2px;
}

.mini-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 18px;
}

/* ===== 编辑区 ===== */
.notes-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
  overflow: hidden;
}

.editor-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
  flex-wrap: wrap;
}

.title-input {
  flex: 1;
  min-width: 200px;
  border: none;
  outline: none;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  background: transparent;
}

.title-input::placeholder {
  color: #c0c4cc;
  font-weight: 400;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color, #ebeef5);
  background: #fafafa;
}

.heading-select {
  width: 80px;
}

.editor-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.content-editable {
  flex: 1;
  padding: 20px 24px;
  outline: none;
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
  overflow-y: auto;
  min-height: 300px;
}

.content-editable:empty::before {
  content: attr(placeholder);
  color: #c0c4cc;
  pointer-events: none;
}

.content-editable:focus {
  background: #fdfdfd;
}

.content-preview {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
}

.content-preview :deep(h1) { font-size: 24px; margin: 16px 0 8px; }
.content-preview :deep(h2) { font-size: 20px; margin: 14px 0 6px; }
.content-preview :deep(h3) { font-size: 17px; margin: 12px 0 4px; }
.content-preview :deep(p) { margin: 8px 0; }
.content-preview :deep(ul),
.content-preview :deep(ol) { padding-left: 24px; margin: 8px 0; }
.content-preview :deep(li) { margin: 4px 0; }
.content-preview :deep(blockquote) {
  border-left: 3px solid #dcdfe6;
  padding-left: 12px;
  color: #909399;
  margin: 8px 0;
}
.content-preview :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}
.content-preview :deep(pre) {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
}
.content-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  border-top: 1px solid var(--border-color, #ebeef5);
  font-size: 12px;
  color: #c0c4cc;
  background: #fafafa;
}

.dirty-indicator {
  color: var(--el-color-warning, #e6a23c);
}

/* ===== 标签编辑器 ===== */
.tag-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.editing-tag {
  margin-bottom: 4px;
}

.tag-new-input {
  width: 100px;
}

.tag-actions {
  width: 100%;
  margin-top: 8px;
}

/* ===== 滚动条美化 ===== */
.sidebar-list::-webkit-scrollbar,
.content-editable::-webkit-scrollbar,
.content-preview::-webkit-scrollbar {
  width: 6px;
}

.sidebar-list::-webkit-scrollbar-thumb,
.content-editable::-webkit-scrollbar-thumb,
.content-preview::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
</style>
