<template>
  <div class="converter-page">
    <h2 class="page-title">{{ $t('nav.converter') }}</h2>

    <div class="converter-content">
      <!-- 转换配置 -->
      <el-card class="converter-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Connection /></el-icon>
            <span>{{ $t('converter.title') }}</span>
          </div>
        </template>

        <div class="converter-form">
          <!-- 文件选择 -->
          <div class="form-row">
            <label class="form-label">{{ $t('converter.selectFile') }}</label>
            <div class="file-select-area">
              <el-input
                :model-value="selectedFilePath"
                readonly
                :placeholder="$t('converter.dropFile')"
                class="file-path-input"
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="selectFile">
                <el-icon><FolderOpened /></el-icon>
                {{ $t('common.browse') }}
              </el-button>
            </div>
            <div v-if="selectedFilePath" class="file-info">
              <el-tag type="info" size="small">{{ fileName }}</el-tag>
              <span v-if="fileSize" class="file-size">{{ fileSize }}</span>
            </div>
          </div>

          <!-- 转换类型选择 -->
          <div class="form-row">
            <label class="form-label">{{ $t('converter.sourceFormat') }} → {{ $t('converter.targetFormat') }}</label>
            <el-select
              v-model="selectedConversion"
              :placeholder="$t('converter.sourceFormat') + ' → ' + $t('converter.targetFormat')"
              style="width: 320px"
              @change="onConversionChange"
            >
              <el-option
                v-for="conv in conversions"
                :key="conv.value"
                :label="conv.label"
                :value="conv.value"
              />
            </el-select>
          </div>

          <!-- 转换按钮 -->
          <div class="form-row form-actions">
            <el-button
              type="primary"
              :loading="isConverting"
              :disabled="!selectedFilePath || !selectedConversion"
              @click="handleConvert"
              size="large"
            >
              <el-icon v-if="!isConverting"><Switch /></el-icon>
              {{ isConverting ? $t('converter.converting') : $t('converter.convert') }}
            </el-button>
          </div>

          <!-- 转换结果 -->
          <div v-if="conversionResult !== null" class="conversion-result">
            <div class="result-header">
              <span class="result-title">{{ $t('converter.result') }}</span>
              <div class="result-actions">
                <el-button size="small" @click="copyResult">
                  <el-icon><CopyDocument /></el-icon>
                  {{ $t('converter.copyResult') }}
                </el-button>
                <el-button size="small" type="success" @click="downloadResult" :disabled="!conversionResult">
                  <el-icon><Download /></el-icon>
                  {{ $t('converter.downloadResult') }}
                </el-button>
              </div>
            </div>
            <el-input
              v-model="conversionResult"
              type="textarea"
              :rows="12"
              readonly
              class="result-textarea"
            />
          </div>

          <!-- 转换说明 -->
          <div v-if="conversionResult === null && selectedConversion" class="conversion-placeholder">
            <el-alert
              :title="$t('converter.title')"
              :description="conversionDescription"
              type="info"
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Document,
  FolderOpened,
  Switch,
  CopyDocument,
  Download,
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ── 转换类型定义 ──
interface ConversionType {
  value: string
  label: string
  description: string
}

const conversions: ConversionType[] = [
  {
    value: 'md2html',
    label: t('converter.conversionTypes.md2html'),
    description: '将 Markdown 文档转换为 HTML 格式。',
  },
  {
    value: 'csv2json',
    label: t('converter.conversionTypes.csv2json'),
    description: '将 CSV 表格数据转换为 JSON 数组。',
  },
  {
    value: 'json2csv',
    label: t('converter.conversionTypes.json2csv'),
    description: '将 JSON 数组数据转换为 CSV 表格。',
  },
  {
    value: 'xml2json',
    label: t('converter.conversionTypes.xml2json'),
    description: '将 XML 文档转换为 JSON 对象。',
  },
  {
    value: 'json2xml',
    label: t('converter.conversionTypes.json2xml'),
    description: '将 JSON 对象转换为 XML 文档。',
  },
  {
    value: 'yaml2json',
    label: t('converter.conversionTypes.yaml2json'),
    description: '将 YAML 文档转换为 JSON 对象。',
  },
  {
    value: 'json2yaml',
    label: t('converter.conversionTypes.json2yaml'),
    description: '将 JSON 对象转换为 YAML 文档。',
  },
]

// ── 状态 ──
const selectedFilePath = ref('')
const selectedConversion = ref('')
const conversionResult = ref<string | null>(null)
const isConverting = ref(false)

const fileName = computed(() => {
  if (!selectedFilePath.value) return ''
  return selectedFilePath.value.split(/[/\\]/).pop() || ''
})

const fileSize = ref('')

const conversionDescription = computed(() => {
  const conv = conversions.find(c => c.value === selectedConversion.value)
  return conv?.description || ''
})

// ── 文件选择 ──
async function selectFile(): Promise<void> {
  try {
    // 通过 IPC 打开文件对话框
    if (window.electronAPI?.openFileDialog) {
      const result = await window.electronAPI.openFileDialog()
      if (result && result.filePath) {
        selectedFilePath.value = result.filePath
        fileSize.value = result.fileSize || ''
        conversionResult.value = null
      }
    } else {
      // 降级：浏览器环境使用 file input
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
          selectedFilePath.value = file.name
          fileSize.value = formatFileSize(file.size)
          conversionResult.value = null
        }
      }
      input.click()
    }
  } catch {
    ElMessage.warning(t('converter.noFile'))
  }
}

function onConversionChange(): void {
  conversionResult.value = null
}

// ── 转换执行 ──
async function handleConvert(): Promise<void> {
  if (!selectedFilePath.value || !selectedConversion.value) {
    ElMessage.warning(t('converter.noFile'))
    return
  }

  isConverting.value = true
  conversionResult.value = null

  try {
    // 通过 IPC 调用后端转换
    if (window.electronAPI?.convertFile) {
      const result = await window.electronAPI.convertFile({
        filePath: selectedFilePath.value,
        conversion: selectedConversion.value,
      })
      conversionResult.value = result || ''
    } else {
      // 前端占位：模拟转换结果
      conversionResult.value = await simulateConversion(selectedConversion.value)
    }
  } catch (err) {
    ElMessage.error(String(err))
    conversionResult.value = null
  } finally {
    isConverting.value = false
  }
}

/** 前端占位模拟转换（实际转换通过 IPC 后端） */
async function simulateConversion(type: string): Promise<string> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  const placeholder: Record<string, string> = {
    md2html: '<h1>Hello World</h1>\n<p>This is a converted HTML document.</p>',
    csv2json: '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]',
    json2csv: 'name,age\nAlice,30\nBob,25',
    xml2json: '{"root": {"item": [{"name": "Alice"}, {"name": "Bob"}]}}',
    json2xml: '<root><item><name>Alice</name></item><item><name>Bob</name></item></root>',
    yaml2json: '{"name": "Alice", "age": 30}',
    json2yaml: 'name: Alice\nage: 30',
  }

  return placeholder[type] || `// Conversion result for ${type}\n// Actual conversion via IPC backend`
}

// ── 复制结果 ──
async function copyResult(): Promise<void> {
  if (!conversionResult.value) return
  try {
    await navigator.clipboard.writeText(conversionResult.value)
    ElMessage.success(t('common.copied'))
  } catch {
    ElMessage.error('Failed to copy')
  }
}

// ── 下载结果 ──
function downloadResult(): void {
  if (!conversionResult.value) return
  const extMap: Record<string, string> = {
    md2html: '.html',
    csv2json: '.json',
    json2csv: '.csv',
    xml2json: '.json',
    json2xml: '.xml',
    yaml2json: '.json',
    json2yaml: '.yaml',
  }
  const ext = extMap[selectedConversion.value] || '.txt'
  const blob = new Blob([conversionResult.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
</script>

<style scoped>
.converter-page {
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

.converter-content {
  max-width: 720px;
}

.converter-card {
  border-radius: 8px;
  overflow: hidden;
}

.converter-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: var(--bg-secondary, #f5f7fa);
  border-bottom: 1px solid var(--border-light, #ebeef5);
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

/* ── 表单 ── */
.converter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}

.file-select-area {
  display: flex;
  gap: 8px;
}

.file-path-input {
  flex: 1;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-size {
  font-size: 13px;
  color: var(--text-secondary, #606266);
}

.form-actions {
  padding-top: 4px;
}

/* ── 结果 ── */
.conversion-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.result-actions {
  display: flex;
  gap: 8px;
}

.result-textarea :deep(textarea) {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-secondary, #f5f7fa);
}

/* ── 占位说明 ── */
.conversion-placeholder {
  padding-top: 4px;
}
</style>
