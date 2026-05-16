<template>
  <div class="text-page">
    <!-- Toolbar -->
    <div class="text-toolbar">
      <div class="toolbar-left">
        <!-- File operations -->
        <el-button size="small" @click="handleOpenFile" :title="$t('text.openFile')">
          <el-icon><FolderOpened /></el-icon>
          <span class="btn-label">{{ $t('text.openFile') }}</span>
        </el-button>
        <el-button size="small" @click="handleSaveFile" :title="$t('common.save')">
          <el-icon><DocumentAdd /></el-icon>
          <span class="btn-label">{{ $t('common.save') }}</span>
        </el-button>

        <el-divider direction="vertical" />

        <!-- Undo / Redo -->
        <el-button size="small" @click="doUndo" :disabled="!editorViewRef" :title="$t('text.undoTip')">
          <el-icon><RefreshLeft /></el-icon>
          <span class="btn-label">{{ $t('text.undo') }}</span>
        </el-button>
        <el-button size="small" @click="doRedo" :disabled="!editorViewRef" :title="$t('text.redoTip')">
          <el-icon><RefreshRight /></el-icon>
          <span class="btn-label">{{ $t('text.redo') }}</span>
        </el-button>

        <el-divider direction="vertical" />

        <!-- Find / Replace -->
        <el-button
          size="small"
          :type="isSearchOpen ? 'primary' : 'default'"
          @click="toggleSearch"
          :disabled="!editorViewRef"
          :title="$t('text.findReplace')"
        >
          <el-icon><Search /></el-icon>
          <span class="btn-label">{{ $t('text.findReplace') }}</span>
        </el-button>
      </div>

      <div class="toolbar-right">
        <!-- Language selector -->
        <el-select
          :model-value="language"
          @update:model-value="handleLanguageSwitch"
          size="small"
          style="width: 140px"
          :disabled="!editorViewRef"
          :placeholder="$t('text.language')"
        >
          <el-option
            v-for="(label, key) in LANGUAGE_LABELS"
            :key="key"
            :label="$t(label)"
            :value="key"
          />
        </el-select>
      </div>
    </div>

    <!-- Editor area -->
    <div class="text-editor-wrapper">
      <div
        ref="editorContainerRef"
        class="text-editor-container"
      ></div>
    </div>

    <!-- Status bar -->
    <div class="text-statusbar">
      <div class="statusbar-left">
        <span v-if="currentFilePath" class="status-file" :title="currentFilePath">
          <el-icon><Document /></el-icon>
          {{ displayFileName }}
        </span>
        <span v-else class="status-file untitled">
          <el-icon><Document /></el-icon>
          {{ $t('text.untitled') }}
        </span>
        <span v-if="isDirty" class="status-dirty">●</span>
      </div>
      <div class="statusbar-right">
        <span class="status-lang">{{ currentLanguageLabel }}</span>
        <span class="status-stat">{{ $t('text.words') }}: {{ wordCount }}</span>
        <span class="status-stat">{{ $t('text.lines') }}: {{ lineCount }}</span>
        <span class="status-stat">{{ $t('text.chars') }}: {{ charCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FolderOpened,
  DocumentAdd,
  RefreshLeft,
  RefreshRight,
  Search,
  Document,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  useTextEditor,
  LANGUAGE_LABELS,
  type EditorLanguage,
} from '../../../composables/useTextEditor'

const { t } = useI18n()

const {
  language,
  isDirty,
  currentFilePath,
  wordCount,
  lineCount,
  charCount,
  editorViewRef,
  isSearchOpen,
  initEditor,
  destroyEditor,
  switchLanguage,
  doUndo,
  doRedo,
  toggleSearch,
  openFile,
  saveFile,
} = useTextEditor()

const editorContainerRef = ref<HTMLElement | null>(null)

/** Display file name (last segment of path) */
const displayFileName = computed(() => {
  if (!currentFilePath.value) return ''
  const parts = currentFilePath.value.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || currentFilePath.value
})

/** Current language label resolved via i18n */
const currentLanguageLabel = computed(() => {
  const key = LANGUAGE_LABELS[language.value]
  return key ? t(key) : language.value
})

/** Open file via system dialog */
async function handleOpenFile(): Promise<void> {
  try {
    const ok = await openFile()
    if (ok) {
      ElMessage.success(t('text.fileOpened'))
    }
  } catch (err) {
    ElMessage.error(`${t('text.openError')}: ${String(err)}`)
  }
}

/** Save file (or save-as if no path yet) */
async function handleSaveFile(): Promise<void> {
  try {
    const ok = await saveFile()
    if (ok) {
      ElMessage.success(t('text.fileSaved'))
    }
  } catch (err) {
    ElMessage.error(`${t('text.saveError')}: ${String(err)}`)
  }
}

/** Switch editor language and notify */
async function handleLanguageSwitch(lang: EditorLanguage): Promise<void> {
  await switchLanguage(lang)
  ElMessage.success(`${t('text.languageSwitched')}: ${currentLanguageLabel.value}`)
}

// Lifecycle
onMounted(async () => {
  if (editorContainerRef.value) {
    await initEditor(
      editorContainerRef.value,
      t('text.placeholder'),
      'plaintext',
    )
  }
})

onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<style scoped>
.text-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ── Toolbar ────────────────────────────────────────────── */
.text-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  gap: 8px;
  min-height: 40px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-label {
  margin-left: 4px;
}

.text-toolbar .el-divider--vertical {
  height: 20px;
  margin: 0 4px;
}

/* ── Editor wrapper ─────────────────────────────────────── */
.text-editor-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.text-editor-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* ── Status bar ─────────────────────────────────────────── */
.text-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
  min-height: 24px;
  user-select: none;
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-file {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-file.untitled {
  font-style: italic;
  opacity: 0.7;
}

.status-dirty {
  color: var(--el-color-warning);
  font-size: 14px;
  line-height: 1;
}

.status-lang {
  font-weight: 600;
  color: var(--el-color-primary);
}

.status-stat {
  white-space: nowrap;
}
</style>
