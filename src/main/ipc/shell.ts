import { ipcMain, shell, type IpcMainInvokeEvent } from 'electron'

/** 注册 shell 相关 IPC handlers */
export function registerShellIpc(): void {
  // 用系统默认程序打开文件/路径
  ipcMain.handle('shell:openPath', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const error = await shell.openPath(filePath)
      if (error) {
        return { success: false, error }
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
