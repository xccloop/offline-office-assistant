import { ipcMain } from 'electron'
import { getDatabase, saveDatabase } from '../database'

/** sql.js 的 SQL 值类型 — 简单类型别名避开严格的泛型约束 */
type SqlValue = string | number | null | Uint8Array

/** 注册数据库相关 IPC handlers */
export function registerDatabaseIpc(): void {
  // 通用查询执行
  ipcMain.handle('db:query', (_event, sql: string, params?: SqlValue[]) => {
    try {
      const db = getDatabase()
      const stmt = db.prepare(sql)
      if (params) stmt.bind(params)
      const results: unknown[] = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return { success: true, data: results }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 执行写入操作
  ipcMain.handle('db:execute', (_event, sql: string, params?: SqlValue[]) => {
    try {
      const db = getDatabase()
      db.run(sql, params)
      saveDatabase()
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 获取数据库状态
  ipcMain.handle('db:status', () => {
    try {
      const db = getDatabase()
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")
      const tableCount = tables[0]?.values?.length || 0
      return {
        success: true,
        data: { tableCount, connected: true },
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 获取设置
  ipcMain.handle('db:getSetting', (_event, key: string) => {
    try {
      const db = getDatabase()
      const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
      stmt.bind([key])
      if (stmt.step()) {
        const row = stmt.getAsObject()
        stmt.free()
        return { success: true, data: row.value }
      }
      stmt.free()
      return { success: true, data: null }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 保存设置
  ipcMain.handle('db:setSetting', (_event, key: string, value: string) => {
    try {
      const db = getDatabase()
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        [key, value, Date.now()],
      )
      saveDatabase()
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
