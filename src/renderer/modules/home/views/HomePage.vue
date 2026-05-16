<template>
  <div class="home-page">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          欢迎秋徐晨 👋
        </h1>
        <p class="welcome-desc">{{ currentDate }}</p>
      </div>
      <div class="welcome-stats">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(64, 158, 255, 0.1);">
            <el-icon :size="24" color="#409eff"><SetUp /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalModules }}</span>
            <span class="stat-label">{{ $t('common.modules') }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(103, 194, 58, 0.1);">
            <el-icon :size="24" color="#67c23a"><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">100%</span>
            <span class="stat-label">Offline</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(230, 162, 60, 0.1);">
            <el-icon :size="24" color="#e6a23c"><Star /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-value">MIT</span>
            <span class="stat-label">License</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Access Grid -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <el-icon><Grid /></el-icon>
          <span>{{ $t('common.quickAccess') }}</span>
        </div>
      </template>
      <div class="quick-grid">
        <div
          v-for="item in quickLinks"
          :key="item.path"
          class="quick-item"
          @click="$router.push(item.path)"
        >
          <div class="quick-icon" :style="{ background: item.color }">
            <el-icon :size="22"><component :is="item.icon" /></el-icon>
          </div>
          <span class="quick-label">{{ $t(item.title) }}</span>
        </div>
      </div>
    </el-card>

    <!-- Recent Activity -->
    <el-card class="section-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <el-icon><Timer /></el-icon>
          <span>{{ $t('common.recentActivity') }}</span>
        </div>
      </template>
      <div v-if="recentItems.length > 0" class="recent-list">
        <div
          v-for="(item, idx) in recentItems"
          :key="idx"
          class="recent-item"
        >
          <el-icon :size="14" class="recent-dot"><component :is="item.icon" /></el-icon>
          <span class="recent-text">{{ item.text }}</span>
          <span class="recent-time">{{ item.time }}</span>
        </div>
      </div>
      <el-empty
        v-else
        :description="$t('common.noRecentActivity')"
        :image-size="50"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SetUp,
  Connection,
  Star,
  Grid,
  Timer,
  Document,
  Edit,
  Tickets,
  View,
  Reading,
  VideoPlay,
  Notebook,
  Present,
  Tools,
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ── Greeting ──
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

const totalModules = 13

// ── Quick Access Grid ──
const quickLinks = [
  { path: '/markdown', title: 'nav.markdown', icon: 'Edit', color: 'rgba(64, 158, 255, 0.1)' },
  { path: '/richtext', title: 'nav.richtext', icon: 'Document', color: 'rgba(103, 194, 58, 0.1)' },
  { path: '/text', title: 'nav.text', icon: 'Tickets', color: 'rgba(144, 147, 153, 0.1)' },
  { path: '/spreadsheet', title: 'nav.spreadsheet', icon: 'Grid', color: 'rgba(64, 158, 255, 0.1)' },
  { path: '/presentation', title: 'nav.presentation', icon: 'Present', color: 'rgba(230, 162, 60, 0.1)' },
  { path: '/pdf', title: 'nav.pdf', icon: 'Reading', color: 'rgba(245, 108, 108, 0.1)' },
  { path: '/converter', title: 'nav.converter', icon: 'Connection', color: 'rgba(103, 194, 58, 0.1)' },
  { path: '/ocr', title: 'nav.ocr', icon: 'View', color: 'rgba(144, 147, 153, 0.1)' },
  { path: '/tools', title: 'nav.tools', icon: 'Tools', color: 'rgba(64, 158, 255, 0.1)' },
  { path: '/notes', title: 'nav.notes', icon: 'Notebook', color: 'rgba(230, 162, 60, 0.1)' },
  { path: '/automation', title: 'nav.automation', icon: 'VideoPlay', color: 'rgba(245, 108, 108, 0.1)' },
  { path: '/settings', title: 'nav.settings', icon: 'Setting', color: 'rgba(144, 147, 153, 0.1)' },
]

// ── Recent Activity (placeholder) ──
const recentItems = computed(() => [
  { text: '欢迎秋徐晨 👋', time: 'Just now', icon: 'Star' },
])
</script>

<style scoped>
.home-page {
  padding: 24px;
  height: calc(100vh - 112px); /* header 50 + footer 32 + some margins */
  overflow-y: auto;
  background: var(--main-bg, #f5f7fa);
}

/* ── Welcome Section ── */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.welcome-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.welcome-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* ── Section Cards ── */
.section-card {
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color, #e4e7ed);
}

.section-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-light, #ebeef5);
  background: var(--bg-primary, #fff);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.section-header .el-icon {
  color: var(--el-color-primary, #409eff);
}

/* ── Quick Access Grid ── */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  padding: 4px 0;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
}

.quick-item:hover {
  background: var(--bg-secondary, #f5f7fa);
  transform: translateY(-2px);
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary, #409eff);
}

.quick-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  white-space: nowrap;
}

/* ── Recent Activity ── */
.recent-list {
  display: flex;
  flex-direction: column;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light, #ebeef5);
}
.recent-item:last-child {
  border-bottom: none;
}

.recent-dot {
  color: var(--el-color-primary, #409eff);
}

.recent-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary, #303133);
}

.recent-time {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .quick-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .quick-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .welcome-stats {
    width: 100%;
    justify-content: flex-start;
  }
  .stat-card {
    flex: 1;
    min-width: 100px;
  }
}

@media (max-width: 600px) {
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
