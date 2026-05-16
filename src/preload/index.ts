import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // ─── App ───
  ping: (): Promise<{ status: string; timestamp: number }> =>
    ipcRenderer.invoke('app:ping'),
  getAppInfo: (): Promise<Record<string, string>> =>
    ipcRenderer.invoke('app:getInfo'),

  // ─── File System (primary API used by TextEditor, PDF) ───
  fs: {
    openFile: (options?: { filters?: { name: string; extensions: string[] }[]; multiSelections?: boolean }) =>
      ipcRenderer.invoke('fs:openFile', options),
    openFolder: () => ipcRenderer.invoke('fs:openFolder'),
    saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('fs:saveFile', options),
    readFile: (filePath: string, encoding?: string) =>
      ipcRenderer.invoke('fs:readFile', filePath, encoding),
    readLargeFile: (filePath: string) =>
      ipcRenderer.invoke('fs:readLargeFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    listDir: (dirPath: string) => ipcRenderer.invoke('fs:listDir', dirPath),
    stat: (filePath: string) => ipcRenderer.invoke('fs:stat', filePath),
    delete: (filePath: string) => ipcRenderer.invoke('fs:delete', filePath),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    rename: (oldPath: string, newPath: string) =>
      ipcRenderer.invoke('fs:rename', oldPath, newPath),
  },

  // ─── Dialog (alias to fs, used by useRichText, SystemToolsPage) ───
  // Returns { canceled: boolean, filePath?: string } shape
  dialog: {
    async openFile(options?: { filters?: { name: string; extensions: string[] }[] }) {
      const result: any = await ipcRenderer.invoke('fs:openFile', {
        ...options,
        multiSelections: false,
      })
      return { canceled: !result.success || !result.data?.length, filePath: result.data?.[0] }
    },
    async saveFile(options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) {
      const result: any = await ipcRenderer.invoke('fs:saveFile', options)
      return { canceled: !result.success || !result.data, filePath: result.data }
    },
    async openDirectory() {
      const result: any = await ipcRenderer.invoke('fs:openFolder')
      return {
        canceled: !result.success,
        filePaths: result.data ? [result.data] : [],
      }
    },
  },

  // ─── File (alias to fs.readFile/writeFile, used by useRichText) ───
  file: {
    read: (filePath: string) =>
      ipcRenderer.invoke('fs:readFile', filePath, 'utf-8'),
    write: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
  },

  // ─── Shell (used by SystemToolsPage) ───
  shell: {
    openPath: (filePath: string) =>
      ipcRenderer.invoke('shell:openPath', filePath),
  },

  // ─── Open File Dialog (used by ConverterPage) ───
  async openFileDialog(): Promise<{ filePath: string; fileSize?: string } | null> {
    const result: any = await ipcRenderer.invoke('fs:openFile', {
      multiSelections: false,
    })
    if (!result.success || !result.data?.length) return null
    const filePath = result.data[0]
    // Get file size via stat
    const statResult: any = await ipcRenderer.invoke('fs:stat', filePath)
    return {
      filePath,
      fileSize: statResult.success ? String(statResult.data?.size || 0) : undefined,
    }
  },

  // ─── File Converter (used by ConverterPage) ───
  convertFile: (params: { filePath: string; conversion: string }) =>
    ipcRenderer.invoke('convert:file', params),

  // ─── Plugins ───
  plugins: {
    list: () => ipcRenderer.invoke('plugins:list'),
    get: (pluginId: string) => ipcRenderer.invoke('plugins:get', pluginId),
    activate: (pluginId: string) => ipcRenderer.invoke('plugins:activate', pluginId),
    deactivate: (pluginId: string) => ipcRenderer.invoke('plugins:deactivate', pluginId),
    install: (pluginPath: string) => ipcRenderer.invoke('plugins:install', pluginPath),
    uninstall: (pluginId: string) => ipcRenderer.invoke('plugins:uninstall', pluginId),
  },

  // ─── Screenshot ───
  screenshot: {
    capture: () => ipcRenderer.invoke('screenshot:capture'),
    save: (dataUrl: string) => ipcRenderer.invoke('screenshot:save', dataUrl),
  },

  // ─── Database ───
  db: {
    query: (sql: string, params?: unknown[]) =>
      ipcRenderer.invoke('db:query', sql, params),
    execute: (sql: string, params?: unknown[]) =>
      ipcRenderer.invoke('db:execute', sql, params),
    getStatus: () => ipcRenderer.invoke('db:status'),
    getSetting: (key: string) => ipcRenderer.invoke('db:getSetting', key),
    setSetting: (key: string, value: string) =>
      ipcRenderer.invoke('db:setSetting', key, value),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
