/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface Window {
  electronAPI: {
    ping: () => Promise<{ status: string; timestamp: number }>
    getAppInfo: () => Promise<Record<string, string>>
    fs: {
      openFile: (options?: { filters?: { name: string; extensions: string[] }[]; multiSelections?: boolean }) => Promise<unknown>
      openFolder: () => Promise<unknown>
      saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<unknown>
      readFile: (filePath: string, encoding?: string) => Promise<unknown>
      readLargeFile: (filePath: string) => Promise<unknown>
      writeFile: (filePath: string, content: string) => Promise<unknown>
      listDir: (dirPath: string) => Promise<unknown>
      stat: (filePath: string) => Promise<unknown>
      delete: (filePath: string) => Promise<unknown>
      exists: (filePath: string) => Promise<unknown>
      rename: (oldPath: string, newPath: string) => Promise<unknown>
    }
    dialog: {
      openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath?: string }>
      saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath?: string }>
      openDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>
    }
    file: {
      read: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
      write: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
    }
    shell: {
      openPath: (filePath: string) => Promise<{ success: boolean; error?: string }>
    }
    screenshot: {
      capture: () => Promise<{ success: boolean; data?: { dataUrl: string }; error?: string }>
      save: (dataUrl: string) => Promise<{ success: boolean; data?: { filePath: string }; error?: string }>
    }
    openFileDialog: () => Promise<{ filePath: string; fileSize?: string } | null>
    convertFile: (params: { filePath: string; conversion: string }) => Promise<unknown>
    plugins: {
      list: () => Promise<unknown>
      get: (pluginId: string) => Promise<unknown>
      activate: (pluginId: string) => Promise<unknown>
      deactivate: (pluginId: string) => Promise<unknown>
      install: (pluginPath: string) => Promise<unknown>
      uninstall: (pluginId: string) => Promise<unknown>
    }
    db: {
      query: (sql: string, params?: unknown[]) => Promise<{ success: boolean; data?: unknown[]; error?: string }>
      execute: (sql: string, params?: unknown[]) => Promise<{ success: boolean; error?: string }>
      getStatus: () => Promise<{ success: boolean; data?: { tableCount: number; connected: boolean } }>
      getSetting: (key: string) => Promise<{ success: boolean; data?: string | null }>
      setSetting: (key: string, value: string) => Promise<{ success: boolean }>
    }
  }
}
