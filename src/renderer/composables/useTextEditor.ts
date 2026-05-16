import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { EditorState, type Extension } from '@codemirror/state'
import {
  EditorView,
  keymap,
  placeholder as cmPlaceholder,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  undo,
  redo,
} from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
  indentOnInput,
  type LanguageSupport,
} from '@codemirror/language'
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import {
  searchKeymap,
  highlightSelectionMatches,
  openSearchPanel,
  closeSearchPanel,
} from '@codemirror/search'

/** Supported programming / markup languages for syntax highlighting */
export type EditorLanguage =
  | 'plaintext'
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'python'
  | 'json'

/** Map language identifiers to human-readable labels (i18n keys) */
export const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  plaintext: 'text.plainText',
  javascript: 'text.javascript',
  typescript: 'text.typescript',
  html: 'text.html',
  css: 'text.css',
  python: 'text.python',
  json: 'text.json',
}

/** Map language identifiers to common file extensions for save/open dialogs */
export const LANGUAGE_EXTENSIONS: Record<EditorLanguage, string[]> = {
  plaintext: ['txt'],
  javascript: ['js', 'mjs'],
  typescript: ['ts', 'tsx'],
  html: ['html', 'htm'],
  css: ['css', 'scss', 'less'],
  python: ['py'],
  json: ['json', 'jsonc'],
}

/** Detect language from a file extension string */
export function detectLanguageFromPath(filePath: string): EditorLanguage {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const extMap: Record<string, EditorLanguage> = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    html: 'html', htm: 'html',
    css: 'css', scss: 'css', less: 'css',
    py: 'python', pyw: 'python',
    json: 'json', jsonc: 'json',
  }
  return extMap[ext] ?? 'plaintext'
}

/** Result from the open-file dialog IPC */
interface OpenFileResult {
  success: boolean
  data?: string[]
  error?: string
}

/** Result from the read-file IPC */
interface ReadFileResult {
  success: boolean
  data?: string
  error?: string
}

/** Result from the save-file dialog IPC */
interface SaveFileResult {
  success: boolean
  data?: string
  error?: string
}

/** Result from the write-file IPC */
interface WriteFileResult {
  success: boolean
  error?: string
}

/**
 * Text / code editor composable.
 * Wraps CodeMirror 6 with multi-language syntax highlighting, undo/redo,
 * find/replace, and file I/O via the Electron preload bridge.
 */
export function useTextEditor() {
  /** Current editor content */
  const content: Ref<string> = ref('')
  /** Current active language mode */
  const language: Ref<EditorLanguage> = ref('plaintext')
  /** Tracks unsaved changes */
  const isDirty: Ref<boolean> = ref(false)
  /** Currently opened file path (empty when untitled) */
  const currentFilePath: Ref<string> = ref('')

  /** Document statistics */
  const wordCount: Ref<number> = ref(0)
  const lineCount: Ref<number> = ref(0)
  const charCount: Ref<number> = ref(0)

  /** Shallow ref to CodeMirror EditorView – avoids deep reactivity overhead */
  const editorViewRef: ShallowRef<EditorView | null> = shallowRef(null)

  /** Whether the search panel is currently visible */
  const isSearchOpen: Ref<boolean> = ref(false)

  // -------------------------------------------------------------------
  // Lazy-load language extensions (only when switching language)
  // -------------------------------------------------------------------
  async function loadLanguageExtension(lang: EditorLanguage): Promise<Extension> {
    switch (lang) {
      case 'javascript':
        return (await import('@codemirror/lang-javascript')).javascript()
      case 'typescript':
        return (await import('@codemirror/lang-javascript')).javascript({
          typescript: true,
        })
      case 'html':
        return (await import('@codemirror/lang-html')).html()
      case 'css':
        return (await import('@codemirror/lang-css')).css()
      case 'python':
        return (await import('@codemirror/lang-python')).python()
      case 'json':
        return (await import('@codemirror/lang-json')).json()
      default:
        return []
    }
  }

  // -------------------------------------------------------------------
  // Recalculate document statistics
  // -------------------------------------------------------------------
  function updateStats(): void {
    const text = content.value
    charCount.value = text.length
    lineCount.value = text.split('\n').length
    wordCount.value = text.trim() ? text.trim().split(/\s+/).length : 0
  }

  // -------------------------------------------------------------------
  // Build the full CodeMirror extension set
  // -------------------------------------------------------------------
  async function buildExtensions(
    i18nPlaceholder: string,
    lang: EditorLanguage,
  ): Promise<Extension[]> {
    const langExtension = await loadLanguageExtension(lang)

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        content.value = update.state.doc.toString()
        isDirty.value = true
        updateStats()
      }
    })

    return [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      cmPlaceholder(i18nPlaceholder),
      langExtension,
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      updateListener,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-scroller': {
          overflow: 'auto',
        },
        '.cm-gutters': {
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--el-color-primary-light-9)',
        },
        '.cm-activeLine': {
          backgroundColor: 'var(--el-color-primary-light-9)',
        },
        '.cm-cursor': {
          borderLeftColor: 'var(--text-primary)',
        },
        '.cm-selectionBackground, .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--el-color-primary-light-5) !important',
        },
      }),
    ]
  }

  // -------------------------------------------------------------------
  // Initialize / reconfigure the CodeMirror editor
  // -------------------------------------------------------------------
  async function initEditor(
    parent: HTMLElement,
    i18nPlaceholder: string,
    initialLanguage: EditorLanguage = 'plaintext',
    initialContent = '',
  ): Promise<void> {
    // Destroy previous instance
    if (editorViewRef.value) {
      editorViewRef.value.destroy()
    }

    language.value = initialLanguage
    content.value = initialContent

    const extensions = await buildExtensions(i18nPlaceholder, initialLanguage)

    const state = EditorState.create({
      doc: initialContent,
      extensions,
    })

    const view = new EditorView({
      state,
      parent,
    })

    editorViewRef.value = view
    updateStats()
  }

  // -------------------------------------------------------------------
  // Switch editor language (reconfigures the entire state)
  // -------------------------------------------------------------------
  async function switchLanguage(lang: EditorLanguage): Promise<void> {
    const view = editorViewRef.value
    if (!view) return

    language.value = lang
    const docText = view.state.doc.toString()
    const extensions = await buildExtensions('', lang)

    const newState = EditorState.create({
      doc: docText,
      extensions,
    })

    view.setState(newState)
  }

  // -------------------------------------------------------------------
  // Destroy the editor
  // -------------------------------------------------------------------
  function destroyEditor(): void {
    editorViewRef.value?.destroy()
    editorViewRef.value = null
  }

  // -------------------------------------------------------------------
  // Content get / set
  // -------------------------------------------------------------------
  function setContent(text: string): void {
    const view = editorViewRef.value
    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
      })
    }
  }

  function getContent(): string {
    return content.value
  }

  // -------------------------------------------------------------------
  // Undo / Redo
  // -------------------------------------------------------------------
  function doUndo(): void {
    undo(editorViewRef.value!)
  }

  function doRedo(): void {
    redo(editorViewRef.value!)
  }

  // -------------------------------------------------------------------
  // Find / Replace panel toggle
  // -------------------------------------------------------------------
  function toggleSearch(): void {
    const view = editorViewRef.value
    if (!view) return
    if (isSearchOpen.value) {
      closeSearchPanel(view)
      isSearchOpen.value = false
    } else {
      openSearchPanel(view)
      isSearchOpen.value = true
    }
  }

  // -------------------------------------------------------------------
  // File operations (via Electron IPC)
  // -------------------------------------------------------------------
  async function openFile(): Promise<boolean> {
    const api = window.electronAPI
    if (!api) return false

    const result = (await api.fs.openFile({
      filters: [
        { name: 'All Supported', extensions: ['txt', 'js', 'ts', 'html', 'css', 'py', 'json', '*'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'JavaScript', extensions: ['js', 'mjs'] },
        { name: 'TypeScript', extensions: ['ts', 'tsx'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'CSS', extensions: ['css', 'scss', 'less'] },
        { name: 'Python', extensions: ['py'] },
        { name: 'JSON', extensions: ['json', 'jsonc'] },
      ],
    })) as OpenFileResult

    if (!result.success || !result.data || result.data.length === 0) return false

    const filePath = result.data[0]
    const readResult = (await api.fs.readFile(filePath)) as ReadFileResult

    if (!readResult.success || readResult.data === undefined) return false

    const detectedLang = detectLanguageFromPath(filePath)
    currentFilePath.value = filePath
    setContent(readResult.data)
    await switchLanguage(detectedLang)
    isDirty.value = false

    return true
  }

  async function saveFile(): Promise<boolean> {
    const api = window.electronAPI
    if (!api) return false

    if (currentFilePath.value) {
      // Save to existing path
      const result = (await api.fs.writeFile(
        currentFilePath.value,
        content.value,
      )) as WriteFileResult
      if (result.success) {
        isDirty.value = false
        return true
      }
      return false
    }

    // No current path — show save dialog
    return saveFileAs()
  }

  async function saveFileAs(): Promise<boolean> {
    const api = window.electronAPI
    if (!api) return false

    const result = (await api.fs.saveFile({
      filters: [
        { name: 'All Supported', extensions: ['txt', 'js', 'ts', 'html', 'css', 'py', 'json'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'JavaScript', extensions: ['js'] },
        { name: 'TypeScript', extensions: ['ts'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'CSS', extensions: ['css'] },
        { name: 'Python', extensions: ['py'] },
        { name: 'JSON', extensions: ['json'] },
      ],
    })) as SaveFileResult

    if (!result.success || !result.data) return false

    const filePath = result.data as string
    const writeResult = (await api.fs.writeFile(
      filePath,
      content.value,
    )) as WriteFileResult

    if (writeResult.success) {
      currentFilePath.value = filePath
      const detectedLang = detectLanguageFromPath(filePath)
      if (detectedLang !== language.value) {
        await switchLanguage(detectedLang)
      }
      isDirty.value = false
      return true
    }

    return false
  }

  return {
    // State
    content,
    language,
    isDirty,
    currentFilePath,
    wordCount,
    lineCount,
    charCount,
    editorViewRef,
    isSearchOpen,

    // Lifecycle
    initEditor,
    destroyEditor,
    switchLanguage,

    // Content
    setContent,
    getContent,

    // Edit commands
    doUndo,
    doRedo,
    toggleSearch,

    // File I/O
    openFile,
    saveFile,
    saveFileAs,
  }
}
