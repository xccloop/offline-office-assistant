/** 应用主题模式 */
export type ThemeMode = 'light' | 'dark' | 'system'

/** 支持的语言 */
export type SupportedLocale = 'zh-CN' | 'en'

/** 文件信息 */
export interface FileInfo {
  path: string
  name: string
  ext: string
  size: number
  modifiedAt: number
}

/** 应用设置 */
export interface AppSettings {
  theme: ThemeMode
  locale: SupportedLocale
  autoSave: boolean
  autoSaveInterval: number
  fontSize: number
}

/** IPC 响应 */
export interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/** 插件清单 */
export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  main: string
  permissions: string[]
}

/** 数据库记录基类 */
export interface BaseRecord {
  id: string
  createdAt: number
  updatedAt: number
}

/** 笔记记录 */
export interface NoteRecord extends BaseRecord {
  parentId: string | null
  title: string
  content: string
  tags: string[]
  isPinned: boolean
}

/** 联系人记录 */
export interface ContactRecord extends BaseRecord {
  name: string
  phone: string
  email: string
  address: string
  birthday: string
  group: string
  notes: string
}

/** 待办事项 */
export interface TodoRecord extends BaseRecord {
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: number | null
  tags: string[]
  parentId: string | null
}

/** 剪贴板条目 */
export interface ClipboardEntry extends BaseRecord {
  type: 'text' | 'image' | 'file'
  content: string
  source: string
  isPinned: boolean
}
