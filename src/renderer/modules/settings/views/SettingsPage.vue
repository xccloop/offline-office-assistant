<template>
  <div class="settings-page">
    <h2 class="page-title">{{ $t('nav.settings') }}</h2>

    <div class="settings-content">
      <!-- 主题设置 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Sunny /></el-icon>
            <span>{{ $t('settings.theme.title') }}</span>
          </div>
        </template>
        <el-form label-width="100px" label-position="left">
          <el-form-item :label="$t('settings.theme.title')">
            <el-radio-group v-model="themeMode" @change="onThemeChange">
              <el-radio-button value="light">
                <el-icon><Sunny /></el-icon>
                {{ $t('settings.theme.light') }}
              </el-radio-button>
              <el-radio-button value="dark">
                <el-icon><Moon /></el-icon>
                {{ $t('settings.theme.dark') }}
              </el-radio-button>
              <el-radio-button value="system">
                <el-icon><Monitor /></el-icon>
                {{ $t('settings.theme.system') }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 语言设置 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Opportunity /></el-icon>
            <span>{{ $t('settings.language.title') }}</span>
          </div>
        </template>
        <el-form label-width="100px" label-position="left">
          <el-form-item :label="$t('settings.language.title')">
            <el-select
              :model-value="currentLocale"
              @change="onLanguageChange"
              style="width: 200px"
            >
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 编辑器默认设置 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>{{ $t('settings.editor.title') }}</span>
          </div>
        </template>
        <el-form label-width="120px" label-position="left">
          <el-form-item :label="$t('settings.editor.fontSize')">
            <el-slider
              v-model="editorFontSize"
              :min="12"
              :max="32"
              :step="1"
              show-input
              :format-tooltip="(val: number) => `${val}px`"
              style="max-width: 300px"
            />
          </el-form-item>
          <el-form-item :label="$t('settings.editor.tabSize')">
            <el-input-number
              v-model="editorTabSize"
              :min="1"
              :max="8"
              :step="1"
              size="small"
            />
          </el-form-item>
          <el-form-item :label="$t('settings.editor.fontFamily')">
            <el-select
              v-model="editorFontFamily"
              style="width: 280px"
              filterable
            >
              <el-option
                v-for="font in fontFamilies"
                :key="font"
                :label="font"
                :value="font"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 自动保存设置 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Timer /></el-icon>
            <span>{{ $t('settings.autoSave.title') }}</span>
          </div>
        </template>
        <el-form label-width="120px" label-position="left">
          <el-form-item :label="$t('settings.autoSave.enabled')">
            <el-switch v-model="autoSaveEnabled" />
          </el-form-item>
          <el-form-item :label="$t('settings.autoSave.interval')">
            <el-slider
              v-model="autoSaveInterval"
              :min="5"
              :max="120"
              :step="5"
              show-input
              :disabled="!autoSaveEnabled"
              :format-tooltip="(val: number) => `${val} ${$t('common.seconds')}`"
              style="max-width: 300px"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 关于 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('settings.about.title') }}</span>
          </div>
        </template>
        <div class="about-section">
          <div class="about-logo">
            <el-icon :size="48" color="var(--el-color-primary)"><OfficeBuilding /></el-icon>
          </div>
          <h3 class="about-app-name">{{ $t('app.title') }}</h3>
          <p class="about-desc">{{ $t('settings.about.description') }}</p>
          <el-divider />
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item :label="$t('settings.about.version')">
              <el-tag type="primary" size="small">v1.0.0</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('settings.about.license')">
              {{ $t('settings.about.licenseValue') }}
            </el-descriptions-item>
            <el-descriptions-item label="Electron">
              v28.x
            </el-descriptions-item>
            <el-descriptions-item label="Vue">
              v3.x
            </el-descriptions-item>
            <el-descriptions-item label="Node.js">
              v20.x
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Sunny,
  Moon,
  Monitor,
  Opportunity,
  Edit,
  Timer,
  InfoFilled,
  OfficeBuilding,
} from '@element-plus/icons-vue'
import { useThemeStore, type ThemeMode } from '@/renderer/stores/theme'

const { t, locale } = useI18n()
const themeStore = useThemeStore()

// ── 主题 ──
const themeMode = ref<ThemeMode>(themeStore.mode)

function onThemeChange(mode: ThemeMode): void {
  themeStore.setTheme(mode)
  localStorage.setItem('app-theme', mode)
  ElMessage.success(t('settings.saved'))
}

// ── 语言 ──
const currentLocale = ref<string>(locale.value)

function onLanguageChange(lang: string): void {
  locale.value = lang
  currentLocale.value = lang
  localStorage.setItem('app-locale', lang)
  ElMessage.success(t('settings.saved'))
}

// ── 编辑器默认值 ──
const EDITOR_FONT_SIZE_KEY = 'editor-font-size'
const EDITOR_TAB_SIZE_KEY = 'editor-tab-size'
const EDITOR_FONT_FAMILY_KEY = 'editor-font-family'

const editorFontSize = ref(16)
const editorTabSize = ref(2)
const editorFontFamily = ref("'Cascadia Code', 'Fira Code', 'Consolas', monospace")

const fontFamilies = [
  "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
  "'JetBrains Mono', 'Consolas', monospace",
  "'Source Code Pro', 'Consolas', monospace",
  "'Fira Code', 'Consolas', monospace",
  "'Consolas', monospace",
  "'Courier New', monospace",
  "'Microsoft YaHei Mono', monospace",
]

watch([editorFontSize, editorTabSize, editorFontFamily], () => {
  localStorage.setItem(EDITOR_FONT_SIZE_KEY, String(editorFontSize.value))
  localStorage.setItem(EDITOR_TAB_SIZE_KEY, String(editorTabSize.value))
  localStorage.setItem(EDITOR_FONT_FAMILY_KEY, editorFontFamily.value)
})

// ── 自动保存 ──
const AUTO_SAVE_ENABLED_KEY = 'auto-save-enabled'
const AUTO_SAVE_INTERVAL_KEY = 'auto-save-interval'

const autoSaveEnabled = ref(true)
const autoSaveInterval = ref(30)

watch([autoSaveEnabled, autoSaveInterval], () => {
  localStorage.setItem(AUTO_SAVE_ENABLED_KEY, String(autoSaveEnabled.value))
  localStorage.setItem(AUTO_SAVE_INTERVAL_KEY, String(autoSaveInterval.value))
})

// ── 初始化 ──
onMounted(() => {
  // 主题
  const savedTheme = localStorage.getItem('app-theme') as ThemeMode | null
  if (savedTheme) {
    themeMode.value = savedTheme
    themeStore.setTheme(savedTheme)
  }

  // 语言
  const savedLocale = localStorage.getItem('app-locale')
  if (savedLocale) {
    locale.value = savedLocale
    currentLocale.value = savedLocale
  }

  // 编辑器
  const savedFontSize = localStorage.getItem(EDITOR_FONT_SIZE_KEY)
  if (savedFontSize) editorFontSize.value = Number(savedFontSize)

  const savedTabSize = localStorage.getItem(EDITOR_TAB_SIZE_KEY)
  if (savedTabSize) editorTabSize.value = Number(savedTabSize)

  const savedFontFamily = localStorage.getItem(EDITOR_FONT_FAMILY_KEY)
  if (savedFontFamily) editorFontFamily.value = savedFontFamily

  // 自动保存
  const savedAutoSave = localStorage.getItem(AUTO_SAVE_ENABLED_KEY)
  if (savedAutoSave !== null) autoSaveEnabled.value = savedAutoSave === 'true'

  const savedInterval = localStorage.getItem(AUTO_SAVE_INTERVAL_KEY)
  if (savedInterval) autoSaveInterval.value = Number(savedInterval)
})
</script>

<style scoped>
.settings-page {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
}

.settings-card {
  border-radius: 8px;
  overflow: hidden;
}

.settings-card :deep(.el-card__header) {
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

/* ── 关于 ── */
.about-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.about-logo {
  margin-bottom: 8px;
}

.about-app-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #303133);
  margin: 8px 0 4px;
}

.about-desc {
  font-size: 14px;
  color: var(--text-secondary, #606266);
  max-width: 400px;
  line-height: 1.6;
  margin: 0;
}

.about-section :deep(.el-divider) {
  width: 100%;
  margin: 16px 0;
}

.about-section :deep(.el-descriptions) {
  width: 100%;
}

/* ── 表单微调 ── */
.settings-card :deep(.el-form-item) {
  margin-bottom: 8px;
}

.settings-card :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.settings-card :deep(.el-radio-group) {
  display: flex;
  gap: 0;
}
</style>
