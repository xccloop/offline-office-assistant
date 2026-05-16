import { type Database } from 'sql.js'

/**
 * 创建所有数据库表
 */
export function createTables(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      birthday TEXT NOT NULL DEFAULT '',
      "group" TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date INTEGER,
      tags TEXT NOT NULL DEFAULT '[]',
      parent_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES todos(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'text',
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT '',
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS code_snippets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT '',
      code TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  // 索引
  db.run('CREATE INDEX IF NOT EXISTS idx_notes_parent_id ON notes(parent_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC)')
  db.run('CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)')
  db.run('CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)')
  db.run('CREATE INDEX IF NOT EXISTS idx_clipboard_created_at ON clipboard_history(created_at DESC)')

  // 默认设置
  const now = Date.now()
  db.run(`
    INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
    ('theme', 'light', ${now}),
    ('locale', 'zh-CN', ${now}),
    ('font_size', '14', ${now}),
    ('auto_save', 'true', ${now}),
    ('auto_save_interval', '60', ${now})
  `)
}
