import { ipcMain } from 'electron'
import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import type { PluginManifest, PluginRegistryEntry, PluginStatus } from '../../plugins/types'

const plugins: Map<string, PluginRegistryEntry> = new Map()

/** 插件目录 */
function getPluginsDir(): string {
  return path.join(app.getPath('userData'), 'plugins')
}

/**
 * 扫描已安装的插件
 */
function scanPlugins(): PluginManifest[] {
  const pluginsDir = getPluginsDir()
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true })
    return []
  }

  const manifests: PluginManifest[] = []
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifestPath = path.join(pluginsDir, entry.name, 'manifest.json')
    if (fs.existsSync(manifestPath)) {
      try {
        const content = fs.readFileSync(manifestPath, 'utf-8')
        const manifest: PluginManifest = JSON.parse(content)
        manifests.push(manifest)
      } catch {
        console.error(`Failed to load plugin manifest: ${entry.name}`)
      }
    }
  }

  return manifests
}

/** 注册插件 IPC handlers */
export function registerPluginsIpc(): void {
  // 刷新插件列表
  const discoveredPlugins = scanPlugins()
  for (const manifest of discoveredPlugins) {
    if (!plugins.has(manifest.id)) {
      plugins.set(manifest.id, {
        manifest,
        status: 'inactive',
      })
    }
  }

  // 获取所有插件
  ipcMain.handle('plugins:list', () => {
    const list: PluginRegistryEntry[] = []
    for (const entry of plugins.values()) {
      list.push({ ...entry })
    }
    return { success: true, data: list }
  })

  // 获取单个插件
  ipcMain.handle('plugins:get', (_event, pluginId: string) => {
    const entry = plugins.get(pluginId)
    if (!entry) {
      return { success: false, error: `Plugin not found: ${pluginId}` }
    }
    return { success: true, data: { ...entry } }
  })

  // 激活插件
  ipcMain.handle('plugins:activate', async (_event, pluginId: string) => {
    const entry = plugins.get(pluginId)
    if (!entry) {
      return { success: false, error: `Plugin not found: ${pluginId}` }
    }

    try {
      entry.status = 'active'
      entry.activatedAt = Date.now()
      plugins.set(pluginId, entry)
      return { success: true, data: { ...entry } }
    } catch (error) {
      entry.status = 'error'
      entry.error = String(error)
      plugins.set(pluginId, entry)
      return { success: false, error: String(error) }
    }
  })

  // 停用插件
  ipcMain.handle('plugins:deactivate', (_event, pluginId: string) => {
    const entry = plugins.get(pluginId)
    if (!entry) {
      return { success: false, error: `Plugin not found: ${pluginId}` }
    }

    entry.status = 'inactive'
    plugins.set(pluginId, entry)
    return { success: true, data: { ...entry } }
  })

  // 安装插件
  ipcMain.handle('plugins:install', (_event, pluginPath: string) => {
    try {
      const manifestContent = fs.readFileSync(pluginPath, 'utf-8')
      const manifest: PluginManifest = JSON.parse(manifestContent)

      plugins.set(manifest.id, {
        manifest,
        status: 'inactive',
      })

      return { success: true, data: manifest }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 卸载插件
  ipcMain.handle('plugins:uninstall', (_event, pluginId: string) => {
    if (!plugins.has(pluginId)) {
      return { success: false, error: `Plugin not found: ${pluginId}` }
    }

    plugins.delete(pluginId)
    return { success: true }
  })
}
