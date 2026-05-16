import { useNotesStore, type NoteVM, type NoteRow } from '@/renderer/stores/notes'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

/** 生成唯一 ID */
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 笔记 CRUD 和搜索逻辑 composable
 */
export function useNotes() {
  const store = useNotesStore()
  const { t } = useI18n()

  // ===== 数据库操作 =====

  /** 从数据库加载所有笔记 */
  async function fetchNotes(): Promise<void> {
    store.setLoading(true)
    try {
      const result = await window.electronAPI.db.query(
        'SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC',
      )
      if (result.success && result.data) {
        const notes = (result.data as NoteRow[]).map(store.rowToVM)
        store.setNotes(notes)
      } else {
        ElMessage.error(t('notes.loadFailed'))
      }
    } catch {
      ElMessage.error(t('notes.loadFailed'))
    } finally {
      store.setLoading(false)
    }
  }

  /** 创建新笔记 */
  async function createNote(title = '', content = ''): Promise<NoteVM | null> {
    const now = Date.now()
    const id = generateId()
    const note: NoteVM = {
      id,
      parentId: null,
      title: title || t('notes.untitled'),
      content,
      tags: [],
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    const row = store.vmToRow(note)

    try {
      const result = await window.electronAPI.db.execute(
        `INSERT INTO notes (id, parent_id, title, content, tags, is_pinned, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.id, row.parent_id, row.title, row.content, row.tags, row.is_pinned, row.created_at, row.updated_at],
      )
      if (result.success) {
        store.addNote(note)
        store.selectNote(id)
        return note
      }
      ElMessage.error(t('notes.saveFailed'))
      return null
    } catch {
      ElMessage.error(t('notes.saveFailed'))
      return null
    }
  }

  /** 保存（更新）笔记 */
  async function saveNote(id: string, updates: { title?: string; content?: string; tags?: string[]; isPinned?: boolean }): Promise<boolean> {
    const existing = store.notes.find(n => n.id === id)
    if (!existing) return false

    const merged = { ...existing, ...updates, updatedAt: Date.now() }
    const row = store.vmToRow(merged)

    try {
      const result = await window.electronAPI.db.execute(
        `UPDATE notes SET title = ?, content = ?, tags = ?, is_pinned = ?, updated_at = ? WHERE id = ?`,
        [row.title, row.content, row.tags, row.is_pinned, row.updated_at, row.id],
      )
      if (result.success) {
        store.updateNote(id, { ...updates, updatedAt: merged.updatedAt })
        return true
      }
      ElMessage.error(t('notes.saveFailed'))
      return false
    } catch {
      ElMessage.error(t('notes.saveFailed'))
      return false
    }
  }

  /** 删除笔记 */
  async function deleteNote(id: string): Promise<boolean> {
    try {
      const result = await window.electronAPI.db.execute(
        'DELETE FROM notes WHERE id = ?',
        [id],
      )
      if (result.success) {
        store.removeNote(id)
        ElMessage.success(t('notes.deleteSuccess'))
        return true
      }
      ElMessage.error(t('notes.saveFailed'))
      return false
    } catch {
      ElMessage.error(t('notes.saveFailed'))
      return false
    }
  }

  /** 搜索笔记（客户端过滤，也可扩展为数据库全文搜索） */
  function searchNotesLocally(query: string): void {
    store.setSearchQuery(query)
  }

  /** 按标签过滤 */
  function filterByTag(tag: string): void {
    store.setSelectedTag(tag)
  }

  return {
    store,
    fetchNotes,
    createNote,
    saveNote,
    deleteNote,
    searchNotesLocally,
    filterByTag,
  }
}
