import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** 笔记原始数据（来自数据库） */
export interface NoteRow {
  id: string
  parent_id: string | null
  title: string
  content: string
  tags: string
  is_pinned: number
  created_at: number
  updated_at: number
}

/** 笔记视图模型 */
export interface NoteVM {
  id: string
  parentId: string | null
  title: string
  content: string
  tags: string[]       // 解析后的标签数组
  isPinned: boolean
  createdAt: number
  updatedAt: number
}

/** 将数据库行转换为视图模型 */
function rowToVM(row: NoteRow): NoteVM {
  let tags: string[] = []
  try {
    tags = JSON.parse(row.tags)
    if (!Array.isArray(tags)) tags = []
  } catch {
    tags = row.tags ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  }
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.title,
    content: row.content,
    tags,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** 将视图模型转换为数据库行 */
function vmToRow(vm: NoteVM): Omit<NoteRow, 'parent_id' | 'is_pinned'> & { parent_id: string | null; is_pinned: number } {
  return {
    id: vm.id,
    parent_id: vm.parentId,
    title: vm.title,
    content: vm.content,
    tags: JSON.stringify(vm.tags),
    is_pinned: vm.isPinned ? 1 : 0,
    created_at: vm.createdAt,
    updated_at: vm.updatedAt,
  }
}

/**
 * 笔记状态管理 store
 */
export const useNotesStore = defineStore('notes', () => {
  /** 所有笔记 */
  const notes = ref<NoteVM[]>([])

  /** 当前选中的笔记 ID */
  const selectedId = ref<string | null>(null)

  /** 搜索关键词 */
  const searchQuery = ref('')

  /** 选中的标签过滤（空字符串表示全部） */
  const selectedTag = ref('')

  /** 当前查看模式：edit | preview */
  const viewMode = ref<'edit' | 'preview'>('edit')

  /** 是否正在加载 */
  const loading = ref(false)

  // ===== 计算属性 =====

  /** 当前选中的笔记 */
  const selectedNote = computed<NoteVM | null>(() => {
    if (!selectedId.value) return null
    return notes.value.find(n => n.id === selectedId.value) || null
  })

  /** 所有不重复的标签 */
  const allTags = computed<string[]>(() => {
    const tagSet = new Set<string>()
    for (const note of notes.value) {
      for (const tag of note.tags) {
        if (tag) tagSet.add(tag)
      }
    }
    return Array.from(tagSet).sort()
  })

  /** 过滤后的笔记列表 */
  const filteredNotes = computed<NoteVM[]>(() => {
    let result = notes.value

    // 按标签过滤
    if (selectedTag.value) {
      result = result.filter(n => n.tags.includes(selectedTag.value))
    }

    // 按搜索词过滤
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
      )
    }

    // 排序：置顶优先，然后按更新时间倒序
    return [...result].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })
  })

  // ===== 动作 =====

  /** 设置笔记列表 */
  function setNotes(list: NoteVM[]): void {
    notes.value = list
  }

  /** 选中笔记 */
  function selectNote(id: string | null): void {
    selectedId.value = id
    viewMode.value = 'edit'
  }

  /** 添加笔记到列表 */
  function addNote(note: NoteVM): void {
    notes.value.unshift(note)
  }

  /** 更新笔记 */
  function updateNote(id: string, updates: Partial<NoteVM>): void {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes.value[idx] = { ...notes.value[idx], ...updates, updatedAt: Date.now() }
    }
  }

  /** 从列表移除笔记 */
  function removeNote(id: string): void {
    notes.value = notes.value.filter(n => n.id !== id)
    if (selectedId.value === id) {
      selectedId.value = null
    }
  }

  /** 设置搜索词 */
  function setSearchQuery(q: string): void {
    searchQuery.value = q
  }

  /** 设置标签过滤 */
  function setSelectedTag(tag: string): void {
    selectedTag.value = tag
  }

  /** 切换查看模式 */
  function setViewMode(mode: 'edit' | 'preview'): void {
    viewMode.value = mode
  }

  /** 设置加载状态 */
  function setLoading(val: boolean): void {
    loading.value = val
  }

  return {
    notes,
    selectedId,
    searchQuery,
    selectedTag,
    viewMode,
    loading,
    selectedNote,
    allTags,
    filteredNotes,
    setNotes,
    selectNote,
    addNote,
    updateNote,
    removeNote,
    setSearchQuery,
    setSelectedTag,
    setViewMode,
    setLoading,
    rowToVM,
    vmToRow,
  }
})
