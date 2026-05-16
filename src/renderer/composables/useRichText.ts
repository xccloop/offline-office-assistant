import { ref, type Ref } from 'vue'

/**
 * Rich text editor composable.
 *
 * Manages contentEditable-based editor state, formatting commands
 * via document.execCommand, file I/O operations via Electron IPC,
 * HTML export, and document statistics.
 */
export function useRichText() {
  /** Current HTML content of the editor */
  const content: Ref<string> = ref('<p><br></p>')

  /** Whether the document has unsaved changes */
  const isDirty: Ref<boolean> = ref(false)

  /** Current file path (null if never saved) */
  const currentFilePath: Ref<string | null> = ref(null)

  /** Current file name for display */
  const currentFileName: Ref<string> = ref('')

  /** The contentEditable DOM element (set by the component) */
  const editorElement: Ref<HTMLElement | null> = ref(null)

  /** Word count */
  const wordCount: Ref<number> = ref(0)

  /** Character count (including spaces) */
  const charCount: Ref<number> = ref(0)

  // ── Internal helpers ────────────────────────────────────────────

  /**
   * Focus the editor element and restore selection state.
   */
  function focusEditor(): void {
    editorElement.value?.focus()
  }

  /**
   * Safely execute a document.execCommand.
   * Returns true if the command succeeded.
   */
  function execCmd(command: string, value?: string): boolean {
    focusEditor()
    try {
      const success = document.execCommand(command, false, value)
      if (success) {
        syncContent()
      }
      return success
    } catch {
      return false
    }
  }

  /**
   * Read HTML from the editor element into content ref.
   */
  function syncContent(): void {
    if (editorElement.value) {
      const html = editorElement.value.innerHTML
      if (html !== content.value) {
        content.value = html
        isDirty.value = true
        updateStats()
      }
    }
  }

  /**
   * Write content ref back to the editor DOM.
   */
  function applyContent(): void {
    if (editorElement.value && editorElement.value.innerHTML !== content.value) {
      editorElement.value.innerHTML = content.value
    }
  }

  // ── Formatting commands ─────────────────────────────────────────

  /** Toggle bold */
  function bold(): void {
    execCmd('bold')
  }

  /** Toggle italic */
  function italic(): void {
    execCmd('italic')
  }

  /** Toggle underline */
  function underline(): void {
    execCmd('underline')
  }

  /** Toggle strikethrough */
  function strikethrough(): void {
    execCmd('strikeThrough')
  }

  /** Set font size (1-7) */
  function setFontSize(size: string): void {
    execCmd('fontSize', size)
  }

  /** Set text (foreground) color */
  function setTextColor(color: string): void {
    execCmd('foreColor', color)
  }

  /** Set text background / highlight color */
  function setHighlightColor(color: string): void {
    execCmd('hiliteColor', color)
  }

  /** Align left */
  function alignLeft(): void {
    execCmd('justifyLeft')
  }

  /** Align center */
  function alignCenter(): void {
    execCmd('justifyCenter')
  }

  /** Align right */
  function alignRight(): void {
    execCmd('justifyRight')
  }

  /** Justify */
  function justify(): void {
    execCmd('justifyFull')
  }

  /** Insert ordered list */
  function insertOrderedList(): void {
    execCmd('insertOrderedList')
  }

  /** Insert unordered list */
  function insertUnorderedList(): void {
    execCmd('insertUnorderedList')
  }

  /**
   * Insert a hyperlink.
   * If text is currently selected, it becomes the link text.
   */
  function insertLink(url: string, text?: string): void {
    if (!url) return
    focusEditor()

    const displayText = text || url
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      // Wrap selected text in a link
      const range = selection.getRangeAt(0)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      try {
        range.surroundContents(anchor)
        selection.removeAllRanges()
        syncContent()
      } catch {
        // If surroundContents fails (partial selection across elements),
        // replace with link text
        range.deleteContents()
        const linkNode = document.createTextNode(displayText)
        const wrapper = document.createElement('a')
        wrapper.href = url
        wrapper.target = '_blank'
        wrapper.rel = 'noopener noreferrer'
        wrapper.appendChild(linkNode)
        range.insertNode(wrapper)
        selection.removeAllRanges()
        syncContent()
      }
    } else {
      // Insert new link at cursor
      const html = `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${displayText}</a>`
      execCmd('insertHTML', html)
    }
  }

  /**
   * Insert an image at the current cursor position.
   */
  function insertImage(url: string, altText = ''): void {
    if (!url) return
    const html = `<img src="${escapeAttr(url)}" alt="${escapeAttr(altText)}" style="max-width:100%">`
    execCmd('insertHTML', html)
  }

  /**
   * Insert a table at the current cursor position.
   */
  function insertTable(rows: number, cols: number): void {
    if (rows < 1 || cols < 1) return
    focusEditor()

    let tableHtml = '<table border="1" style="border-collapse:collapse;width:100%"><tbody>'
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>'
      for (let c = 0; c < cols; c++) {
        tableHtml += '<td style="padding:6px 12px;border:1px solid var(--border-color, #e4e7ed)"><br></td>'
      }
      tableHtml += '</tr>'
    }
    tableHtml += '</tbody></table><p><br></p>'

    execCmd('insertHTML', tableHtml)
  }

  /**
   * Remove formatting from selected text.
   */
  function removeFormat(): void {
    execCmd('removeFormat')
  }

  /** Undo */
  function undo(): void {
    execCmd('undo')
  }

  /** Redo */
  function redo(): void {
    execCmd('redo')
  }

  // ── File operations ─────────────────────────────────────────────

  /** Create a new blank document */
  function newDocument(): void {
    content.value = '<p><br></p>'
    currentFilePath.value = null
    currentFileName.value = ''
    isDirty.value = false
    applyContent()
    updateStats()
  }

  /**
   * Open an HTML file via Electron IPC (dialog + read).
   */
  async function openFile(): Promise<boolean> {
    try {
      if (!window.electronAPI?.dialog?.openFile) {
        // Fallback for browser dev: prompt for file
        return fallbackOpenFile()
      }
      const result = await window.electronAPI.dialog.openFile({
        filters: [
          { name: 'HTML Files', extensions: ['html', 'htm'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })
      if (result.canceled || !result.filePath) return false

      const readResult = await window.electronAPI.file.read(result.filePath)
      if (readResult.success && readResult.data) {
        content.value = readResult.data
        currentFilePath.value = result.filePath
        currentFileName.value = result.filePath.split(/[/\\]/).pop() || ''
        isDirty.value = false
        applyContent()
        updateStats()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Fallback file open using the File API (for dev without Electron).
   */
  function fallbackOpenFile(): Promise<boolean> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.html,.htm'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) {
          resolve(false)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          content.value = reader.result as string
          currentFilePath.value = null
          currentFileName.value = file.name
          isDirty.value = false
          applyContent()
          updateStats()
          resolve(true)
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
      }
      input.click()
    })
  }

  /**
   * Save the current document.
   * If currentFilePath is set, overwrites it.
   * Otherwise prompts for a save location via Electron dialog.
   */
  async function saveFile(): Promise<boolean> {
    try {
      const htmlContent = buildFullHtml()
      let filePath = currentFilePath.value

      if (!filePath) {
        if (!window.electronAPI?.dialog?.saveFile) {
          return fallbackSaveFile(htmlContent)
        }
        const result = await window.electronAPI.dialog.saveFile({
          defaultPath: `${currentFileName.value || 'document'}.html`,
          filters: [
            { name: 'HTML Files', extensions: ['html'] },
            { name: 'All Files', extensions: ['*'] },
          ],
        })
        if (result.canceled || !result.filePath) return false
        filePath = result.filePath
      }

      const writeResult = await window.electronAPI.file.write(filePath, htmlContent)
      if (writeResult.success) {
        currentFilePath.value = filePath
        currentFileName.value = filePath.split(/[/\\]/).pop() || ''
        isDirty.value = false
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Fallback save using Blob download (browser dev).
   */
  function fallbackSaveFile(htmlContent: string): boolean {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentFileName.value || 'document'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    isDirty.value = false
    return true
  }

  /**
   * Export current content as a downloadable HTML file.
   */
  function exportHtmlFile(filename?: string): void {
    const htmlContent = buildFullHtml()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `${currentFileName.value || 'document'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Build a complete HTML document wrapping the current content.
   */
  function buildFullHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(currentFileName.value || 'Untitled')}</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 820px;
  margin: 0 auto;
  padding: 24px;
  color: #303133;
  line-height: 1.7;
}
h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 6px; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f6f8fa; font-weight: 600; }
blockquote { border-left: 4px solid #409eff; padding-left: 16px; color: #666; margin: 16px 0; }
img { max-width: 100%; }
a { color: #409eff; }
</style>
</head>
<body>
${content.value}
</body>
</html>`
  }

  // ── Statistics ──────────────────────────────────────────────────

  /**
   * Recalculate word and character count from current HTML content.
   * Strips HTML tags before counting.
   */
  function updateStats(): void {
    const div = document.createElement('div')
    div.innerHTML = content.value
    const text = div.textContent || div.innerText || ''
    charCount.value = text.length
    wordCount.value = text.trim() ? text.trim().split(/\s+/).length : 0
  }

  // ── Public API ──────────────────────────────────────────────────

  /**
   * Get the raw HTML content.
   */
  function getContent(): string {
    return content.value
  }

  /**
   * Set the full HTML content (replaces everything).
   */
  function setContent(html: string): void {
    content.value = html
    isDirty.value = true
    applyContent()
    updateStats()
  }

  /**
   * Handle the 'input' event on the contentEditable element.
   * Call this from the component's @input handler.
   */
  function onEditorInput(): void {
    syncContent()
  }

  /**
   * Handle the 'paste' event to strip unwanted formatting.
   * Call this from the component's @paste handler.
   */
  function onEditorPaste(event: ClipboardEvent): void {
    event.preventDefault()
    const text = event.clipboardData?.getData('text/plain') || ''
    if (text) {
      // Insert as plain text then convert newlines to <br> / paragraphs
      const lines = text.split('\n')
      let html = ''
      for (const line of lines) {
        if (line.trim() === '') {
          html += '<p><br></p>'
        } else {
          html += `<p>${escapeHtml(line)}</p>`
        }
      }
      execCmd('insertHTML', html)
    }
  }

  return {
    // State
    content,
    isDirty,
    currentFilePath,
    currentFileName,
    editorElement,
    wordCount,
    charCount,

    // Formatting
    bold,
    italic,
    underline,
    strikethrough,
    setFontSize,
    setTextColor,
    setHighlightColor,
    alignLeft,
    alignCenter,
    alignRight,
    justify,
    insertOrderedList,
    insertUnorderedList,
    insertLink,
    insertImage,
    insertTable,
    removeFormat,
    undo,
    redo,

    // File operations
    newDocument,
    openFile,
    saveFile,
    exportHtmlFile,
    buildFullHtml,

    // State helpers
    syncContent,
    applyContent,
    updateStats,
    getContent,
    setContent,
    onEditorInput,
    onEditorPaste,
    focusEditor,
  }
}

// ── Utility helpers ───────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (ch) => map[ch] || ch)
}

/**
 * Escape a value for use inside an HTML attribute.
 */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
