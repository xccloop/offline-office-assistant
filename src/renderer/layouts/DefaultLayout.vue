<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="app-aside">
      <div class="logo-section">
        <el-icon :size="24"><OfficeBuilding /></el-icon>
        <transition name="logo-fade">
          <span v-show="!isCollapse" class="logo-text">{{ $t('app.title') }}</span>
        </transition>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        collapse-transition
        class="sidebar-menu"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="'/' + item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ $t(item.title) }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            text
            @click="isCollapse = !isCollapse"
          />
          <span class="page-title">{{ $t(currentPageTitle) }}</span>
        </div>
        <div class="header-right">
          <el-switch
            v-model="isDark"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleTheme"
          />
          <el-dropdown @command="changeLang">
            <el-button text>
              {{ currentLang === 'zh-CN' ? '中文' : 'English' }}
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-main">
        <transition name="fade-slide" mode="out-in">
          <router-view />
        </transition>
      </el-main>

      <!-- Footer -->
      <el-footer class="app-footer">
        <span>{{ $t('app.title') }} v1.0.0</span>
        <span class="footer-sep">·</span>
        <span>MIT License</span>
        <span class="footer-sep">·</span>
        <span>Electron + Vue 3</span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'
import {
  OfficeBuilding, Expand, Fold, Moon, Sunny, ArrowDown,
} from '@element-plus/icons-vue'

const route = useRoute()
const { locale } = useI18n()
const themeStore = useThemeStore()

const isCollapse = ref(false)
const isDark = ref(false)
const currentLang = computed(() => locale.value)

const currentPageTitle = computed(() => {
  return (route.meta?.title as string) || 'nav.home'
})

const menuItems = computed(() => {
  const items: { path: string; title: string; icon: string }[] = []
  for (const childRoute of (route.matched[0]?.children || [])) {
    if (!childRoute.meta?.hidden) {
      items.push({
        path: childRoute.path,
        title: childRoute.meta?.title as string,
        icon: childRoute.meta?.icon as string,
      })
    }
  }
  return items
})

const activeMenu = computed(() => route.path)

function toggleTheme(val: boolean): void {
  themeStore.setTheme(val ? 'dark' : 'light')
}

function changeLang(lang: string): void {
  locale.value = lang
  try {
    localStorage.setItem('app_language', lang)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.app-container { height: 100vh; }
.app-aside {
  background-color: var(--aside-bg, #304156);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.logo-section {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}
.sidebar-menu { border-right: none; }

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color, #e6e6e6);
  background: var(--header-bg, #fff);
  padding: 0 16px;
  height: 50px;
  flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 16px; font-weight: 500; color: var(--text-primary, #303133); }
.header-right { display: flex; align-items: center; gap: 12px; }
.app-main {
  padding: 0;
  background: var(--main-bg, #f5f7fa);
  overflow: hidden;
  position: relative;
}
.app-footer {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #909399);
  border-top: 1px solid var(--border-color, #e6e6e6);
  background: var(--header-bg, #fff);
  flex-shrink: 0;
}
.footer-sep {
  opacity: 0.4;
}

/* ── Route transition ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Logo transition ── */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 0.2s ease;
}
.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
}
</style>
