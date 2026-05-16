import { ipcMain, desktopCapturer, dialog, type IpcMainInvokeEvent } from 'electron'
import * as fs from 'fs'

/** 注册截图相关 IPC handlers */
export function registerScreenshotIpc(): void {
  ipcMain.handle('screenshot:capture', async (_event: IpcMainInvokeEvent) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 },
      })

      if (!sources.length) {
        return { success: false, error: 'No screen sources found' }
      }

      const dataUrl = sources[0].thumbnail.toDataURL()
      return { success: true, data: { dataUrl } }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('screenshot:save', async (_event: IpcMainInvokeEvent, dataUrl: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: `screenshot_${Date.now()}.png`,
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save cancelled' }
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      fs.writeFileSync(result.filePath, buffer)

      return { success: true, data: { filePath: result.filePath } }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
