import { ref, shallowRef } from 'vue'
import { EditorState } from '@codemirror/state'
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
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
  indentOnInput,
} from '@codemirror/language'
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { marked } from 'marked'
import hljs from 'highlight.js'
import mermaid from 'mermaid'

/**
 * Initialize mermaid for offline diagram rendering.
 * startOnLoad: false prevents auto-render on page load.
 */
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

/**
 * Configure marked for GitHub Flavored Markdown with syntax highlighting.
 */
marked.setOptions({
  gfm: true,
  breaks: false,
})

/**
 * Markdown editor composable.
 * Manages CodeMirror 6 editor instance, markdown-to-HTML conversion,
 * Mermaid diagram rendering, and document statistics.
 */
export function useMarkdown() {
  /** Raw markdown content from the editor */
  const content = ref('')

  /** Rendered HTML output (with Mermaid SVGs inlined) */
  const renderedHtml = ref('')

  /** Document statistics */
  const wordCount = ref(0)
  const lineCount = ref(0)
  const charCount = ref(0)

  /** Tracks whether content has unsaved changes */
  const isDirty = ref(false)

  /** Shallow ref to the CodeMirror EditorView instance */
  const editorViewRef = shallowRef<EditorView | null>(null)

  /**
   * Recalculate document statistics from current content.
   */
  function updateStats(): void {
    const text = content.value
    charCount.value = text.length
    lineCount.value = text.split('\n').length
    wordCount.value = text.trim() ? text.trim().split(/\s+/).length : 0
  }

  /**
   * Find and render Mermaid diagram blocks within HTML.
   * Searches for <code class="language-mermaid"> blocks and replaces
   * them with rendered SVG.
   */
  /** Decode HTML entities in a string (e.g. &#123; → {) */
  function decodeHtmlEntities(text: string): string {
    const txt = document.createElement('textarea')
    txt.innerHTML = text
    return txt.value
  }

  async function renderMermaidBlocks(html: string): Promise<string> {
    const regex = /<code class="language-mermaid">([\s\S]*?)<\/code>/g
    const matches = [...html.matchAll(regex)]

    if (matches.length === 0) return html

    let result = html
    for (const match of matches) {
      const mermaidCode = decodeHtmlEntities(match[1])
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(id, mermaidCode)
        result = result.replace(
          match[0],
          `<div class="mermaid-container">${svg}</div>`
        )
      } catch {
        result = result.replace(
          match[0],
          `<pre class="mermaid-error">Mermaid render error</pre>`
        )
      }
    }
    return result
  }

  /**
   * Convert current markdown content to HTML and render Mermaid blocks.
   */
  async function renderPreview(): Promise<void> {
    try {
      let html = marked.parse(content.value) as string
      html = await renderMermaidBlocks(html)
      renderedHtml.value = html
    } catch {
      renderedHtml.value = '<p>Render error</p>'
    }
  }

  /**
   * Initialize a CodeMirror 6 editor inside the given DOM element.
   * @param parent - The container HTMLElement for the editor
   * @param i18nPlaceholder - Placeholder text for the editor
   * @param initialContent - Optional initial markdown content
   */
  function initEditor(
    parent: HTMLElement,
    i18nPlaceholder: string,
    initialContent = ''
  ): void {
    // Destroy previous instance if any
    if (editorViewRef.value) {
      editorViewRef.value.destroy()
    }

    // React to document changes: update content, stats, and preview
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        content.value = update.state.doc.toString()
        isDirty.value = true
        updateStats()
        renderPreview()
      }
    })

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
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
        markdown({ base: markdownLanguage }),
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
            background: 'var(--bg-secondary, #f5f7fa)',
            borderRight: '1px solid var(--border-light, #ebeef5)',
            color: 'var(--text-placeholder, #c0c4cc)',
          },
          '.cm-activeLineGutter': {
            background: 'var(--border-light, #ebeef5)',
            color: 'var(--text-primary, #303133)',
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent,
    })

    editorViewRef.value = view
    content.value = initialContent
    updateStats()
    renderPreview()
  }

  /**
   * Destroy the CodeMirror editor instance and clean up.
   */
  function destroyEditor(): void {
    editorViewRef.value?.destroy()
    editorViewRef.value = null
  }

  /**
   * Replace the entire editor content.
   */
  function setContent(text: string): void {
    const view = editorViewRef.value
    if (view) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text,
        },
      })
    }
  }

  /**
   * Get the current markdown content.
   */
  function getContent(): string {
    return content.value
  }

  /**
   * Export current preview as a complete HTML document.
   */
  function exportHtml(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 820px; margin: 0 auto; padding: 24px; color: #333; line-height: 1.7; }
h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 6px; }
pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 16px 0; }
th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background: #f6f8fa; font-weight: 600; }
blockquote { border-left: 4px solid #409eff; padding-left: 16px; color: #666; margin: 16px 0; }
img { max-width: 100%; }
a { color: #409eff; }
.mermaid-container { text-align: center; margin: 16px 0; }
.mermaid-container svg { max-width: 100%; }
</style>
</head>
<body>
${renderedHtml.value}
</body>
</html>`
  }

  /**
   * Trigger a file download in the browser.
   */
  function downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Save the current markdown content as a .md file.
   */
  function saveMarkdownFile(filename = 'document.md'): void {
    downloadFile(filename, content.value, 'text/markdown')
    isDirty.value = false
  }

  /**
   * Export the rendered HTML as an .html file.
   */
  function exportHtmlFile(filename = 'document.html'): void {
    const htmlContent = exportHtml()
    downloadFile(filename, htmlContent, 'text/html')
  }

  return {
    content,
    renderedHtml,
    wordCount,
    lineCount,
    charCount,
    isDirty,
    editorViewRef,
    initEditor,
    destroyEditor,
    setContent,
    getContent,
    exportHtml,
    renderPreview,
    saveMarkdownFile,
    exportHtmlFile,
  }
}
