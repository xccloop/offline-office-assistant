<template>
  <div class="ocr-page">
    <h2 class="page-title">{{ $t('nav.ocr') }}</h2>

    <div class="ocr-layout">
      <!-- Left: Upload & Preview -->
      <div class="ocr-left">
        <el-card class="upload-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><PictureFilled /></el-icon>
              <span>{{ $t('ocr.imagePreview') }}</span>
            </div>
          </template>

          <!-- Drop zone / preview -->
          <div
            class="drop-zone"
            :class="{ 'has-image': imageDataUrl, 'is-dragover': isDragover }"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <template v-if="imageDataUrl">
              <el-image
                :src="imageDataUrl"
                fit="contain"
                class="preview-image"
                :preview-src-list="[imageDataUrl]"
                :hide-on-click-modal="true"
              />
              <div class="image-overlay">
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="clearImage"
                  :title="$t('common.clear')"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </template>
            <template v-else>
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <p class="upload-text">{{ $t('ocr.dragTip') }}</p>
              <p class="upload-hint">{{ $t('ocr.supportedFormats') }}</p>
            </template>
          </div>

          <!-- Hidden file input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,image/tiff"
            class="hidden-input"
            @change="onFileInputChange"
          />

          <!-- File info -->
          <div v-if="fileName" class="file-meta">
            <el-tag type="info" size="small">{{ fileName }}</el-tag>
            <span v-if="fileSizeStr" class="file-size">{{ fileSizeStr }}</span>
          </div>
        </el-card>
      </div>

      <!-- Right: Controls & Result -->
      <div class="ocr-right">
        <el-card class="control-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><View /></el-icon>
              <span>{{ $t('ocr.title') }}</span>
            </div>
          </template>

          <!-- Language selector -->
          <div class="control-row">
            <label class="control-label">{{ $t('ocr.selectLanguage') }}</label>
            <el-select
              v-model="selectedLang"
              :placeholder="$t('ocr.selectLanguage')"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="lang in languages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
              />
            </el-select>
          </div>

          <!-- OCR button -->
          <div class="control-row">
            <el-button
              type="primary"
              :loading="isRecognizing"
              :disabled="!imageDataUrl"
              @click="startOCR"
              size="large"
              style="width: 100%"
            >
              <el-icon v-if="!isRecognizing"><Search /></el-icon>
              {{ isRecognizing ? $t('ocr.recognizing') : $t('ocr.startOCR') }}
            </el-button>
          </div>

          <!-- Progress bar -->
          <div v-if="isRecognizing || progress > 0" class="control-row">
            <div class="progress-section">
              <span class="progress-label">{{ $t('ocr.progress') }}</span>
              <span class="progress-percent">{{ Math.round(progress) }}%</span>
            </div>
            <el-progress
              :percentage="Math.round(progress)"
              :status="progressStatus"
              :stroke-width="8"
            />
            <p v-if="progressText" class="progress-text">{{ progressText }}</p>
          </div>

          <!-- Result text -->
          <div v-if="ocrResult !== null" class="control-row result-section">
            <div class="result-header">
              <span class="result-title">{{ $t('ocr.result') }}</span>
              <el-button size="small" @click="copyResult" :disabled="!ocrResult">
                <el-icon><CopyDocument /></el-icon>
                {{ $t('ocr.copyResult') }}
              </el-button>
            </div>
            <el-input
              v-model="ocrResult"
              type="textarea"
              :rows="14"
              readonly
              class="result-textarea"
              :placeholder="$t('ocr.resultPlaceholder')"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  PictureFilled,
  UploadFilled,
  Close,
  View,
  Search,
  CopyDocument,
} from '@element-plus/icons-vue'
import { createWorker, type Worker } from 'tesseract.js'

const { t } = useI18n()

// ── Language list ──
interface LanguageOption {
  value: string
  label: string
}

const languages: LanguageOption[] = [
  { value: 'eng', label: t('ocr.languages.eng') },
  { value: 'chi_sim', label: t('ocr.languages.chi_sim') },
  { value: 'chi_tra', label: t('ocr.languages.chi_tra') },
  { value: 'jpn', label: t('ocr.languages.jpn') },
  { value: 'kor', label: t('ocr.languages.kor') },
  { value: 'fra', label: t('ocr.languages.fra') },
  { value: 'deu', label: t('ocr.languages.deu') },
  { value: 'spa', label: t('ocr.languages.spa') },
  { value: 'por', label: t('ocr.languages.por') },
  { value: 'ita', label: t('ocr.languages.ita') },
  { value: 'rus', label: t('ocr.languages.rus') },
  { value: 'ara', label: t('ocr.languages.ara') },
]

// ── State ──
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageDataUrl = ref('')
const fileName = ref('')
const fileSizeStr = ref('')
const selectedLang = ref('eng')
const isDragover = ref(false)
const isRecognizing = ref(false)
const progress = ref(0)
const progressText = ref('')
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const ocrResult = ref<string | null>(null)

// ── Drag & drop ──
function onDragOver(_e: DragEvent): void {
  isDragover.value = true
}

function onDragLeave(_e: DragEvent): void {
  isDragover.value = false
}

function onDrop(e: DragEvent): void {
  isDragover.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    loadFile(files[0])
  }
}

// ── Click to upload ──
function triggerFileInput(): void {
  if (imageDataUrl.value) return // clicking preview opens el-image viewer
  fileInputRef.value?.click()
}

function onFileInputChange(e: Event): void {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    loadFile(file)
  }
  // Reset so re-selecting the same file triggers change
  target.value = ''
}

// ── File loading ──
function loadFile(file: File): void {
  // Validate type
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff']
  if (!allowed.includes(file.type)) {
    ElMessage.warning(t('ocr.invalidFormat'))
    return
  }

  fileName.value = file.name
  fileSizeStr.value = formatFileSize(file.size)
  ocrResult.value = null
  progress.value = 0
  progressText.value = ''
  progressStatus.value = ''

  const reader = new FileReader()
  reader.onload = () => {
    imageDataUrl.value = reader.result as string
  }
  reader.onerror = () => {
    ElMessage.error(t('ocr.loadError'))
  }
  reader.readAsDataURL(file)
}

function clearImage(): void {
  imageDataUrl.value = ''
  fileName.value = ''
  fileSizeStr.value = ''
  ocrResult.value = null
  progress.value = 0
  progressText.value = ''
  progressStatus.value = ''
}

// ── OCR ──
let worker: Worker | null = null

async function startOCR(): Promise<void> {
  if (!imageDataUrl.value) {
    ElMessage.warning(t('ocr.noImage'))
    return
  }

  isRecognizing.value = true
  progress.value = 0
  progressText.value = t('ocr.initializing')
  progressStatus.value = ''
  ocrResult.value = null

  try {
    // Create worker if needed
    if (!worker) {
      worker = await createWorker(selectedLang.value, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            progress.value = Math.round((m.progress ?? 0) * 100)
            progressText.value = t('ocr.recognizing')
          } else if (m.status === 'loading tesseract core') {
            progressText.value = t('ocr.loadingCore')
          } else if (m.status === 'initializing tesseract') {
            progressText.value = t('ocr.initializing')
          } else if (m.status === 'loading language traineddata') {
            progressText.value = t('ocr.loadingLanguage')
          }
        },
      })
    } else {
      // Switch language if needed
      await worker.reinitialize(selectedLang.value, 1)
    }

    const { data } = await worker.recognize(imageDataUrl.value)
    ocrResult.value = data.text || ''
    progress.value = 100
    progressText.value = t('ocr.complete')
    progressStatus.value = 'success'
    ElMessage.success(t('ocr.complete'))
  } catch (err) {
    progressStatus.value = 'exception'
    progressText.value = t('ocr.error')
    ElMessage.error(String(err))
  } finally {
    isRecognizing.value = false
  }
}

// ── Copy ──
async function copyResult(): Promise<void> {
  if (!ocrResult.value) return
  try {
    await navigator.clipboard.writeText(ocrResult.value)
    ElMessage.success(t('common.copied'))
  } catch {
    try {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = ocrResult.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success(t('common.copied'))
    } catch {
      ElMessage.error(t('ocr.copyFailed'))
    }
  }
}

// ── Helpers ──
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>

<style scoped>
.ocr-page {
  padding: 20px 24px;
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: var(--main-bg, #f5f7fa);
}

.page-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.ocr-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 960px) {
  .ocr-layout {
    grid-template-columns: 1fr;
  }
}

/* ── Card shared ── */
.upload-card,
.control-card {
  border-radius: 8px;
  overflow: hidden;
}

.upload-card :deep(.el-card__header),
.control-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: var(--bg-secondary, #f5f7fa);
  border-bottom: 1px solid var(--border-light, #ebeef5);
}

.upload-card :deep(.el-card__body) {
  padding: 16px;
}

.control-card :deep(.el-card__body) {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary, #303133);
}

.card-header .el-icon {
  color: var(--el-color-primary, #409eff);
  font-size: 16px;
}

/* ── Drop zone ── */
.drop-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  border: 2px dashed var(--border-color, #dcdfe6);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  background: var(--bg-secondary, #f5f7fa);
  overflow: hidden;
}

.drop-zone:hover {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.drop-zone.is-dragover {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-8, #d9ecff);
}

.drop-zone.has-image {
  border-style: solid;
  border-color: var(--border-color, #dcdfe6);
  padding: 0;
  min-height: 300px;
  cursor: default;
}

.upload-icon {
  font-size: 48px;
  color: var(--el-color-primary-light-3, #a0cfff);
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: var(--text-primary, #303133);
  margin: 0 0 6px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary, #909399);
  margin: 0;
}

/* ── Image preview ── */
.preview-image {
  width: 100%;
  height: 300px;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

/* ── Hidden input ── */
.hidden-input {
  display: none;
}

/* ── File meta ── */
.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.file-size {
  font-size: 13px;
  color: var(--text-secondary, #606266);
}

/* ── Control rows ── */
.control-row {
  margin-bottom: 16px;
}

.control-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin-bottom: 8px;
}

/* ── Progress ── */
.progress-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary, #409eff);
}

.progress-text {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-secondary, #909399);
}

/* ── Result ── */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.result-textarea :deep(.el-textarea__inner) {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', 'Microsoft YaHei', monospace;
  font-size: 14px;
  line-height: 1.7;
  background: var(--bg-secondary, #f5f7fa);
  resize: vertical;
}
</style>
