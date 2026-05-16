<template>
  <div class="system-page">
    <h2 class="page-title">{{ $t('nav.system') }}</h2>

    <el-tabs v-model="activeTab" class="system-tabs">
      <!-- ===== 1. File Search ===== -->
      <el-tab-pane :label="$t('system.search.title')" name="search">
        <div class="tab-content">
          <div class="search-controls">
            <div class="control-row">
              <span class="control-label">{{ $t('system.search.directory') }}</span>
              <el-input
                v-model="searchDir"
                :placeholder="$t('system.search.dirPlaceholder')"
                class="dir-input"
                clearable
              />
              <el-button @click="browseDir">{{ $t('common.browse') }}</el-button>
            </div>
            <div class="control-row">
              <span class="control-label">{{ $t('system.search.pattern') }}</span>
              <el-input
                v-model="searchPattern"
                placeholder="*.txt"
                class="pattern-input"
                clearable
                @keyup.enter="doFileSearch"
              />
              <el-button type="primary" @click="doFileSearch">
                <el-icon><Search /></el-icon>
                {{ $t('common.search') }}
              </el-button>
            </div>
          </div>

          <el-table
            :data="searchResults"
            stripe
            size="small"
            class="results-table"
            v-loading="searching"
            empty-text=" "
            max-height="400"
          >
            <el-table-column prop="name" :label="$t('system.search.filename')" min-width="180" />
            <el-table-column prop="path" :label="$t('system.search.path')" min-width="280" show-overflow-tooltip />
            <el-table-column :label="$t('system.search.size')" width="100">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column :label="$t('system.search.modified')" width="160">
              <template #default="{ row }">{{ formatDate(row.mtime) }}</template>
            </el-table-column>
            <el-table-column :label="$t('system.search.action')" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="openFile(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!searching && searchResults.length === 0 && searched" :description="$t('common.noData')" :image-size="60" />
        </div>
      </el-tab-pane>

      <!-- ===== 2. Image Processor ===== -->
      <el-tab-pane :label="$t('system.image.title')" name="image">
        <div class="tab-content img-tab">
          <div class="img-controls">
            <el-button @click="selectImage">
              <el-icon><FolderOpened /></el-icon>
              {{ $t('system.image.select') }}
            </el-button>
            <span v-if="imageInfo.name" class="img-name">{{ imageInfo.name }}</span>
          </div>

          <div class="img-workspace" v-if="imageSrc">
            <div class="img-preview-box">
              <canvas ref="imgCanvasRef" class="img-canvas" />
            </div>
            <div class="img-info-bar">
              <span>{{ $t('system.image.dimensions') }}: {{ imageInfo.width }} × {{ imageInfo.height }}</span>
              <span>{{ $t('system.image.format') }}: {{ imageInfo.format }}</span>
              <span>{{ $t('system.image.size') }}: {{ formatSize(imageInfo.size) }}</span>
            </div>
            <div class="img-operations">
              <div class="op-group">
                <span class="op-label">{{ $t('system.image.resize') }}</span>
                <el-input-number v-model="resizeW" :min="1" :max="4096" size="small" controls-position="right" style="width:100px" />
                <span>×</span>
                <el-input-number v-model="resizeH" :min="1" :max="4096" size="small" controls-position="right" style="width:100px" />
                <el-button size="small" @click="applyResize">{{ $t('common.apply') }}</el-button>
                <el-button size="small" @click="resetResize">{{ $t('common.reset') }}</el-button>
              </div>
              <div class="op-group">
                <span class="op-label">{{ $t('system.image.rotate') }}</span>
                <el-select v-model="rotateAngle" size="small" style="width:100px" @change="applyRotate">
                  <el-option label="0°" :value="0" />
                  <el-option label="90°" :value="90" />
                  <el-option label="180°" :value="180" />
                  <el-option label="270°" :value="270" />
                </el-select>
              </div>
              <div class="op-group">
                <span class="op-label">{{ $t('system.image.flip') }}</span>
                <el-button size="small" @click="flipImage('horizontal')">{{ $t('system.image.flipH') }}</el-button>
                <el-button size="small" @click="flipImage('vertical')">{{ $t('system.image.flipV') }}</el-button>
              </div>
            </div>
            <div class="img-save-bar">
              <el-button type="primary" @click="saveImage">{{ $t('common.save') }}</el-button>
            </div>
          </div>

          <el-empty v-else :description="$t('system.image.noImage')" :image-size="80" />
        </div>
      </el-tab-pane>

      <!-- ===== 3. Batch Rename ===== -->
      <el-tab-pane :label="$t('system.rename.title')" name="rename">
        <div class="tab-content">
          <div class="rename-controls">
            <el-button @click="selectFilesForRename">
              <el-icon><FolderOpened /></el-icon>
              {{ $t('system.rename.selectFiles') }}
            </el-button>
            <el-button v-if="renameFiles.length > 0" @click="clearRenameList" size="small">
              {{ $t('common.clear') }}
            </el-button>
          </div>

          <div class="rename-mode" v-if="renameFiles.length > 0">
            <el-radio-group v-model="renameMode" size="small">
              <el-radio-button value="findReplace">{{ $t('system.rename.findReplace') }}</el-radio-button>
              <el-radio-button value="prefixSuffix">{{ $t('system.rename.prefixSuffix') }}</el-radio-button>
              <el-radio-button value="numbering">{{ $t('system.rename.numbering') }}</el-radio-button>
            </el-radio-group>

            <div class="rename-params">
              <template v-if="renameMode === 'findReplace'">
                <el-input v-model="findStr" :placeholder="$t('system.rename.find')" size="small" style="width:140px" />
                <el-input v-model="replaceStr" :placeholder="$t('system.rename.replace')" size="small" style="width:140px" />
              </template>
              <template v-else-if="renameMode === 'prefixSuffix'">
                <el-input v-model="prefixStr" :placeholder="$t('system.rename.prefix')" size="small" style="width:140px" />
                <el-input v-model="suffixStr" :placeholder="$t('system.rename.suffix')" size="small" style="width:140px" />
              </template>
              <template v-else-if="renameMode === 'numbering'">
                <span class="op-label">{{ $t('system.rename.startNum') }}</span>
                <el-input-number v-model="numStart" :min="0" size="small" style="width:100px" />
                <span class="op-label">{{ $t('system.rename.digits') }}</span>
                <el-input-number v-model="numDigits" :min="1" :max="6" size="small" style="width:80px" />
              </template>
            </div>

            <div class="rename-preview-label">{{ $t('common.preview') }}</div>
            <el-table :data="renamePreview" stripe size="small" max-height="320" class="preview-table">
              <el-table-column :label="$t('system.rename.original')" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">{{ row.original }}</template>
              </el-table-column>
              <el-table-column :label="$t('system.rename.newname')" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">{{ row.newname }}</template>
              </el-table-column>
            </el-table>

            <div class="rename-apply-bar">
              <el-button type="primary" @click="applyRename" :disabled="renamePreview.length === 0">
                {{ $t('common.apply') }}
              </el-button>
            </div>
          </div>

          <el-empty v-else :description="$t('system.rename.noFiles')" :image-size="60" />
        </div>
      </el-tab-pane>

      <!-- ===== 4. Dictionary ===== -->
      <el-tab-pane :label="$t('system.dict.title')" name="dict">
        <div class="tab-content dict-tab">
          <div class="dict-search-bar">
            <el-input
              v-model="dictQuery"
              :placeholder="$t('system.dict.searchPlaceholder')"
              size="default"
              clearable
              @keyup.enter="lookupWord"
            >
              <template #append>
                <el-button @click="lookupWord">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>

          <div class="dict-result" v-if="dictResult">
            <div class="dict-word">{{ dictResult.word }}</div>
            <div class="dict-def" v-for="(def, i) in dictResult.definitions" :key="i">
              <span class="dict-pos">{{ def.pos }}</span>
              <span class="dict-meaning">{{ def.meaning }}</span>
            </div>
          </div>

          <div class="dict-history" v-if="dictHistory.length > 0">
            <h4>{{ $t('system.dict.history') }}</h4>
            <div class="history-tags">
              <el-tag
                v-for="(w, i) in dictHistory"
                :key="i"
                size="small"
                class="history-tag"
                @click="dictQuery = w; lookupWord()"
              >{{ w }}</el-tag>
            </div>
          </div>

          <el-empty v-if="!dictResult && !dictQuery" :description="$t('system.dict.emptyHint')" :image-size="60" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Search, View, FolderOpened } from '@element-plus/icons-vue'

const { t } = useI18n()

// ============ Shared ============
const activeTab = ref('search')

// ============ File Search ============
const searchDir = ref('')
const searchPattern = ref('*.txt')
const searchResults = ref<any[]>([])
const searching = ref(false)
const searched = ref(false)

async function browseDir(): Promise<void> {
  try {
    const api = (window as any).electronAPI
    if (api?.dialog?.openDirectory) {
      const result = await api.dialog.openDirectory()
      if (result && !result.canceled && result.filePaths?.length) {
        searchDir.value = result.filePaths[0]
      }
    } else {
      ElMessage.info(t('common.comingSoon'))
    }
  } catch {
    ElMessage.info(t('common.comingSoon'))
  }
}

async function doFileSearch(): Promise<void> {
  if (!searchDir.value) {
    ElMessage.warning(t('system.search.selectDirFirst'))
    return
  }
  searching.value = true
  searched.value = true
  searchResults.value = []

  try {
    const api = (window as any).electronAPI
    if (api?.fs?.listDir) {
      const files = await api.fs.listDir(searchDir.value, searchPattern.value || '*')
      searchResults.value = files || []
    } else {
      // Fallback: simulate with a message
      ElMessage.info(t('common.comingSoon'))
    }
  } catch (e: any) {
    ElMessage.error(e?.message || t('system.search.error'))
  } finally {
    searching.value = false
  }
}

async function openFile(row: any): Promise<void> {
  try {
    const api = (window as any).electronAPI
    if (api?.fs?.readFile) {
      const content = await api.fs.readFile(row.fullPath || row.path + '/' + row.name)
      ElMessage.success(t('system.search.opened'))
    } else if (api?.shell?.openPath) {
      await api.shell.openPath(row.fullPath || row.path + '/' + row.name)
    } else {
      ElMessage.info(row.fullPath || row.path + '/' + row.name)
    }
  } catch {
    // silent
  }
}

function formatSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ============ Image Processor ============
const imgCanvasRef = ref<HTMLCanvasElement | null>(null)
const imageSrc = ref('')
const imageInfo = reactive({ name: '', width: 0, height: 0, format: '', size: 0 })
const resizeW = ref(0)
const resizeH = ref(0)
const rotateAngle = ref(0)
let originalImage: HTMLImageElement | null = null
let currentImageData: ImageData | null = null

function selectImage(): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (!file) return
    imageInfo.name = file.name
    imageInfo.size = file.size
    const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
    imageInfo.format = ext

    const url = URL.createObjectURL(file)
    imageSrc.value = url

    const img = new Image()
    img.onload = () => {
      originalImage = img
      imageInfo.width = img.naturalWidth
      imageInfo.height = img.naturalHeight
      resizeW.value = img.naturalWidth
      resizeH.value = img.naturalHeight
      rotateAngle.value = 0
      drawImage()
    }
    img.src = url
  }
  input.click()
}

function drawImage(): void {
  const canvas = imgCanvasRef.value
  if (!canvas || !originalImage) return
  const img = originalImage
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
}

function applyResize(): void {
  const canvas = imgCanvasRef.value
  if (!canvas || !originalImage) return
  const w = resizeW.value
  const h = resizeH.value
  if (w <= 0 || h <= 0) return
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = w
  tmpCanvas.height = h
  const ctx = tmpCanvas.getContext('2d')!
  ctx.drawImage(originalImage, 0, 0, w, h)
  canvas.width = w
  canvas.height = h
  const mainCtx = canvas.getContext('2d')!
  mainCtx.drawImage(tmpCanvas, 0, 0)
  // Update original for further ops
  const newImg = new Image()
  newImg.src = tmpCanvas.toDataURL()
  newImg.onload = () => {
    originalImage = newImg
    imageInfo.width = w
    imageInfo.height = h
    resizeW.value = w
    resizeH.value = h
  }
  ElMessage.success(t('common.apply'))
}

function resetResize(): void {
  if (!originalImage) return
  resizeW.value = originalImage.naturalWidth
  resizeH.value = originalImage.naturalHeight
  drawImage()
}

function applyRotate(angle: number): void {
  const canvas = imgCanvasRef.value
  if (!canvas || !originalImage) return
  let w = canvas.width, h = canvas.height
  if (angle === 90 || angle === 270) {
    ;[w, h] = [h, w]
  }
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = w
  tmpCanvas.height = h
  const ctx = tmpCanvas.getContext('2d')!
  ctx.translate(w / 2, h / 2)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.drawImage(originalImage, -originalImage.naturalWidth / 2, -originalImage.naturalHeight / 2)
  canvas.width = w
  canvas.height = h
  const mainCtx = canvas.getContext('2d')!
  mainCtx.drawImage(tmpCanvas, 0, 0)
  const newImg = new Image()
  newImg.src = tmpCanvas.toDataURL()
  newImg.onload = () => {
    originalImage = newImg
    imageInfo.width = w
    imageInfo.height = h
    resizeW.value = w
    resizeH.value = h
  }
}

function flipImage(direction: 'horizontal' | 'vertical'): void {
  const canvas = imgCanvasRef.value
  if (!canvas || !originalImage) return
  const w = canvas.width, h = canvas.height
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = w
  tmpCanvas.height = h
  const ctx = tmpCanvas.getContext('2d')!
  if (direction === 'horizontal') {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, h)
    ctx.scale(1, -1)
  }
  ctx.drawImage(originalImage, 0, 0)
  const mainCtx = canvas.getContext('2d')!
  mainCtx.clearRect(0, 0, w, h)
  mainCtx.drawImage(tmpCanvas, 0, 0)
  const newImg = new Image()
  newImg.src = tmpCanvas.toDataURL()
  newImg.onload = () => { originalImage = newImg }
  ElMessage.success(t('common.apply'))
}

function saveImage(): void {
  const canvas = imgCanvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'processed_' + (imageInfo.name || 'image.png')
  link.href = canvas.toDataURL('image/png')
  link.click()
  ElMessage.success(t('common.save'))
}

// ============ Batch Rename ============
const renameFiles: { name: string; path: string; ext: string; base: string }[] = reactive([])
const renameMode = ref('findReplace')
const findStr = ref('')
const replaceStr = ref('')
const prefixStr = ref('')
const suffixStr = ref('')
const numStart = ref(1)
const numDigits = ref(3)

const renamePreview = computed(() => {
  return renameFiles.map((f, i) => {
    let newname = ''
    if (renameMode.value === 'findReplace') {
      newname = findStr.value ? f.base.replace(new RegExp(findStr.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceStr.value) + f.ext : f.name
    } else if (renameMode.value === 'prefixSuffix') {
      newname = (prefixStr.value || '') + f.base + (suffixStr.value || '') + f.ext
    } else if (renameMode.value === 'numbering') {
      const num = String(numStart.value + i).padStart(numDigits.value, '0')
      newname = num + '_' + f.base + f.ext
    } else {
      newname = f.name
    }
    return { original: f.name, newname, path: f.path }
  })
})

function selectFilesForRename(): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e: any) => {
    const files: File[] = Array.from(e.target?.files || [])
    // In a real Electron app this would use dialog.showOpenDialog
    // For web fallback, extract names
    renameFiles.length = 0
    for (const f of files) {
      const dotIdx = f.name.lastIndexOf('.')
      const base = dotIdx >= 0 ? f.name.slice(0, dotIdx) : f.name
      const ext = dotIdx >= 0 ? f.name.slice(dotIdx) : ''
      renameFiles.push({ name: f.name, path: '', ext, base })
    }
  }
  input.click()
}

function clearRenameList(): void {
  renameFiles.length = 0
}

function applyRename(): void {
  // In Electron, use electronAPI.fs.rename
  // For web demo, show success
  const api = (window as any).electronAPI
  if (api?.fs?.rename) {
    let count = 0
    renamePreview.value.forEach((item, i) => {
      if (item.newname !== item.original) {
        try {
          api.fs.rename(renameFiles[i].path + '/' + item.original, renameFiles[i].path + '/' + item.newname)
          count++
        } catch { /* skip */ }
      }
    })
    ElMessage.success(t('system.rename.renamed', { count }))
  } else {
    ElMessage.success(t('system.rename.renameReady'))
  }
}

// ============ Dictionary ============
const dictQuery = ref('')
const dictResult = ref<any>(null)
const dictHistory = ref<string[]>([])

// Built-in mini word list
const builtinDict: Record<string, string[]> = {
  'abandon': ['v. to give up completely'],
  'ability': ['n. the power or skill to do something'],
  'abstract': ['adj. existing in thought; n. a summary'],
  'accept': ['v. to receive willingly'],
  'access': ['n. a means of approaching; v. to obtain'],
  'achieve': ['v. to accomplish; to reach a goal'],
  'acquire': ['v. to gain possession of'],
  'adapt': ['v. to adjust to new conditions'],
  'adequate': ['adj. sufficient for a specific need'],
  'adjust': ['v. to change slightly to fit'],
  'administration': ['n. the process of managing'],
  'advance': ['v. to move forward; n. progress'],
  'advantage': ['n. a favorable circumstance'],
  'adventure': ['n. an exciting experience'],
  'advice': ['n. guidance or recommendation'],
  'affect': ['v. to influence; to produce a change'],
  'aggregate': ['n. a whole formed by combining elements'],
  'algorithm': ['n. a step-by-step procedure for solving a problem'],
  'allocate': ['v. to distribute for a purpose'],
  'alternative': ['n. another option; adj. different'],
  'analysis': ['n. detailed examination'],
  'api': ['n. Application Programming Interface'],
  'application': ['n. a program; the act of applying'],
  'approach': ['n. a way of dealing; v. to come near'],
  'architecture': ['n. the structure of a system'],
  'argument': ['n. a reason; a disagreement'],
  'array': ['n. an ordered series; v. to arrange'],
  'assemble': ['v. to put together'],
  'assessment': ['n. evaluation or estimation'],
  'assign': ['v. to allocate a task to someone'],
  'assume': ['v. to suppose without proof'],
  'async': ['adj. not synchronous; asynchronous'],
  'attribute': ['n. a quality; v. to regard as caused by'],
  'authenticate': ['v. to verify identity'],
  'automate': ['v. to make automatic'],
  'backend': ['n. the server-side of an application'],
  'backup': ['n. a copy of data; v. to copy data'],
  'bandwidth': ['n. data transmission capacity'],
  'batch': ['n. a group processed together'],
  'benchmark': ['n. a standard for comparison'],
  'binary': ['adj. relating to two; base-2'],
  'boolean': ['n. a true/false value'],
  'bootstrap': ['v. to start up; n. a CSS framework'],
  'buffer': ['n. temporary storage area'],
  'build': ['v. to construct; n. a compiled version'],
  'cache': ['n. temporary storage for fast access'],
  'callback': ['n. a function passed as argument'],
  'certificate': ['n. a digital document for identity'],
  'class': ['n. a blueprint for objects'],
  'client': ['n. a computer accessing a server'],
  'cloud': ['n. remote servers accessed via internet'],
  'cluster': ['n. a group of servers working together'],
  'code': ['n. programming instructions; v. to write code'],
  'compile': ['v. to translate source code to machine code'],
  'component': ['n. a modular part of a system'],
  'compress': ['v. to reduce file size'],
  'concurrency': ['n. simultaneous execution'],
  'configuration': ['n. arrangement of settings'],
  'console': ['n. a text interface; v. to comfort'],
  'constant': ['n. a fixed value; adj. unchanging'],
  'container': ['n. an isolated environment for apps'],
  'context': ['n. surrounding information'],
  'controller': ['n. a component handling requests'],
  'cookie': ['n. a small piece of data stored by browser'],
  'coroutine': ['n. a cooperative routine for async'],
  'cpu': ['n. Central Processing Unit'],
  'cryptography': ['n. the practice of secure communication'],
  'cursor': ['n. a pointer in a database or UI'],
  'dashboard': ['n. a visual display of key metrics'],
  'database': ['n. an organized collection of data'],
  'debug': ['v. to find and fix errors'],
  'declaration': ['n. a statement defining a variable'],
  'decouple': ['v. to separate components'],
  'default': ['n. a preset value; adj. standard'],
  'define': ['v. to specify meaning'],
  'delegate': ['v. to assign responsibility'],
  'dependency': ['n. a required external module'],
  'deploy': ['v. to release software to production'],
  'deprecated': ['adj. no longer recommended for use'],
  'deserialize': ['v. to convert data back to object'],
  'design': ['n. a plan; v. to create a plan'],
  'developer': ['n. a person who writes software'],
  'device': ['n. a piece of hardware'],
  'directory': ['n. a folder in a file system'],
  'distributed': ['adj. spread across multiple machines'],
  'dns': ['n. Domain Name System'],
  'docker': ['n. a containerization platform'],
  'documentation': ['n. written explanation of software'],
  'domain': ['n. an area of control; a web address'],
  'download': ['v. to transfer data from remote'],
  'dynamic': ['adj. changing; determined at runtime'],
  'efficiency': ['n. achieving maximum productivity'],
  'element': ['n. a component or part'],
  'encapsulation': ['n. hiding internal state'],
  'encode': ['v. to convert data to another format'],
  'encrypt': ['v. to convert data into secret code'],
  'endpoint': ['n. a URL for API access'],
  'engine': ['n. a core processing component'],
  'environment': ['n. the setting for running software'],
  'error': ['n. a mistake; a problem in code'],
  'event': ['n. an action or occurrence'],
  'exception': ['n. an error during execution'],
  'execute': ['v. to run a program or command'],
  'export': ['v. to make available to other modules'],
  'expression': ['n. a combination of values yielding a result'],
  'extension': ['n. an add-on; a file suffix'],
  'extract': ['v. to pull out data from a source'],
  'failover': ['n. automatic switching to backup'],
  'feature': ['n. a distinctive function'],
  'fetch': ['v. to retrieve data from a server'],
  'file': ['n. a collection of data stored on disk'],
  'filter': ['v. to select based on criteria'],
  'firewall': ['n. a network security system'],
  'firmware': ['n. software embedded in hardware'],
  'flag': ['n. a boolean marker; v. to mark'],
  'float': ['n. a decimal number type'],
  'flow': ['n. a sequence of operations'],
  'folder': ['n. a directory for organizing files'],
  'font': ['n. a typeface for displaying text'],
  'format': ['n. structure; v. to arrange data'],
  'framework': ['n. a platform for building applications'],
  'frontend': ['n. the user-facing part of an app'],
  'function': ['n. a reusable block of code'],
  'gateway': ['n. a network entry point'],
  'generate': ['v. to produce automatically'],
  'git': ['n. a version control system'],
  'global': ['adj. accessible everywhere in scope'],
  'graph': ['n. a visual representation of data'],
  'grid': ['n. a layout of rows and columns'],
  'handle': ['v. to manage; n. a reference identifier'],
  'hash': ['n. a fixed-size output from input data'],
  'header': ['n. the top section; metadata prefix'],
  'heap': ['n. a region of memory for dynamic allocation'],
  'hook': ['n. a function intercepting events'],
  'host': ['n. a computer on a network'],
  'html': ['n. HyperText Markup Language'],
  'http': ['n. HyperText Transfer Protocol'],
  'icon': ['n. a small graphical symbol'],
  'identifier': ['n. a name given to a variable'],
  'immutable': ['adj. unable to be changed'],
  'import': ['v. to bring in from another module'],
  'index': ['n. a database structure for fast lookup'],
  'inherit': ['v. to derive properties from parent'],
  'initialize': ['v. to set initial values'],
  'input': ['n. data entered into a system'],
  'instance': ['n. a specific object from a class'],
  'integer': ['n. a whole number'],
  'interface': ['n. a contract for classes; a shared boundary'],
  'interpreter': ['n. a program that executes code directly'],
  'invoke': ['v. to call a function or method'],
  'iterate': ['v. to repeat a process'],
  'json': ['n. JavaScript Object Notation'],
  'kernel': ['n. the core of an operating system'],
  'key': ['n. a unique identifier; a cryptographic value'],
  'keyword': ['n. a reserved word in programming'],
  'label': ['n. a tag; v. to assign a category'],
  'latency': ['n. time delay in data transfer'],
  'layer': ['n. a level in a stack'],
  'layout': ['n. the arrangement of elements'],
  'library': ['n. a collection of reusable code'],
  'license': ['n. permission terms for software'],
  'link': ['n. a reference; v. to connect'],
  'linux': ['n. an open-source operating system'],
  'list': ['n. an ordered collection of items'],
  'load': ['v. to bring data into memory'],
  'local': ['adj. on the same machine'],
  'log': ['n. a record of events; v. to record'],
  'logic': ['n. reasoning applied in programming'],
  'loop': ['n. a repeating code block'],
  'macro': ['n. a rule for text/code expansion'],
  'manifest': ['n. a file describing package metadata'],
  'map': ['n. a key-value data structure; v. to transform'],
  'margin': ['n. space outside an element border'],
  'memory': ['n. temporary data storage (RAM)'],
  'merge': ['v. to combine changes from branches'],
  'metadata': ['n. data that describes other data'],
  'method': ['n. a function belonging to a class'],
  'middleware': ['n. software between OS and apps'],
  'migration': ['n. moving data between systems'],
  'mock': ['n. a simulated object for testing'],
  'model': ['n. a representation of data structure'],
  'module': ['n. a self-contained unit of code'],
  'monitor': ['v. to observe; n. a display screen'],
  'mount': ['v. to make a filesystem accessible'],
  'namespace': ['n. a container for identifiers'],
  'native': ['adj. built for a specific platform'],
  'node': ['n. a point in a network or tree'],
  'null': ['n. the absence of a value'],
  'object': ['n. an instance containing data and methods'],
  'offset': ['n. a displacement from a start position'],
  'opacity': ['n. the degree of transparency'],
  'open': ['v. to access a file; adj. accessible'],
  'operator': ['n. a symbol for operations'],
  'optimize': ['v. to make more efficient'],
  'option': ['n. a choice; a configuration value'],
  'output': ['n. data produced by a program'],
  'override': ['v. to replace parent method in subclass'],
  'package': ['n. a bundle of software; v. to bundle'],
  'padding': ['n. space inside an element border'],
  'parameter': ['n. a variable in a function definition'],
  'parse': ['v. to analyze syntax of text'],
  'partition': ['n. a division of storage'],
  'patch': ['n. a small update; v. to apply changes'],
  'pattern': ['n. a reusable solution to a problem'],
  'payload': ['n. the actual data in a transmission'],
  'permission': ['n. access rights to a resource'],
  'pipeline': ['n. a chain of processing stages'],
  'platform': ['n. an environment for running software'],
  'plugin': ['n. an add-on extending functionality'],
  'pointer': ['n. a reference to a memory address'],
  'policy': ['n. a rule governing behavior'],
  'poll': ['v. to check repeatedly for updates'],
  'port': ['n. a network endpoint; v. to adapt software'],
  'preprocess': ['v. to process before compilation'],
  'priority': ['n. the order of importance'],
  'process': ['n. a running program; v. to handle data'],
  'profile': ['n. user-specific settings'],
  'program': ['n. a set of instructions; v. to code'],
  'promise': ['n. an object for async operations (JS)'],
  'property': ['n. an attribute of an object'],
  'protocol': ['n. a set of rules for communication'],
  'prototype': ['n. an early model; JS inheritance mechanism'],
  'proxy': ['n. an intermediary server'],
  'query': ['n. a request for data; v. to ask'],
  'queue': ['n. a first-in-first-out data structure'],
  'random': ['adj. without pattern; unpredictable'],
  'range': ['n. a span between limits'],
  'react': ['v. to respond; n. a JS UI library'],
  'realtime': ['adj. happening immediately'],
  'recursion': ['n. a function calling itself'],
  'refactor': ['v. to restructure code without changing behavior'],
  'reference': ['n. a pointer to data'],
  'regex': ['n. regular expression pattern'],
  'registry': ['n. a central database of settings'],
  'release': ['n. a published version; v. to publish'],
  'remote': ['adj. on another machine'],
  'render': ['v. to generate visual output'],
  'repository': ['n. a storage location for code'],
  'request': ['n. a message asking for data'],
  'resolve': ['v. to convert a promise; to find a solution'],
  'resource': ['n. a system asset (file, memory, CPU)'],
  'response': ['n. the reply to a request'],
  'rest': ['n. Representational State Transfer'],
  'restore': ['v. to return to a previous state'],
  'result': ['n. the output of an operation'],
  'retry': ['v. to attempt again after failure'],
  'return': ['v. to send a value back from function'],
  'revert': ['v. to undo changes'],
  'role': ['n. a set of permissions'],
  'rollback': ['n. returning to a previous version'],
  'root': ['n. the top-level directory or user'],
  'route': ['n. a path for requests; v. to direct'],
  'runtime': ['n. the period when a program executes'],
  'sandbox': ['n. an isolated testing environment'],
  'scalability': ['n. ability to handle growth'],
  'schema': ['n. a blueprint for data structure'],
  'scope': ['n. the visibility range of variables'],
  'script': ['n. a program written in scripting language'],
  'sdk': ['n. Software Development Kit'],
  'secure': ['adj. protected; v. to make safe'],
  'selector': ['n. a pattern to match elements'],
  'semaphore': ['n. a signaling mechanism for concurrency'],
  'serialize': ['v. to convert object to storable format'],
  'server': ['n. a computer providing services'],
  'service': ['n. a background process; an API endpoint'],
  'session': ['n. a period of user interaction'],
  'shell': ['n. a command-line interpreter'],
  'signal': ['n. a notification mechanism'],
  'singleton': ['n. a class with only one instance'],
  'socket': ['n. an endpoint for network communication'],
  'software': ['n. programs that run on a computer'],
  'source': ['n. the original code; v. to obtain'],
  'stack': ['n. a last-in-first-out data structure'],
  'state': ['n. the current data of a component'],
  'static': ['adj. fixed; belonging to class not instance'],
  'storage': ['n. persistent data retention'],
  'stream': ['n. a sequence of data over time'],
  'string': ['n. a sequence of characters'],
  'structure': ['n. the organization of data'],
  'style': ['n. visual appearance rules (CSS)'],
  'subscribe': ['v. to register for updates'],
  'syntax': ['n. the rules of a programming language'],
  'system': ['n. a set of connected components'],
  'table': ['n. data arranged in rows and columns'],
  'task': ['n. a unit of work'],
  'template': ['n. a predefined format or layout'],
  'terminal': ['n. a text-based interface'],
  'test': ['n. verification code; v. to verify'],
  'thread': ['n. a unit of CPU execution'],
  'timeout': ['n. a maximum wait duration'],
  'token': ['n. a symbol; an authentication credential'],
  'tool': ['n. a utility program'],
  'transaction': ['n. a group of operations treated as one'],
  'trigger': ['n. an event causing action; v. to cause'],
  'type': ['n. a classification of data'],
  'undefined': ['adj. not defined (JS value)'],
  'unicode': ['n. a universal character encoding standard'],
  'upload': ['v. to transfer data to a server'],
  'uri': ['n. Uniform Resource Identifier'],
  'url': ['n. Uniform Resource Locator'],
  'user': ['n. a person using software'],
  'utility': ['n. a helper program or function'],
  'validate': ['v. to check for correctness'],
  'value': ['n. data assigned to a variable'],
  'variable': ['n. a named storage for data'],
  'version': ['n. a specific release of software'],
  'view': ['n. the visual presentation layer'],
  'virtual': ['adj. simulated; not physical'],
  'vue': ['n. a progressive JS framework'],
  'widget': ['n. a UI component'],
  'window': ['n. a graphical container; browser object'],
  'workflow': ['n. a sequence of steps in a process'],
  'workspace': ['n. a working directory or environment'],
  'wrapper': ['n. code that wraps another component'],
  'xml': ['n. eXtensible Markup Language'],
  'yield': ['v. to pause and return a value (generators)'],
  'zone': ['n. a logical boundary or area'],
}

function lookupWord(): void {
  const query = dictQuery.value.trim().toLowerCase()
  if (!query) return
  const defs = builtinDict[query]
  if (defs) {
    dictResult.value = {
      word: query,
      definitions: defs.map((d) => {
        const parts = d.split('. ')
        return { pos: parts[0] || '', meaning: parts.slice(1).join('. ') || d }
      }),
    }
  } else {
    dictResult.value = {
      word: query,
      definitions: [{ pos: '', meaning: t('system.dict.notFound') }],
    }
  }
  // Add to history
  if (!dictHistory.value.includes(query)) {
    dictHistory.value.unshift(query)
    if (dictHistory.value.length > 20) dictHistory.value.pop()
  }
}
</script>

<style scoped>
.system-page {
  padding: 20px 24px;
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: var(--main-bg, #f5f7fa);
}
.page-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}
.system-tabs {
  background: var(--bg-primary, #fff);
  border-radius: 8px;
  padding: 8px 16px 16px;
  box-shadow: var(--box-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.08));
}
.tab-content {
  padding: 12px 0;
}
/* -- File Search -- */
.search-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.control-label {
  min-width: 60px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #606266);
}
.dir-input { flex: 1; max-width: 480px; }
.pattern-input { flex: 1; max-width: 240px; }
.results-table { margin-top: 8px; }

/* -- Image Processor -- */
.img-tab { display: flex; flex-direction: column; gap: 16px; }
.img-controls { display: flex; align-items: center; gap: 12px; }
.img-name { font-size: 13px; color: var(--text-secondary, #606266); }
.img-workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.img-preview-box {
  border: 1px solid var(--border-color, #ebeef5);
  border-radius: 8px;
  overflow: auto;
  max-height: 360px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.img-canvas { max-width: 100%; display: block; }
.img-info-bar {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--text-secondary, #606266);
}
.img-operations {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.op-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.op-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #606266);
  white-space: nowrap;
}
.img-save-bar { margin-top: 4px; }

/* -- Batch Rename -- */
.rename-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.rename-mode { display: flex; flex-direction: column; gap: 12px; }
.rename-params {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.rename-preview-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-top: 4px;
}
.rename-apply-bar { margin-top: 8px; }

/* -- Dictionary -- */
.dict-tab { display: flex; flex-direction: column; gap: 16px; max-width: 600px; }
.dict-search-bar { width: 100%; }
.dict-result {
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
  padding: 16px;
}
.dict-word {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
  margin-bottom: 12px;
  text-transform: capitalize;
}
.dict-def {
  padding: 6px 0;
  font-size: 14px;
  line-height: 1.6;
}
.dict-pos {
  font-style: italic;
  color: var(--text-secondary, #606266);
  margin-right: 8px;
}
.dict-meaning { color: var(--text-primary, #303133); }
.dict-history { margin-top: 8px; }
.dict-history h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #606266);
}
.history-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.history-tag { cursor: pointer; }

/* -- Responsive -- */
@media (max-width: 768px) {
  .system-page { padding: 12px; }
  .op-group { flex-wrap: wrap; }
  .img-info-bar { flex-direction: column; gap: 4px; }
}
</style>
