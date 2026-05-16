import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'
import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { createTables } from './schema'

let db: SqlJsDatabase | null = null

/** 获取数据库文件路径 */
function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'office-assistant.db')
}

/**
 * 初始化数据库
 * 首次运行时创建表结构，已有数据库则直接加载
 */
export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs()
  const dbPath = getDbPath()

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    createTables(db)
  }

  // 启用 WAL 模式
  db.run('PRAGMA journal_mode=WAL')

  return db
}

/** 获取数据库实例 */
export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * 保存数据库到文件
 */
export function saveDatabase(): void {
  if (!db) return
  const dbPath = getDbPath()
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

/**
 * 关闭数据库
 */
export function closeDatabase(): void {
  if (db) {
    saveDatabase()
    db.close()
    db = null
  }
}

// 应用退出时自动保存和关闭
app.on('before-quit', () => {
  closeDatabase()
})

// 定期自动保存 (每 30 秒)
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

export function startAutoSave(): void {
  if (autoSaveTimer) return
  autoSaveTimer = setInterval(() => {
    saveDatabase()
  }, 30000)
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}
