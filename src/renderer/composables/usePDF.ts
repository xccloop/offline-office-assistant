import { ref, computed, shallowRef } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

/**
 * PDF.js v4 worker 配置
 * 使用打包后的 worker 文件，无需额外 import
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

/** 缩略图尺寸 */
const THUMB_WIDTH = 120
const THUMB_HEIGHT = 160

/** 缩放范围 */
const MIN_SCALE = 0.5
const MAX_SCALE = 4.0
const DEFAULT_SCALE = 1.5

/** 虚拟滚动：同时渲染的缩略图数量（前后各 buffer 页） */
const THUMB_BUFFER = 10

export interface PDFPageInfo {
  pageNumber: number
  width: number
  height: number
  viewportWidth: number
  viewportHeight: number
}

/**
 * PDF 加载与状态管理
 * 封装 pdfjs-dist 的文档加载、页面渲染、缩放、导航等逻辑
 */
export function usePDF() {
  // --- 核心状态 ---
  const pdfDocument = shallowRef<pdfjsLib.PDFDocumentProxy | null>(null)
  const currentPageNumber = ref(1)
  const numPages = ref(0)
  const scale = ref(DEFAULT_SCALE)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const filePath = ref<string | null>(null)
  const fileName = ref<string | null>(null)
  const fileSize = ref<number>(0)

  /** 所有页面的尺寸缓存 */
  const pageInfos = ref<PDFPageInfo[]>([])

  // --- 缩略图状态 ---
  const thumbnailsVisible = ref(true)
  const thumbnailContainerRef = ref<HTMLDivElement | null>(null)
  const thumbnailScrollTop = ref(0)

  // --- 计算属性 ---
  const hasDocument = computed(() => pdfDocument.value !== null)
  const isFirstPage = computed(() => currentPageNumber.value <= 1)
  const isLastPage = computed(() => currentPageNumber.value >= numPages.value)
  const scalePercent = computed(() => Math.round(scale.value * 100))

  /** 虚拟滚动：可见缩略图范围 */
  const visibleThumbRange = computed(() => {
    const total = numPages.value
    if (total <= THUMB_BUFFER * 2 + 10) {
      return { start: 1, end: total }
    }
    const scrollTop = thumbnailScrollTop.value
    // 每张缩略图高度约 THUMB_HEIGHT + 8 (margin)
    const itemHeight = THUMB_HEIGHT + 8
    const viewHeight = 600 // 估算可视区高度
    const visibleStart = Math.max(1, Math.floor(scrollTop / itemHeight) - THUMB_BUFFER)
    const visibleEnd = Math.min(total, Math.ceil((scrollTop + viewHeight) / itemHeight) + THUMB_BUFFER)
    return { start: visibleStart, end: visibleEnd }
  })

  // --- 方法 ---

  /**
   * 从文件路径加载 PDF
   * 通过 IPC 读取文件为 base64，再转为 ArrayBuffer 供 pdfjs 解析
   */
  async function loadFile(path: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // 通过 preload 暴露的 IPC 读取文件 (base64 编码)
      const result = await window.electronAPI.fs.readFile(path, 'base64')
      if (!result.success) {
        throw new Error(result.error || 'Failed to read file')
      }

      // base64 -> ArrayBuffer
      const binaryString = atob(result.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const arrayBuffer = bytes.buffer

      // 加载 PDF 文档
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      pdfDocument.value = doc
      numPages.value = doc.numPages
      currentPageNumber.value = 1
      scale.value = DEFAULT_SCALE
      filePath.value = path

      // 提取文件名
      const parts = path.replace(/\\/g, '/').split('/')
      fileName.value = parts[parts.length - 1] || 'document.pdf'

      // 获取文件大小
      const stat = await window.electronAPI.fs.stat(path)
      if (stat.success && stat.data) {
        fileSize.value = stat.data.size
      }

      // 预加载所有页面尺寸信息
      await loadPageInfos()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      pdfDocument.value = null
      numPages.value = 0
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 打开文件选择对话框并加载 PDF
   */
  async function openFile(): Promise<void> {
    try {
      const result = await window.electronAPI.fs.openFile({
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        multiSelections: false,
      })
      if (result.success && result.data && result.data.length > 0) {
        await loadFile(result.data[0])
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    }
  }

  /** 预加载所有页面的 viewport 信息 */
  async function loadPageInfos(): Promise<void> {
    const doc = pdfDocument.value
    if (!doc) return

    const infos: PDFPageInfo[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 1.0 })
      infos.push({
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
      })
      page.cleanup()
    }
    pageInfos.value = infos
  }

  /**
   * 将指定页面渲染到 Canvas
   * @param canvas HTMLCanvasElement
   * @param pageNumber 页码（1-based）
   * @param renderScale 可选自定义缩放，默认使用当前 scale
   */
  async function renderPage(
    canvas: HTMLCanvasElement,
    pageNumber: number,
    renderScale?: number
  ): Promise<void> {
    const doc = pdfDocument.value
    if (!doc || pageNumber < 1 || pageNumber > doc.numPages) return

    const s = renderScale ?? scale.value
    const page = await doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale: s })

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 适配设备像素比
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise

    page.cleanup()
  }

  /**
   * 渲染缩略图到 Canvas
   */
  async function renderThumbnail(
    canvas: HTMLCanvasElement,
    pageNumber: number
  ): Promise<void> {
    const doc = pdfDocument.value
    if (!doc || pageNumber < 1 || pageNumber > doc.numPages) return

    const page = await doc.getPage(pageNumber)
    const origViewport = page.getViewport({ scale: 1.0 })

    // 计算缩放比例使缩略图适配固定尺寸
    const fitScale = Math.min(
      THUMB_WIDTH / origViewport.width,
      THUMB_HEIGHT / origViewport.height
    )
    const viewport = page.getViewport({ scale: fitScale })

    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise

    page.cleanup()
  }

  // --- 导航 ---

  /** 跳转到指定页（1-based） */
  function goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, numPages.value))
    currentPageNumber.value = clamped
  }

  /** 上一页 */
  function previousPage(): void {
    goToPage(currentPageNumber.value - 1)
  }

  /** 下一页 */
  function nextPage(): void {
    goToPage(currentPageNumber.value + 1)
  }

  /** 跳转到第一页 */
  function firstPage(): void {
    goToPage(1)
  }

  /** 跳转到最后一页 */
  function lastPage(): void {
    goToPage(numPages.value)
  }

  // --- 缩放 ---

  /** 设置缩放比例 */
  function setScale(newScale: number): void {
    scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
  }

  /** 放大 */
  function zoomIn(): void {
    setScale(scale.value + 0.25)
  }

  /** 缩小 */
  function zoomOut(): void {
    setScale(scale.value - 0.25)
  }

  /** 恢复默认缩放 */
  function zoomReset(): void {
    setScale(DEFAULT_SCALE)
  }

  /** 适应宽度 */
  function zoomFitWidth(): void {
    const info = pageInfos.value[currentPageNumber.value - 1]
    if (!info || !pdfDocument.value) return
    // 估算可用宽度（减去缩略图侧边栏和 padding）
    const availableWidth = window.innerWidth - 300
    const fitScale = availableWidth / info.viewportWidth
    setScale(Math.max(MIN_SCALE, fitScale))
  }

  /** 适应页面 */
  function zoomFitPage(): void {
    const info = pageInfos.value[currentPageNumber.value - 1]
    if (!info || !pdfDocument.value) return
    const availableHeight = window.innerHeight - 200
    const fitScale = availableHeight / info.viewportHeight
    setScale(Math.max(MIN_SCALE, fitScale))
  }

  // --- 缩略图侧边栏 ---

  function toggleThumbnails(): void {
    thumbnailsVisible.value = !thumbnailsVisible.value
  }

  function updateThumbScroll(scrollTop: number): void {
    thumbnailScrollTop.value = scrollTop
  }

  // --- 清理 ---

  /** 关闭当前文档，释放资源 */
  async function closeDocument(): Promise<void> {
    if (pdfDocument.value) {
      await pdfDocument.value.destroy()
    }
    pdfDocument.value = null
    numPages.value = 0
    currentPageNumber.value = 1
    pageInfos.value = []
    filePath.value = null
    fileName.value = null
    fileSize.value = 0
    error.value = null
    scale.value = DEFAULT_SCALE
  }

  return {
    // 状态
    pdfDocument,
    currentPageNumber,
    numPages,
    scale,
    isLoading,
    error,
    filePath,
    fileName,
    fileSize,
    pageInfos,
    thumbnailsVisible,
    thumbnailContainerRef,
    thumbnailScrollTop,
    // 计算属性
    hasDocument,
    isFirstPage,
    isLastPage,
    scalePercent,
    visibleThumbRange,
    // 方法
    loadFile,
    openFile,
    renderPage,
    renderThumbnail,
    goToPage,
    previousPage,
    nextPage,
    firstPage,
    lastPage,
    setScale,
    zoomIn,
    zoomOut,
    zoomReset,
    zoomFitWidth,
    zoomFitPage,
    toggleThumbnails,
    updateThumbScroll,
    closeDocument,
  }
}
