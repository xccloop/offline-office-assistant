import { ipcMain, dialog, type IpcMainInvokeEvent } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export function registerFilesystemIpc(): void {
  // 打开文件选择对话框
  ipcMain.handle('fs:openFile', async (_event: IpcMainInvokeEvent, options?: {
    filters?: { name: string; extensions: string[] }[]
    multiSelections?: boolean
  }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', ...(options?.multiSelections ? ['multiSelections' as const] : [])],
      filters: options?.filters,
    })
    return { success: !result.canceled, data: result.filePaths }
  })

  // 打开文件夹选择对话框
  ipcMain.handle('fs:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    return { success: !result.canceled, data: result.filePaths }
  })

  // 保存文件对话框
  ipcMain.handle('fs:saveFile', async (_event: IpcMainInvokeEvent, options?: {
    defaultPath?: string
    filters?: { name: string; extensions: string[] }[]
  }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    })
    return { success: !result.canceled, data: result.filePath }
  })

  // 读取文件内容
  ipcMain.handle('fs:readFile', (_event: IpcMainInvokeEvent, filePath: string, encoding?: BufferEncoding) => {
    try {
      const content = fs.readFileSync(filePath, encoding || 'utf-8')
      return { success: true, data: content.toString() }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 读取大文件 (流式)
  ipcMain.handle('fs:readLargeFile', (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const stat = fs.statSync(filePath)
      if (stat.size > 100 * 1024 * 1024) {
        const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 })
        const chunks: Buffer[] = []
        return new Promise<{ success: boolean; data?: string; error?: string }>((resolve) => {
          stream.on('data', (chunk) => chunks.push(chunk as Buffer))
          stream.on('end', () => {
            resolve({ success: true, data: Buffer.concat(chunks).toString('utf-8') })
          })
          stream.on('error', (err) => {
            resolve({ success: false, error: String(err) })
          })
        })
      }
      const content = fs.readFileSync(filePath, 'utf-8')
      return { success: true, data: content }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 写入文件
  ipcMain.handle('fs:writeFile', (_event: IpcMainInvokeEvent, filePath: string, content: string) => {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 列出目录内容
  ipcMain.handle('fs:listDir', (_event: IpcMainInvokeEvent, dirPath: string) => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      const result = entries.map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }))
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 获取文件信息
  ipcMain.handle('fs:stat', (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const stat = fs.statSync(filePath)
      return {
        success: true,
        data: {
          size: stat.size,
          createdAt: stat.birthtimeMs,
          modifiedAt: stat.mtimeMs,
          isDirectory: stat.isDirectory(),
          isFile: stat.isFile(),
        },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 删除文件
  ipcMain.handle('fs:delete', (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      fs.unlinkSync(filePath)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 重命名/移动文件
  ipcMain.handle('fs:rename', (_event: IpcMainInvokeEvent, oldPath: string, newPath: string) => {
    try {
      const dir = path.dirname(newPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.renameSync(oldPath, newPath)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 检查文件是否存在
  ipcMain.handle('fs:exists', (_event: IpcMainInvokeEvent, filePath: string) => {
    return { success: true, data: fs.existsSync(filePath) }
  })
}
