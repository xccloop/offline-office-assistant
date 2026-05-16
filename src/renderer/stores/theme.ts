import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app_theme_mode'

/**
 * 主题状态管理 store
 * 管理应用的主题模式切换（亮色/暗色/跟随系统），持久化到 localStorage
 */
export const useThemeStore = defineStore('theme', () => {
  /** 从 localStorage 读取持久化的主题 */
  function loadPersistedMode(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch { /* ignore */ }
    return 'system'
  }

  /** 当前主题模式 */
  const mode = ref<ThemeMode>(loadPersistedMode())

  /** CSS 已应用的当前主题 */
  const current = ref<'light' | 'dark'>('light')

  /**
   * 设置主题模式并应用对应的 CSS 变量
   * @param newMode - 目标主题模式
   */
  function setTheme(newMode: ThemeMode): void {
    mode.value = newMode

    // 持久化
    try {
      localStorage.setItem(STORAGE_KEY, newMode)
    } catch { /* ignore */ }

    if (newMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
    } else {
      applyTheme(newMode)
    }
  }

  /** 初始化主题（检测系统偏好并监听变化） */
  function initTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // 监听系统主题变化（仅在 system 模式下响应）
    const handler = (): void => {
      if (mode.value === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handler)

    setTheme(mode.value)
  }

  /** 内部：应用 CSS 变量 */
  function applyTheme(theme: 'light' | 'dark'): void {
    current.value = theme

    // Toggle dark class on html element (CSS uses html.dark selector)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
  }

  return { mode, current, setTheme, initTheme }
})
