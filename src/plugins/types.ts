/** 插件生命周期钩子 */
export interface PluginHooks {
  onActivate?: () => void | Promise<void>
  onDeactivate?: () => void | Promise<void>
  onReady?: () => void | Promise<void>
}

/** 插件上下文 — 暴露给插件的能力 */
export interface PluginContext {
  /** 插件 ID */
  id: string
  /** 日志 */
  logger: {
    info: (msg: string) => void
    warn: (msg: string) => void
    error: (msg: string) => void
  }
  /** 插件数据存储 */
  storage: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<void>
    remove: (key: string) => Promise<void>
  }
}

/** 插件定义 */
export interface Plugin {
  /** 插件清单 */
  manifest: PluginManifest
  /** 激活函数 */
  activate: (context: PluginContext) => void | Promise<void>
  /** 停用函数 */
  deactivate?: () => void | Promise<void>
}

/** 插件清单 */
export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  main: string
  permissions: PluginPermission[]
  icon?: string
  homepage?: string
}

/** 插件权限 */
export type PluginPermission =
  | 'file:read'
  | 'file:write'
  | 'database:read'
  | 'database:write'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notification'
  | 'network'

/** 插件状态 */
export type PluginStatus = 'inactive' | 'active' | 'error'

/** 插件注册信息 */
export interface PluginRegistryEntry {
  manifest: PluginManifest
  status: PluginStatus
  error?: string
  activatedAt?: number
}
