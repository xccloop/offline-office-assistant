<template>
  <div
    class="pdf-viewer"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- 顶部工具栏 -->
    <div class="pdf-toolbar">
      <div class="toolbar-group">
        <el-button
          type="primary"
          :icon="FolderOpened"
          @click="openFile"
        >
          {{ $t('pdf.openFile') }}
        </el-button>
        <el-button
          v-if="hasDocument"
          text
          :icon="Close"
          :title="$t('pdf.closeDocument')"
          @click="closeDocument"
        />
      </div>

      <template v-if="hasDocument">
        <div class="toolbar-divider" />

        <!-- 页面导航 -->
        <div class="toolbar-group">
          <el-button
            :disabled="isFirstPage"
            :icon="DArrowLeft"
            :title="$t('pdf.firstPage')"
            text
            @click="firstPage"
          />
          <el-button
            :disabled="isFirstPage"
            :icon="ArrowLeft"
            :title="$t('pdf.previousPage')"
            text
            @click="previousPage"
          />
          <div class="page-nav-input">
            <el-input-number
              :model-value="currentPageNumber"
              :min="1"
              :max="numPages"
              :controls="false"
              size="small"
              style="width: 60px"
              @change="goToPage"
            />
            <span class="page-total">{{ $t('pdf.pageOf') }} {{ numPages }}</span>
          </div>
          <el-button
            :disabled="isLastPage"
            :icon="ArrowRight"
            :title="$t('pdf.nextPage')"
            text
            @click="nextPage"
          />
          <el-button
            :disabled="isLastPage"
            :icon="DArrowRight"
            :title="$t('pdf.lastPage')"
            text
            @click="lastPage"
          />
        </div>

        <div class="toolbar-divider" />

        <!-- 缩放控制 -->
        <div class="toolbar-group">
          <el-button
            :disabled="scale <= 0.5"
            :icon="ZoomOut"
            :title="$t('pdf.zoomOut')"
            text
            @click="zoomOut"
          />
          <el-dropdown trigger="click" @command="handleZoomCommand">
            <span class="zoom-label">{{ scalePercent }}%</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="reset">{{ $t('pdf.zoomReset') }} (100%)</el-dropdown-item>
                <el-dropdown-item command="fitWidth">{{ $t('pdf.zoomFitWidth') }}</el-dropdown-item>
                <el-dropdown-item command="fitPage">{{ $t('pdf.zoomFitPage') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            :disabled="scale >= 4"
            :icon="ZoomIn"
            :title="$t('pdf.zoomIn')"
            text
            @click="zoomIn"
          />
        </div>

        <div class="toolbar-spacer" />

        <!-- 右侧操作 -->
        <div class="toolbar-group">
          <el-button
            :icon="thumbnailsVisible ? PictureFilled : Picture"
            :title="$t('pdf.toggleThumbnails')"
            text
            @click="toggleThumbnails"
          />
        </div>
      </template>
    </div>

    <!-- 主体区域 -->
    <div class="pdf-body">
      <!-- 缩略图侧边栏 -->
      <div
        v-if="hasDocument && thumbnailsVisible"
        ref="thumbnailContainerRef"
        class="pdf-thumbnails"
        @scroll="onThumbScroll"
      >
        <div
          class="thumbnail-virtual-list"
          :style="{ height: totalThumbHeight + 'px' }"
        >
          <div
            v-for="pageNum in visibleThumbPages"
            :key="pageNum"
            class="thumbnail-item"
            :class="{ 'thumbnail-active': pageNum === currentPageNumber }"
            :style="{
              position: 'absolute',
              top: (pageNum - 1) * thumbItemHeight + 'px',
              width: '100%',
            }"
            @click="goToPage(pageNum)"
          >
            <canvas
              :ref="(el: unknown) => setThumbRef(el as HTMLCanvasElement | null, pageNum)"
              class="thumbnail-canvas"
            />
            <span class="thumbnail-label">{{ pageNum }}</span>
          </div>
        </div>
      </div>

      <!-- 主视图区域 -->
      <div
        class="pdf-main"
        :class="{ 'no-sidebar': !hasDocument || !thumbnailsVisible }"
        @wheel.passive="onMainWheel"
      >
        <!-- 空状态 -->
        <div v-if="!hasDocument" class="pdf-empty">
          <div class="empty-drop-zone" :class="{ 'drag-over': isDragging }">
            <el-icon :size="64" color="#c0c4cc"><UploadFilled /></el-icon>
            <p class="empty-title">{{ $t('pdf.noDocument') }}</p>
            <p class="empty-hint">{{ $t('pdf.dragTip') }}</p>
            <el-button type="primary" size="large" @click="openFile">
              {{ $t('pdf.openFile') }}
            </el-button>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-else-if="isLoading" class="pdf-loading">
          <el-icon :size="48" class="is-loading"><Loading /></el-icon>
          <p>{{ $t('common.loading') }}</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="pdf-error">
          <el-icon :size="48" color="#f56c6c"><CircleCloseFilled /></el-icon>
          <p>{{ $t('pdf.loadError') }}</p>
          <p class="error-detail">{{ error }}</p>
          <el-button @click="openFile">{{ $t('pdf.openFile') }}</el-button>
        </div>

        <!-- PDF 渲染区域 -->
        <div v-else class="pdf-canvas-viewport" ref="viewportRef">
          <div class="pdf-canvas-wrapper">
            <canvas
              ref="mainCanvasRef"
              class="pdf-main-canvas"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div v-if="hasDocument && !isLoading && !error" class="pdf-statusbar">
      <span class="status-item">{{ fileName }}</span>
      <span v-if="fileSize > 0" class="status-item">
        {{ formatFileSize(fileSize) }}
      </span>
      <span class="status-item">{{ numPages }} {{ $t('pdf.pages') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import {
  FolderOpened, Close, DArrowLeft, ArrowLeft,
  ArrowRight, DArrowRight, ZoomIn, ZoomOut,
  Picture, PictureFilled, UploadFilled, Loading, CircleCloseFilled,
} from '@element-plus/icons-vue'
import { usePDF } from '@renderer/composables/usePDF'

const {
  currentPageNumber,
  numPages,
  scale,
  isLoading,
  error,
  fileName,
  fileSize,
  pageInfos,
  thumbnailsVisible,
  hasDocument,
  isFirstPage,
  isLastPage,
  scalePercent,
  loadFile,
  openFile,
  renderPage,
  renderThumbnail,
  goToPage,
  previousPage,
  nextPage,
  firstPage,
  lastPage,
  zoomIn,
  zoomOut,
  zoomReset,
  zoomFitWidth,
  zoomFitPage,
  toggleThumbnails,
  closeDocument,
} = usePDF()

// --- 缩略图常量 ---
const THUMB_WIDTH = 120
const THUMB_HEIGHT = 160
const thumbItemHeight = THUMB_HEIGHT + 12
const THUMB_BUFFER = 8

// --- 模板引用 ---
const mainCanvasRef = ref<HTMLCanvasElement | null>(null)
const viewportRef = ref<HTMLDivElement | null>(null)
const thumbnailContainerRef = ref<HTMLDivElement | null>(null)

// --- 拖拽状态 ---
const isDragging = ref(false)

// --- 缩略图 canvas 集合 ---
const thumbCanvasMap = new Map<number, HTMLCanvasElement | null>()
const thumbnailScrollTop = ref(0)
const thumbnailViewHeight = ref(600)

/** 总缩略图列表高度 */
const totalThumbHeight = computed(() => numPages.value * thumbItemHeight)

/** 可见缩略图页码 */
const visibleThumbPages = computed(() => {
  const total = numPages.value
  if (total <= 0) return []

  const start = Math.max(
    1,
    Math.floor(thumbnailScrollTop.value / thumbItemHeight) - THUMB_BUFFER
  )
  const end = Math.min(
    total,
    Math.ceil((thumbnailScrollTop.value + thumbnailViewHeight.value) / thumbItemHeight) + THUMB_BUFFER
  )
  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// --- 方法 ---

/** 设置缩略图 canvas 引用 */
function setThumbRef(el: HTMLCanvasElement | null, pageNum: number): void {
  thumbCanvasMap.set(pageNum, el)
  if (el && hasDocument.value) {
    nextTick(() => {
      renderThumbnail(el, pageNum)
    })
  }
}

/** 缩略图容器滚动 */
function onThumbScroll(): void {
  const container = thumbnailContainerRef.value
  if (container) {
    thumbnailScrollTop.value = container.scrollTop
    thumbnailViewHeight.value = container.clientHeight
  }
}

/** 渲染当前页面到主 canvas */
async function renderCurrentPage(): Promise<void> {
  const canvas = mainCanvasRef.value
  if (!canvas || !hasDocument.value) return
  await nextTick()
  await renderPage(canvas, currentPageNumber.value)
}

/**
 * 重新渲染可见的缩略图
 * 在 visibleThumbPages 变化时调用
 */
async function renderVisibleThumbnails(): Promise<void> {
  if (!thumbnailsVisible.value) return
  const pages = visibleThumbPages.value
  for (const pageNum of pages) {
    const canvas = thumbCanvasMap.get(pageNum)
    if (canvas) {
      await renderThumbnail(canvas, pageNum)
    }
  }
}

/** 工具栏缩放命令 */
function handleZoomCommand(command: string): void {
  switch (command) {
    case 'reset':
      zoomReset()
      break
    case 'fitWidth':
      zoomFitWidth()
      break
    case 'fitPage':
      zoomFitPage()
      break
  }
}

/** 主视区滚轮事件：Ctrl+滚轮缩放 */
function onMainWheel(event: WheelEvent): void {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

/** 文件拖拽 */
function onDragOver(): void {
  isDragging.value = true
}

function onDragLeave(): void {
  isDragging.value = false
}

async function onDrop(event: DragEvent): Promise<void> {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.name.toLowerCase().endsWith('.pdf')) {
      // 通过 IPC 获取实际路径不现实，使用 file.path 备选
      if ((file as { path?: string }).path) {
        await loadFile((file as { path: string }).path)
      }
    }
  }
}

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  if (i === 0) return `${bytes} B`
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

// --- 键盘快捷键 ---
function onKeydown(event: KeyboardEvent): void {
  if (!hasDocument.value) return

  // 避免在输入框中触发
  const target = event.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextPage()
      break
    case 'Home':
      event.preventDefault()
      firstPage()
      break
    case 'End':
      event.preventDefault()
      lastPage()
      break
    case '+':
    case '=':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomIn()
      }
      break
    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomOut()
      }
      break
    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomReset()
      }
      break
  }
}

// --- 监听器 ---

// 当页码或缩放变化时，重新渲染主视图
watch(
  [currentPageNumber, scale],
  () => {
    renderCurrentPage()
  },
  { flush: 'post' }
)

// 当文档变化或缩略图可见时，渲染缩略图
watch(
  [hasDocument, thumbnailsVisible],
  async ([doc, visible]) => {
    if (doc && visible) {
      await nextTick()
      onThumbScroll()
      await renderVisibleThumbnails()
    }
  },
  { flush: 'post' }
)

// 缩略图滚动时重新渲染可见缩略图
watch(visibleThumbPages, () => {
  nextTick(() => {
    renderVisibleThumbnails()
  })
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  closeDocument()
})
</script>

<style scoped>
/* ========== 容器 ========== */
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary, #fff);
  border-radius: 4px;
  overflow: hidden;
}

/* ========== 工具栏 ========== */
.pdf-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--bg-secondary, #f5f7fa);
  border-bottom: 1px solid var(--border-light, #ebeef5);
  flex-shrink: 0;
  min-height: 44px;
  user-select: none;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color, #e4e7ed);
  margin: 0 6px;
}

.toolbar-spacer {
  flex: 1;
}

.page-nav-input {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 4px;
}

.page-total {
  font-size: 13px;
  color: var(--text-secondary, #606266);
  white-space: nowrap;
}

.zoom-label {
  display: inline-block;
  min-width: 50px;
  text-align: center;
  font-size: 13px;
  color: var(--text-primary, #303133);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.zoom-label:hover {
  background: var(--border-light, #ebeef5);
}

/* ========== 主体 ========== */
.pdf-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ========== 缩略图侧边栏 ========== */
.pdf-thumbnails {
  width: 150px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-secondary, #f5f7fa);
  border-right: 1px solid var(--border-light, #ebeef5);
}

.pdf-thumbnails::-webkit-scrollbar {
  width: 6px;
}

.pdf-thumbnails::-webkit-scrollbar-thumb {
  background: var(--text-placeholder, #c0c4cc);
  border-radius: 3px;
}

.thumbnail-virtual-list {
  position: relative;
  width: 100%;
}

.thumbnail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}

.thumbnail-item:hover {
  background: var(--border-light, #ebeef5);
}

.thumbnail-active {
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.thumbnail-active:hover {
  background: var(--el-color-primary-light-8, #d9ecff);
}

.thumbnail-canvas {
  display: block;
  max-width: 120px;
  box-shadow: var(--box-shadow-medium, 0 1px 4px rgba(0, 0, 0, 0.12));
  border-radius: 2px;
}

.thumbnail-label {
  font-size: 11px;
  color: var(--text-secondary, #606266);
  margin-top: 2px;
}

/* ========== 主视图 ========== */
.pdf-main {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  background: var(--main-bg, #f5f7fa);
  position: relative;
}

.pdf-main.no-sidebar {
  /* 无侧边栏时居中 */
}

/* ========== 空状态 / 加载 / 错误 ========== */
.pdf-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.empty-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 32px;
  border: 2px dashed var(--border-color, #e4e7ed);
  border-radius: 12px;
  transition: border-color 0.3s, background 0.3s;
}

.empty-drop-zone.drag-over {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.empty-title {
  font-size: 16px;
  color: var(--text-secondary, #606266);
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-placeholder, #c0c4cc);
  margin: 0;
}

.pdf-loading,
.pdf-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  color: var(--text-secondary, #606266);
}

.error-detail {
  font-size: 12px;
  color: var(--text-placeholder, #c0c4cc);
  max-width: 400px;
  text-align: center;
  word-break: break-all;
}

/* ========== Canvas 视口 ========== */
.pdf-canvas-viewport {
  padding: 16px;
  display: flex;
  justify-content: center;
  min-width: min-content;
}

.pdf-canvas-wrapper {
  box-shadow: var(--box-shadow-heavy, 0 2px 16px rgba(0, 0, 0, 0.12));
  border-radius: 4px;
  overflow: hidden;
  line-height: 0;
}

.pdf-main-canvas {
  display: block;
}

/* ========== 底部状态栏 ========== */
.pdf-statusbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 16px;
  background: var(--bg-secondary, #f5f7fa);
  border-top: 1px solid var(--border-light, #ebeef5);
  font-size: 12px;
  color: var(--text-secondary, #606266);
  flex-shrink: 0;
}

.status-item {
  white-space: nowrap;
}
</style>
