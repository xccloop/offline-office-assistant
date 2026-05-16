<template>
  <div class="automation-page">
    <h2 class="page-title">{{ $t('nav.automation') }}</h2>

    <el-tabs v-model="activeTab" class="automation-tabs">
      <!-- ─── Macro Recorder Tab ─── -->
      <el-tab-pane :label="$t('automation.macro.title')" name="macro">
        <div class="macro-layout">
          <!-- Record Controls -->
          <div class="macro-controls">
            <div class="record-section">
              <el-button
                :type="isRecording ? 'danger' : 'primary'"
                size="large"
                circle
                class="record-btn"
                @click="toggleRecording"
              >
                <span v-if="!isRecording" class="record-icon">&#9679;</span>
                <span v-else class="stop-icon">&#9632;</span>
              </el-button>
              <div class="record-status">
                <span
                  class="status-dot"
                  :class="{ recording: isRecording }"
                />
                <span class="status-text">
                  {{ isRecording ? $t('automation.macro.recording') : $t('automation.macro.stopped') }}
                </span>
                <span v-if="isRecording" class="record-timer">{{ formattedTime }}</span>
              </div>
            </div>

            <div class="macro-actions">
              <el-button
                :disabled="recordedActions.length === 0 || isRecording"
                type="success"
                @click="playMacro"
              >
                <el-icon><VideoPlay /></el-icon>
                {{ $t('automation.macro.play') }}
              </el-button>
              <el-button
                :disabled="recordedActions.length === 0"
                @click="clearActions"
              >
                <el-icon><Delete /></el-icon>
                {{ $t('automation.macro.clear') }}
              </el-button>
              <el-button
                :disabled="recordedActions.length === 0"
                type="primary"
                plain
                @click="showSaveDialog = true"
              >
                <el-icon><FolderAdd /></el-icon>
                {{ $t('automation.macro.save') }}
              </el-button>
            </div>
          </div>

          <!-- Recorded Actions -->
          <el-card class="actions-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><List /></el-icon>
                <span>{{ $t('automation.macro.actions') }} ({{ recordedActions.length }})</span>
              </div>
            </template>
            <el-table
              :data="recordedActions"
              border
              stripe
              height="280"
              empty-text=" "
            >
              <el-table-column type="index" :label="$t('automation.macro.step')" width="70" />
              <el-table-column prop="type" :label="$t('automation.macro.actionType')" width="120">
                <template #default="{ row }">
                  <el-tag :type="actionTagType(row.type)" size="small">
                    {{ $t(`automation.macro.types.${row.type}`) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="target" :label="$t('automation.macro.target')" min-width="160" show-overflow-tooltip />
              <el-table-column prop="value" :label="$t('automation.macro.value')" min-width="160" show-overflow-tooltip />
              <el-table-column prop="timestamp" :label="$t('automation.macro.time')" width="110">
                <template #default="{ row }">
                  {{ formatTimestamp(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('automation.macro.actions')" width="80" fixed="right">
                <template #default="{ $index }">
                  <el-button size="small" type="danger" text @click="removeAction($index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- Saved Macros -->
          <el-card class="saved-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ $t('automation.macro.savedMacros') }}</span>
              </div>
            </template>
            <el-table
              :data="savedMacros"
              border
              stripe
              height="240"
              empty-text=" "
            >
              <el-table-column prop="name" :label="$t('automation.macro.name')" min-width="160" />
              <el-table-column prop="steps" :label="$t('automation.macro.steps')" width="80">
                <template #default="{ row }">
                  {{ row.actions.length }}
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" :label="$t('automation.macro.created')" width="160">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('automation.macro.actions')" width="180" fixed="right">
                <template #default="{ row, $index }">
                  <el-button size="small" type="primary" text @click="loadMacro(row)">
                    <el-icon><VideoPlay /></el-icon>
                  </el-button>
                  <el-button size="small" text @click="exportMacro(row)">
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <el-button size="small" type="danger" text @click="deleteMacro($index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- ─── Batch Workflow Tab ─── -->
      <el-tab-pane :label="$t('automation.workflow.title')" name="workflow">
        <div class="workflow-layout">
          <!-- Workflow List Sidebar -->
          <div class="workflow-sidebar">
            <div class="workflow-list-header">
              <span>{{ $t('automation.workflow.saved') }}</span>
              <el-button size="small" type="primary" @click="createNewWorkflow">
                <el-icon><Plus /></el-icon>
                {{ $t('automation.workflow.new') }}
              </el-button>
            </div>
            <div class="workflow-items">
              <div
                v-for="(wf, idx) in savedWorkflows"
                :key="idx"
                class="workflow-item"
                :class="{ active: activeWorkflowIndex === idx }"
                @click="selectWorkflow(idx)"
              >
                <div class="wf-name">{{ wf.name }}</div>
                <div class="wf-meta">{{ wf.steps?.length || 0 }} {{ $t('automation.workflow.steps') }}</div>
              </div>
              <el-empty
                v-if="savedWorkflows.length === 0"
                :description="$t('common.noData')"
                :image-size="50"
              />
            </div>
          </div>

          <!-- Workflow Editor -->
          <div class="workflow-editor">
            <template v-if="activeWorkflowIndex !== null">
              <!-- Workflow Header -->
              <div class="wf-editor-header">
                <el-input
                  v-model="currentWorkflow.name"
                  :placeholder="$t('automation.workflow.namePlaceholder')"
                  class="wf-name-input"
                  size="large"
                />
                <div class="wf-header-actions">
                  <el-button type="primary" @click="runWorkflow" :loading="isRunning">
                    <el-icon><VideoPlay /></el-icon>
                    {{ $t('automation.workflow.run') }}
                  </el-button>
                  <el-button @click="saveWorkflow">
                    <el-icon><FolderAdd /></el-icon>
                    {{ $t('automation.workflow.save') }}
                  </el-button>
                  <el-button type="danger" text @click="deleteWorkflow(activeWorkflowIndex)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <!-- Progress Bar -->
              <el-progress
                v-if="isRunning"
                :percentage="runProgress"
                :status="runStatus"
                class="wf-progress"
              />

              <!-- Steps Editor -->
              <el-card shadow="hover" class="wf-steps-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><SetUp /></el-icon>
                    <span>{{ $t('automation.workflow.steps') }}</span>
                    <el-button
                      size="small"
                      type="primary"
                      text
                      @click="addStep"
                      style="margin-left: auto;"
                    >
                      <el-icon><Plus /></el-icon>
                      {{ $t('automation.workflow.addStep') }}
                    </el-button>
                  </div>
                </template>
                <div v-if="currentWorkflow.steps.length === 0" class="steps-empty">
                  <el-empty :description="$t('automation.workflow.noSteps')" :image-size="40" />
                </div>
                <div v-else class="steps-list">
                  <div
                    v-for="(step, idx) in currentWorkflow.steps"
                    :key="idx"
                    class="step-item"
                  >
                    <div class="step-number">{{ idx + 1 }}</div>
                    <div class="step-content">
                      <el-select
                        v-model="step.type"
                        :placeholder="$t('automation.workflow.stepType')"
                        size="small"
                        style="width: 160px;"
                      >
                        <el-option
                          v-for="op in workflowOperations"
                          :key="op.value"
                          :label="$t(`automation.workflow.operations.${op.value}`)"
                          :value="op.value"
                        />
                      </el-select>
                      <el-input
                        v-model="step.filePattern"
                        :placeholder="$t('automation.workflow.filePattern')"
                        size="small"
                        style="width: 180px;"
                      />
                      <el-input
                        v-model="step.outputDir"
                        :placeholder="$t('automation.workflow.outputDir')"
                        size="small"
                        style="width: 180px;"
                      />
                      <div class="step-actions">
                        <el-button
                          size="small"
                          :disabled="idx === 0"
                          @click="moveStep(idx, -1)"
                          text
                        >
                          <el-icon><Top /></el-icon>
                        </el-button>
                        <el-button
                          size="small"
                          :disabled="idx === currentWorkflow.steps.length - 1"
                          @click="moveStep(idx, 1)"
                          text
                        >
                          <el-icon><Bottom /></el-icon>
                        </el-button>
                        <el-button
                          size="small"
                          type="danger"
                          @click="removeStep(idx)"
                          text
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>

              <!-- Results Log -->
              <el-card v-if="runResults.length > 0" shadow="hover" class="wf-log-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Tickets /></el-icon>
                    <span>{{ $t('automation.workflow.results') }}</span>
                  </div>
                </template>
                <div class="log-panel">
                  <div
                    v-for="(log, idx) in runResults"
                    :key="idx"
                    class="log-entry"
                    :class="log.level"
                  >
                    <span class="log-time">{{ log.time }}</span>
                    <span class="log-msg">{{ log.message }}</span>
                  </div>
                </div>
              </el-card>
            </template>
            <el-empty
              v-else
              :description="$t('automation.workflow.selectOrCreate')"
              :image-size="80"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Save Macro Dialog -->
    <el-dialog
      v-model="showSaveDialog"
      :title="$t('automation.macro.saveMacro')"
      width="400px"
    >
      <el-form>
        <el-form-item :label="$t('automation.macro.name')">
          <el-input
            v-model="newMacroName"
            :placeholder="$t('automation.macro.namePlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveMacro">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoPlay,
  Delete,
  FolderAdd,
  FolderOpened,
  List,
  Download,
  Plus,
  SetUp,
  Top,
  Bottom,
  Tickets,
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ── Types ──
interface MacroAction {
  type: 'click' | 'type' | 'key' | 'wait'
  target: string
  value: string
  timestamp: number
}

interface SavedMacro {
  name: string
  actions: MacroAction[]
  createdAt: number
}

interface WorkflowStep {
  type: string
  filePattern: string
  outputDir: string
}

interface Workflow {
  name: string
  steps: WorkflowStep[]
  createdAt: number
}

interface RunLog {
  time: string
  message: string
  level: 'info' | 'success' | 'error' | 'warning'
}

// ── Macro Recorder State ──
const isRecording = ref(false)
const recordedActions = ref<MacroAction[]>([])
const savedMacros = ref<SavedMacro[]>([])
const elapsedSeconds = ref(0)
let recordInterval: ReturnType<typeof setInterval> | null = null
let recordStartTime = 0

// Event handler refs for cleanup
let mouseDownHandler: ((e: MouseEvent) => void) | null = null
let keyDownHandler: ((e: KeyboardEvent) => void) | null = null
let inputHandler: ((e: Event) => void) | null = null

const activeTab = ref('macro')
const showSaveDialog = ref(false)
const newMacroName = ref('')

const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// ── Batch Workflow State ──
const savedWorkflows = ref<Workflow[]>([])
const activeWorkflowIndex = ref<number | null>(null)
const currentWorkflow = ref<Workflow>({
  name: '',
  steps: [],
  createdAt: Date.now(),
})
const isRunning = ref(false)
const runProgress = ref(0)
const runStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const runResults = ref<RunLog[]>([])

const workflowOperations = [
  { value: 'convert' },
  { value: 'rename' },
  { value: 'compress' },
  { value: 'copy' },
  { value: 'delete' },
  { value: 'resize' },
]

// ── Load from localStorage ──
function loadMacrosFromStorage(): void {
  try {
    const raw = localStorage.getItem('automation_macros')
    if (raw) savedMacros.value = JSON.parse(raw)
  } catch { /* ignore */ }
}

function saveMacrosToStorage(): void {
  localStorage.setItem('automation_macros', JSON.stringify(savedMacros.value))
}

function loadWorkflowsFromStorage(): void {
  try {
    const raw = localStorage.getItem('automation_workflows')
    if (raw) savedWorkflows.value = JSON.parse(raw)
  } catch { /* ignore */ }
}

function saveWorkflowsToStorage(): void {
  localStorage.setItem('automation_workflows', JSON.stringify(savedWorkflows.value))
}

loadMacrosFromStorage()
loadWorkflowsFromStorage()

// ── Macro Functions ──
function toggleRecording(): void {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function startRecording(): void {
  isRecording.value = true
  recordStartTime = Date.now()
  elapsedSeconds.value = 0
  recordInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - recordStartTime) / 1000)
  }, 200)

  // Attach global capture-phase listeners
  mouseDownHandler = (e: MouseEvent) => {
    if (!isRecording.value) return
    const target = e.target as Element
    if (!target || target === document.body || target === document.documentElement) return
    // Skip clicks inside our own automation UI
    if (target.closest('.automation-page')) return
    recordedActions.value.push({
      type: 'click',
      target: getElementSelector(target),
      value: '',
      timestamp: Date.now(),
    })
  }
  keyDownHandler = (e: KeyboardEvent) => {
    if (!isRecording.value) return
    // Ignore modifier-only key presses
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return
    const target = e.target as Element
    // Don't capture typing into inputs/editable areas as key events —
    // the 'input' handler covers typed text. Record navigation/special keys only.
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable)) {
      // Still record navigation / enter / escape / backspace etc.
      const navKeys = ['Enter', 'Escape', 'Tab', 'Backspace', 'Delete',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown']
      if (!navKeys.includes(e.key)) return
    }
    recordedActions.value.push({
      type: 'key',
      target: '',
      value: e.key,
      timestamp: Date.now(),
    })
  }
  inputHandler = (e: Event) => {
    if (!isRecording.value) return
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    if (!target || !target.tagName) return
    if (target.closest('.automation-page')) return
    recordedActions.value.push({
      type: 'type',
      target: getElementSelector(target),
      value: target.value,
      timestamp: Date.now(),
    })
  }
  document.addEventListener('mousedown', mouseDownHandler, true)
  document.addEventListener('keydown', keyDownHandler, true)
  document.addEventListener('input', inputHandler, true)

  ElMessage.success(t('automation.macro.recordingStarted'))
}

function stopRecording(): void {
  isRecording.value = false
  if (recordInterval) {
    clearInterval(recordInterval)
    recordInterval = null
  }
  removeEventListeners()
  ElMessage.info(t('automation.macro.recordingStopped'))
}

function removeEventListeners(): void {
  if (mouseDownHandler) {
    document.removeEventListener('mousedown', mouseDownHandler, true)
    mouseDownHandler = null
  }
  if (keyDownHandler) {
    document.removeEventListener('keydown', keyDownHandler, true)
    keyDownHandler = null
  }
  if (inputHandler) {
    document.removeEventListener('input', inputHandler, true)
    inputHandler = null
  }
}

// ── CSS Selector Generator ──
// Builds a concise unique selector: prefers #id, then tag.unique-class, then falls
// back to tag:nth-child(...) ascending from the element toward <body>.
function getElementSelector(el: Element): string {
  if (!el || el === document.body) return 'body'
  if (el === document.documentElement) return 'html'
  // 1) id always wins
  if (el.id) return `#${CSS.escape(el.id)}`

  const parts: string[] = []
  let current: Element | null = el

  while (current && current !== document.body && current !== document.documentElement) {
    let segment = current.tagName.toLowerCase()

    // 2) try a unique class among siblings
    if (current.classList.length > 0 && current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
      for (const cls of current.classList) {
        const matches = siblings.filter(s => s.classList.contains(cls))
        if (matches.length === 1) {
          segment = `${current.tagName.toLowerCase()}.${CSS.escape(cls)}`
          break
        }
      }
    }

    // 3) disambiguate tag siblings with nth-child
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
      const sameTag = siblings.filter(
        s => s.tagName === current!.tagName
      )
      if (sameTag.length > 1) {
        const idx = sameTag.indexOf(current) + 1
        segment += `:nth-child(${idx})`
      }
    }

    parts.unshift(segment)

    // Early exit if selector is already globally unique
    const candidate = parts.join(' > ')
    try {
      if (document.querySelectorAll(candidate).length === 1) break
    } catch { /* invalid selector — keep going */ }

    current = current.parentElement
  }

  return parts.join(' > ')
}

// ── Playback helpers ──
function findAndClick(selector: string): void {
  const el = document.querySelector(selector)
  if (!el) {
    console.warn(`[Macro] Selector not found: ${selector}`)
    return
  }
  const rect = el.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
  })
  const mousedownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
  })
  const mouseupEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
  })
  el.dispatchEvent(mousedownEvent)
  el.dispatchEvent(mouseupEvent)
  el.dispatchEvent(clickEvent)
}

function findAndType(selector: string, value: string): void {
  const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null
  if (!el) {
    console.warn(`[Macro] Selector not found: ${selector}`)
    return
  }
  el.focus()
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function findAndKey(target: string, key: string): void {
  // target may be empty — then use active element
  const el = target ? document.querySelector(target) : document.activeElement
  const recipient = (el as HTMLElement | null) || document.body
  recipient.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  recipient.dispatchEvent(new KeyboardEvent('keypress', { key, bubbles: true, cancelable: true }))
  recipient.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }))
}

function playMacro(): void {
  if (recordedActions.value.length === 0) {
    ElMessage.warning(t('automation.macro.noActions'))
    return
  }
  ElMessage.info(t('automation.macro.playing'))

  let delay = 0
  for (const action of recordedActions.value) {
    setTimeout(() => {
      console.log(`[Macro] ${action.type}  ${action.target || '-'}  ${action.value || '-'}`)
      switch (action.type) {
        case 'click':
          findAndClick(action.target)
          break
        case 'type':
          findAndType(action.target, action.value)
          break
        case 'key':
          findAndKey(action.target, action.value)
          break
        case 'wait':
          // handled by the delay itself — nothing to dispatch
          break
      }
    }, delay)
    delay += action.type === 'wait' ? parseInt(action.value) || 500 : 300
  }
  setTimeout(() => {
    ElMessage.success(t('automation.macro.playComplete'))
  }, delay + 100)
}

function clearActions(): void {
  recordedActions.value = []
  ElMessage.info(t('automation.macro.cleared'))
}

function removeAction(index: number): void {
  recordedActions.value.splice(index, 1)
}

function saveMacro(): void {
  const name = newMacroName.value.trim()
  if (!name) {
    ElMessage.warning(t('automation.macro.nameRequired'))
    return
  }
  savedMacros.value.push({
    name,
    actions: [...recordedActions.value],
    createdAt: Date.now(),
  })
  saveMacrosToStorage()
  newMacroName.value = ''
  showSaveDialog.value = false
  ElMessage.success(t('automation.macro.saved'))
}

function loadMacro(macro: SavedMacro): void {
  recordedActions.value = [...macro.actions]
  ElMessage.success(t('automation.macro.loaded'))
}

function deleteMacro(index: number): void {
  savedMacros.value.splice(index, 1)
  saveMacrosToStorage()
  ElMessage.success(t('automation.macro.deleted'))
}

function exportMacro(macro: SavedMacro): void {
  const blob = new Blob([JSON.stringify(macro, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${macro.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Workflow Functions ──
function createNewWorkflow(): void {
  currentWorkflow.value = {
    name: t('automation.workflow.untitled'),
    steps: [],
    createdAt: Date.now(),
  }
  activeWorkflowIndex.value = null
}

function selectWorkflow(index: number): void {
  activeWorkflowIndex.value = index
  currentWorkflow.value = JSON.parse(JSON.stringify(savedWorkflows.value[index]))
}

function addStep(): void {
  currentWorkflow.value.steps.push({
    type: 'convert',
    filePattern: '',
    outputDir: '',
  })
}

function removeStep(index: number): void {
  currentWorkflow.value.steps.splice(index, 1)
}

function moveStep(index: number, direction: number): void {
  const steps = currentWorkflow.value.steps
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= steps.length) return
  const [item] = steps.splice(index, 1)
  steps.splice(newIndex, 0, item)
}

function saveWorkflow(): void {
  const name = currentWorkflow.value.name.trim()
  if (!name) {
    ElMessage.warning(t('automation.workflow.nameRequired'))
    return
  }
  if (activeWorkflowIndex.value !== null) {
    savedWorkflows.value[activeWorkflowIndex.value] = {
      ...JSON.parse(JSON.stringify(currentWorkflow.value)),
    }
  } else {
    savedWorkflows.value.push(JSON.parse(JSON.stringify(currentWorkflow.value)))
    activeWorkflowIndex.value = savedWorkflows.value.length - 1
  }
  saveWorkflowsToStorage()
  ElMessage.success(t('automation.workflow.saved'))
}

function deleteWorkflow(index: number): void {
  savedWorkflows.value.splice(index, 1)
  saveWorkflowsToStorage()
  if (activeWorkflowIndex.value === index) {
    activeWorkflowIndex.value = null
    currentWorkflow.value = { name: '', steps: [], createdAt: Date.now() }
  }
  ElMessage.success(t('automation.workflow.deleted'))
}

function runWorkflow(): void {
  if (currentWorkflow.value.steps.length === 0) {
    ElMessage.warning(t('automation.workflow.noSteps'))
    return
  }
  isRunning.value = true
  runProgress.value = 0
  runStatus.value = ''
  runResults.value = []
  const totalSteps = currentWorkflow.value.steps.length

  const addLog = (msg: string, level: RunLog['level'] = 'info'): void => {
    runResults.value.push({
      time: new Date().toLocaleTimeString(),
      message: msg,
      level,
    })
  }

  addLog(t('automation.workflow.running'))

  let stepIndex = 0
  const interval = setInterval(() => {
    if (stepIndex >= totalSteps) {
      clearInterval(interval)
      runProgress.value = 100
      runStatus.value = 'success'
      isRunning.value = false
      addLog(t('automation.workflow.complete'), 'success')
      ElMessage.success(t('automation.workflow.runComplete'))
      return
    }
    const step = currentWorkflow.value.steps[stepIndex]
    addLog(`Step ${stepIndex + 1}: ${step.type}`, 'info')
    stepIndex++
    runProgress.value = Math.round((stepIndex / totalSteps) * 100)
  }, 600)
}

// ── Helpers ──
function actionTagType(type: string): string {
  const map: Record<string, string> = {
    click: 'primary',
    type: 'success',
    key: 'warning',
    wait: 'info',
  }
  return map[type] || 'info'
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString()
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

// ── Cleanup ──
onUnmounted(() => {
  if (recordInterval) clearInterval(recordInterval)
})
</script>

<style scoped>
.automation-page {
  padding: 20px 24px;
  height: calc(100vh - 90px);
  overflow-y: auto;
  background: var(--main-bg, #f5f7fa);
}

.page-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.automation-tabs {
  background: var(--bg-primary, #fff);
  padding: 16px;
  border-radius: 8px;
}

/* ── Macro Recorder ── */
.macro-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.macro-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 10px;
}

.record-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.record-btn {
  width: 56px;
  height: 56px;
  font-size: 22px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.record-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(245, 108, 108, 0.4);
}

.record-icon { color: #fff; }
.stop-icon { color: #fff; font-size: 18px; }

.record-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--el-color-info, #909399);
  transition: background 0.3s;
}
.status-dot.recording {
  background: var(--el-color-danger, #f56c6c);
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.6); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(245, 108, 108, 0); }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}

.record-timer {
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
  margin-left: 4px;
}

.macro-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary, #303133);
}
.card-header .el-icon {
  color: var(--el-color-primary, #409eff);
}

.actions-card,
.saved-card {
  border-radius: 8px;
}

.actions-card :deep(.el-card__header),
.saved-card :deep(.el-card__header) {
  padding: 10px 16px;
  background: var(--bg-secondary, #f5f7fa);
}

/* ── Batch Workflow ── */
.workflow-layout {
  display: flex;
  gap: 16px;
  min-height: 500px;
}

.workflow-sidebar {
  width: 240px;
  flex-shrink: 0;
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #fff);
}

.workflow-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
  background: var(--bg-secondary, #f5f7fa);
  color: var(--text-primary, #303133);
}

.workflow-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.workflow-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.workflow-item:hover {
  background: var(--bg-secondary, #f5f7fa);
}
.workflow-item.active {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-left: 3px solid var(--el-color-primary, #409eff);
}

.wf-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
  margin-bottom: 2px;
}

.wf-meta {
  font-size: 12px;
  color: var(--text-secondary, #606266);
}

.workflow-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.wf-editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wf-name-input {
  max-width: 300px;
}

.wf-header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.wf-progress {
  margin-bottom: 4px;
}

.wf-steps-card {
  border-radius: 8px;
  flex: 1;
}
.wf-steps-card :deep(.el-card__header) {
  padding: 10px 16px;
  background: var(--bg-secondary, #f5f7fa);
}

.steps-empty {
  padding: 20px 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
  border: 1px solid var(--border-light, #ebeef5);
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.step-actions {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.wf-log-card {
  border-radius: 8px;
  max-height: 200px;
}
.wf-log-card :deep(.el-card__header) {
  padding: 10px 16px;
  background: var(--bg-secondary, #f5f7fa);
}
.wf-log-card :deep(.el-card__body) {
  padding: 0;
}

.log-panel {
  max-height: 160px;
  overflow-y: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 12px;
  padding: 8px;
}

.log-entry {
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 2px;
}
.log-entry.info { color: var(--el-color-info, #909399); }
.log-entry.success { color: var(--el-color-success, #67c23a); }
.log-entry.error { color: var(--el-color-danger, #f56c6c); }
.log-entry.warning { color: var(--el-color-warning, #e6a23c); }

.log-time {
  margin-right: 8px;
  opacity: 0.7;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .workflow-layout {
    flex-direction: column;
  }
  .workflow-sidebar {
    width: 100%;
    max-height: 200px;
  }
  .macro-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  .macro-actions {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
