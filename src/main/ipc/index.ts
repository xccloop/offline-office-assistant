import { ipcMain } from 'electron'
import { registerDatabaseIpc } from './database'
import { registerPluginsIpc } from './plugins'
import { registerFilesystemIpc } from './filesystem'
import { registerShellIpc } from './shell'
import { registerConverterIpc } from './converter'
import { registerScreenshotIpc } from './screenshot'

export function registerAllIpcHandlers(): void {
  // 注册数据库 IPC
  registerDatabaseIpc()
  // 注册插件系统 IPC
  registerPluginsIpc()
  // 注册文件系统 IPC
  registerFilesystemIpc()
  // 注册 Shell IPC
  registerShellIpc()
  // 注册文件转换 IPC
  registerConverterIpc()
  // 注册截图 IPC
  registerScreenshotIpc()

  // 基础 ping 测试
  ipcMain.handle('app:ping', () => {
    return { status: 'ok', timestamp: Date.now() }
  })

  // 获取应用信息
  ipcMain.handle('app:getInfo', () => {
    return {
      version: '1.0.0',
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
    }
  })
}
