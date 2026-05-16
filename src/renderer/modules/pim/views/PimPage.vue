<template>
  <div class="pim-page">
    <h2 class="page-title">{{ $t('nav.pim') }}</h2>

    <el-tabs v-model="activeTab" class="pim-tabs">
      <!-- ===== Calendar ===== -->
      <el-tab-pane :label="$t('pim.calendar.title')" name="calendar">
        <div class="calendar-section">
          <div class="calendar-header">
            <el-button-group size="small">
              <el-button @click="prevMonth"><el-icon><ArrowLeft /></el-icon></el-button>
              <el-button @click="nextMonth"><el-icon><ArrowRight /></el-icon></el-button>
            </el-button-group>
            <span class="month-label">{{ monthLabel }}</span>
            <el-button size="small" @click="goToday">{{ $t('pim.calendar.today') }}</el-button>
          </div>

          <div class="calendar-grid">
            <div class="cal-day-header" v-for="d in dayHeaders" :key="d">{{ d }}</div>
            <div
              v-for="(day, i) in calendarDays"
              :key="i"
              class="cal-day"
              :class="{
                'cal-day-other': !day.isCurrentMonth,
                'cal-day-today': day.isToday,
                'cal-day-selected': day.dateStr === selectedDate,
                'cal-day-has-events': eventsForDate(day.dateStr).length > 0,
              }"
              @click="selectDate(day)"
            >
              <span class="cal-day-num">{{ day.dayNum }}</span>
              <div class="cal-day-dots">
                <span
                  v-for="(ev, ei) in eventsForDate(day.dateStr).slice(0, 3)"
                  :key="ei"
                  class="cal-dot"
                  :style="{ backgroundColor: ev.color || '#409eff' }"
                />
              </div>
            </div>
          </div>

          <div class="calendar-events">
            <div class="events-header">
              <span>{{ selectedDate ? selectedDate : $t('pim.calendar.selectDay') }}</span>
              <el-button size="small" type="primary" @click="openEventDialog()">
                <el-icon><Plus /></el-icon>
                {{ $t('pim.calendar.addEvent') }}
              </el-button>
            </div>
            <div class="events-list" v-if="dayEvents.length > 0">
              <div
                v-for="ev in dayEvents"
                :key="ev.id"
                class="event-item"
                :style="{ borderLeftColor: ev.color || '#409eff' }"
              >
                <div class="event-info">
                  <span class="event-title">{{ ev.title }}</span>
                  <span class="event-time" v-if="ev.time">{{ ev.time }}</span>
                  <span class="event-desc" v-if="ev.description">{{ ev.description }}</span>
                </div>
                <div class="event-actions">
                  <el-button size="small" text @click="openEventDialog(ev)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="deleteEvent(ev.id)"><el-icon><Delete /></el-icon></el-button>
                </div>
              </div>
            </div>
            <el-empty v-else :description="$t('pim.calendar.noEvents')" :image-size="50" />
          </div>
        </div>
      </el-tab-pane>

      <!-- ===== Contacts ===== -->
      <el-tab-pane :label="$t('pim.contacts.title')" name="contacts">
        <div class="contacts-section">
          <div class="contacts-toolbar">
            <el-input
              v-model="contactSearch"
              :placeholder="$t('common.search')"
              size="small"
              clearable
              class="contact-search"
              :prefix-icon="Search"
            />
            <el-button type="primary" size="small" @click="openContactDialog()">
              <el-icon><Plus /></el-icon>
              {{ $t('pim.contacts.add') }}
            </el-button>
          </div>

          <div class="contacts-list" v-if="filteredContacts.length > 0">
            <el-card
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-card"
              shadow="hover"
            >
              <div class="contact-avatar">
                <el-avatar :size="48" :style="{ backgroundColor: contact.color || '#409eff' }">
                  {{ contact.name?.charAt(0)?.toUpperCase() || '?' }}
                </el-avatar>
              </div>
              <div class="contact-body">
                <div class="contact-name">
                  {{ contact.name }}
                  <el-icon v-if="contact.favorite" class="fav-icon"><StarFilled /></el-icon>
                </div>
                <div class="contact-detail" v-if="contact.phone">
                  <el-icon><Phone /></el-icon> {{ contact.phone }}
                </div>
                <div class="contact-detail" v-if="contact.email">
                  <el-icon><Message /></el-icon> {{ contact.email }}
                </div>
                <div class="contact-detail" v-if="contact.address">
                  <el-icon><Location /></el-icon> {{ contact.address }}
                </div>
                <div class="contact-detail" v-if="contact.notes">
                  <el-icon><Document /></el-icon> {{ contact.notes }}
                </div>
              </div>
              <div class="contact-actions">
                <el-button size="small" text @click="toggleFavorite(contact)">
                  <el-icon><StarFilled v-if="contact.favorite" /><Star v-else /></el-icon>
                </el-button>
                <el-button size="small" text @click="openContactDialog(contact)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-popconfirm
                  :title="$t('common.delete') + '?'"
                  @confirm="deleteContact(contact.id)"
                >
                  <template #reference>
                    <el-button size="small" text type="danger">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </el-card>
          </div>
          <el-empty v-else :description="$t('common.noData')" :image-size="80" />
        </div>
      </el-tab-pane>

      <!-- ===== Sticky Notes ===== -->
      <el-tab-pane :label="$t('pim.stickynotes.title')" name="stickynotes">
        <div class="stickynotes-section">
          <div class="stickynotes-toolbar">
            <el-button type="primary" size="small" @click="addNote">
              <el-icon><Plus /></el-icon>
              {{ $t('pim.stickynotes.add') }}
            </el-button>
          </div>

          <div class="notes-grid" v-if="stickyNotes.length > 0">
            <div
              v-for="note in stickyNotes"
              :key="note.id"
              class="sticky-card"
              :style="{ backgroundColor: note.color || '#feff9c' }"
              draggable="true"
              @dragstart="onDragStart($event, note.id)"
              @dragover.prevent
              @drop="onDrop($event, note.id)"
            >
              <div class="sticky-header">
                <el-color-picker
                  :model-value="note.color"
                  size="small"
                  :predefine="stickyColors"
                  @change="(c: string) => changeNoteColor(note.id, c)"
                />
                <el-button size="small" text type="danger" @click="deleteNote(note.id)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <el-input
                :model-value="note.content"
                type="textarea"
                :rows="4"
                :placeholder="$t('pim.stickynotes.placeholder')"
                class="sticky-textarea"
                @input="(val: string) => updateNoteContent(note.id, val)"
              />
              <div class="sticky-footer">
                <span class="sticky-date">{{ formatDateTime(note.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <el-empty v-else :description="$t('pim.stickynotes.emptyHint')" :image-size="80">
            <el-button type="primary" @click="addNote">
              {{ $t('pim.stickynotes.add') }}
            </el-button>
          </el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== Event Dialog ========== -->
    <el-dialog
      v-model="eventDialogVisible"
      :title="editingEvent.id ? $t('pim.calendar.editEvent') : $t('pim.calendar.addEvent')"
      width="440px"
      destroy-on-close
    >
      <el-form :model="eventForm" label-position="top" size="small">
        <el-form-item :label="$t('pim.calendar.eventTitle')">
          <el-input v-model="eventForm.title" />
        </el-form-item>
        <el-form-item :label="$t('pim.calendar.eventDate')">
          <el-date-picker
            v-model="eventForm.date"
            type="date"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item :label="$t('pim.calendar.eventTime')">
          <el-time-picker
            v-model="eventForm.time"
            format="HH:mm"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item :label="$t('pim.calendar.eventColor')">
          <el-color-picker v-model="eventForm.color" :predefine="eventColors" />
        </el-form-item>
        <el-form-item :label="$t('pim.calendar.eventDesc')">
          <el-input v-model="eventForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="eventDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveEvent">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- ========== Contact Dialog ========== -->
    <el-dialog
      v-model="contactDialogVisible"
      :title="editingContact.id ? $t('pim.contacts.edit') : $t('pim.contacts.add')"
      width="460px"
      destroy-on-close
    >
      <el-form :model="contactForm" label-position="top" size="small">
        <el-form-item :label="$t('pim.contacts.name')">
          <el-input v-model="contactForm.name" />
        </el-form-item>
        <el-form-item :label="$t('pim.contacts.phone')">
          <el-input v-model="contactForm.phone" />
        </el-form-item>
        <el-form-item :label="$t('pim.contacts.email')">
          <el-input v-model="contactForm.email" />
        </el-form-item>
        <el-form-item :label="$t('pim.contacts.address')">
          <el-input v-model="contactForm.address" />
        </el-form-item>
        <el-form-item :label="$t('pim.contacts.notes')">
          <el-input v-model="contactForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contactDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveContact">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, ArrowRight, Plus, Edit, Delete,
  Search, StarFilled, Star, Phone, Message, Location, Document, Close,
} from '@element-plus/icons-vue'

const { t } = useI18n()

// ============ Shared ============
const activeTab = ref('calendar')

// ============ Calendar ============
interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string
  description: string
  color: string
}
interface CalendarDay {
  dateStr: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  date: Date
}

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth()) // 0-based
const selectedDate = ref('')
const events = ref<CalendarEvent[]>(loadFromStorage('pim_events', []))
const dayHeaders = computed(() => {
  // Localized short day names
  const locale = (window as any).__i18n_locale || 'en'
  const sunFirst = locale === 'zh-CN'
  const base = sunFirst ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return sunFirst ? base : base
})

const monthLabel = computed(() => {
  const locale = (window as any).__i18n_locale || 'en'
  if (locale === 'zh-CN') {
    return `${currentYear.value}年${currentMonth.value + 1}月`
  }
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[currentMonth.value]} ${currentYear.value}`
})

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay() // 0=Sun
  const todayStr = formatDateStr(new Date())

  // Start from previous month to fill week
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const days: CalendarDay[] = []

  // Previous month fill
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const date = new Date(year, month - 1, d)
    days.push({ dateStr: formatDateStr(date), dayNum: d, isCurrentMonth: false, isToday: false, date })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dateStr = formatDateStr(date)
    days.push({ dateStr, dayNum: d, isCurrentMonth: true, isToday: dateStr === todayStr, date })
  }

  // Next month fill to complete grid (up to 42 cells)
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    days.push({ dateStr: formatDateStr(date), dayNum: d, isCurrentMonth: false, isToday: false, date })
  }

  return days.slice(0, 42)
})

const dayEvents = computed(() => {
  if (!selectedDate.value) return []
  return events.value.filter(e => e.date === selectedDate.value)
})

function eventsForDate(dateStr: string): CalendarEvent[] {
  return events.value.filter(e => e.date === dateStr)
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function prevMonth(): void {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

function nextMonth(): void {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}

function goToday(): void {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDate.value = formatDateStr(today)
}

function selectDate(day: CalendarDay): void {
  if (day.dateStr === selectedDate.value) {
    selectedDate.value = ''
  } else {
    selectedDate.value = day.dateStr
  }
}

// Event dialog
const eventDialogVisible = ref(false)
const editingEvent = ref<Partial<CalendarEvent>>({})
const eventForm = reactive({
  title: '', date: '', time: '', description: '', color: '#409eff',
})
const eventColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#b37feb']

function openEventDialog(ev?: CalendarEvent): void {
  if (ev) {
    editingEvent.value = { ...ev }
    eventForm.title = ev.title
    eventForm.date = ev.date
    eventForm.time = ev.time
    eventForm.description = ev.description
    eventForm.color = ev.color || '#409eff'
  } else {
    editingEvent.value = {}
    eventForm.title = ''
    eventForm.date = selectedDate.value || formatDateStr(new Date())
    eventForm.time = ''
    eventForm.description = ''
    eventForm.color = '#409eff'
  }
  eventDialogVisible.value = true
}

function saveEvent(): void {
  if (!eventForm.title.trim()) {
    ElMessage.warning(t('pim.calendar.titleRequired'))
    return
  }
  const data: CalendarEvent = {
    id: editingEvent.value.id || 'ev_' + Date.now(),
    title: eventForm.title.trim(),
    date: typeof eventForm.date === 'string' ? eventForm.date : formatDateStr(new Date(eventForm.date)),
    time: eventForm.time ? (typeof eventForm.time === 'string' ? eventForm.time : (eventForm.time as Date).toTimeString().slice(0, 5)) : '',
    description: eventForm.description,
    color: eventForm.color,
  }
  if (editingEvent.value.id) {
    const idx = events.value.findIndex(e => e.id === editingEvent.value.id)
    if (idx >= 0) events.value[idx] = data
  } else {
    events.value.push(data)
  }
  saveToStorage('pim_events', events.value)
  eventDialogVisible.value = false
  if (!selectedDate.value) selectedDate.value = data.date
  ElMessage.success(t('common.save'))
}

function deleteEvent(id: string): void {
  events.value = events.value.filter(e => e.id !== id)
  saveToStorage('pim_events', events.value)
  ElMessage.success(t('common.delete'))
}

// ============ Contacts ============
interface Contact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  notes: string
  favorite: boolean
  color: string
}

const contacts = ref<Contact[]>(loadFromStorage('pim_contacts', []))
const contactSearch = ref('')

const filteredContacts = computed(() => {
  const q = contactSearch.value.toLowerCase().trim()
  if (!q) return contacts.value
  return contacts.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.email.toLowerCase().includes(q)
  )
})

const contactDialogVisible = ref(false)
const editingContact = ref<Partial<Contact>>({})
const contactForm = reactive({
  name: '', phone: '', email: '', address: '', notes: '',
})
const contactColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#b37feb', '#36cfc9', '#597ef7']

function openContactDialog(contact?: Contact): void {
  if (contact) {
    editingContact.value = { ...contact }
    contactForm.name = contact.name
    contactForm.phone = contact.phone
    contactForm.email = contact.email
    contactForm.address = contact.address
    contactForm.notes = contact.notes
  } else {
    editingContact.value = {}
    contactForm.name = ''
    contactForm.phone = ''
    contactForm.email = ''
    contactForm.address = ''
    contactForm.notes = ''
  }
  contactDialogVisible.value = true
}

function saveContact(): void {
  if (!contactForm.name.trim()) {
    ElMessage.warning(t('pim.contacts.nameRequired'))
    return
  }
  const data: Contact = {
    id: editingContact.value.id || 'ct_' + Date.now(),
    name: contactForm.name.trim(),
    phone: contactForm.phone.trim(),
    email: contactForm.email.trim(),
    address: contactForm.address.trim(),
    notes: contactForm.notes.trim(),
    favorite: editingContact.value.favorite || false,
    color: editingContact.value.color || contactColors[Math.floor(Math.random() * contactColors.length)],
  }
  if (editingContact.value.id) {
    const idx = contacts.value.findIndex(c => c.id === editingContact.value.id)
    if (idx >= 0) contacts.value[idx] = data
  } else {
    contacts.value.push(data)
  }
  saveToStorage('pim_contacts', contacts.value)
  contactDialogVisible.value = false
  ElMessage.success(t('common.save'))
}

function deleteContact(id: string): void {
  contacts.value = contacts.value.filter(c => c.id !== id)
  saveToStorage('pim_contacts', contacts.value)
  ElMessage.success(t('common.delete'))
}

function toggleFavorite(contact: Contact): void {
  contact.favorite = !contact.favorite
  saveToStorage('pim_contacts', contacts.value)
}

// ============ Sticky Notes ============
interface StickyNote {
  id: string
  content: string
  color: string
  createdAt: number
  updatedAt: number
}

const stickyNotes = ref<StickyNote[]>(loadFromStorage('pim_sticky', []))
const stickyColors = ['#feff9c', '#ffd1d1', '#d1f0ff', '#d1ffd1', '#f0d1ff', '#ffe0b2', '#b2dfdb', '#f8bbd0']
let draggedNoteId: string | null = null

function addNote(): void {
  const note: StickyNote = {
    id: 'sn_' + Date.now(),
    content: '',
    color: stickyColors[Math.floor(Math.random() * stickyColors.length)],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  stickyNotes.value.unshift(note)
  saveToStorage('pim_sticky', stickyNotes.value)
}

function updateNoteContent(id: string, content: string): void {
  const note = stickyNotes.value.find(n => n.id === id)
  if (note) {
    note.content = content
    note.updatedAt = Date.now()
    debouncedSaveSticky()
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSaveSticky(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveToStorage('pim_sticky', stickyNotes.value)
  }, 400)
}

function deleteNote(id: string): void {
  stickyNotes.value = stickyNotes.value.filter(n => n.id !== id)
  saveToStorage('pim_sticky', stickyNotes.value)
}

function changeNoteColor(id: string, color: string): void {
  const note = stickyNotes.value.find(n => n.id === id)
  if (note) {
    note.color = color
    saveToStorage('pim_sticky', stickyNotes.value)
  }
}

function onDragStart(e: DragEvent, id: string): void {
  draggedNoteId = id
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDrop(e: DragEvent, targetId: string): void {
  if (!draggedNoteId || draggedNoteId === targetId) return
  const fromIdx = stickyNotes.value.findIndex(n => n.id === draggedNoteId)
  const toIdx = stickyNotes.value.findIndex(n => n.id === targetId)
  if (fromIdx >= 0 && toIdx >= 0) {
    const [item] = stickyNotes.value.splice(fromIdx, 1)
    stickyNotes.value.splice(toIdx, 0, item)
    saveToStorage('pim_sticky', stickyNotes.value)
  }
  draggedNoteId = null
}

function formatDateTime(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ============ Storage Helpers ============
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}
</script>

<style scoped>
.pim-page {
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
.pim-tabs {
  background: var(--bg-primary, #fff);
  border-radius: 8px;
  padding: 8px 16px 16px;
  box-shadow: var(--box-shadow-light, 0 1px 3px rgba(0, 0, 0, 0.08));
}

/* ===== Calendar ===== */
.calendar-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding-top: 8px;
}
.calendar-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.month-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  min-width: 160px;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-day-header {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #606266);
  padding: 6px 0;
}
.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  font-size: 14px;
  color: var(--text-primary, #303133);
}
.cal-day:hover { background: var(--bg-secondary, #f0f2f5); }
.cal-day-other { color: #c0c4cc; }
.cal-day-today {
  background: var(--el-color-primary-light-9, #ecf5ff);
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
}
.cal-day-selected {
  background: var(--el-color-primary, #409eff);
  color: #fff;
}
.cal-day-has-events { }
.cal-day-num { position: relative; z-index: 1; }
.cal-day-dots {
  display: flex;
  gap: 2px;
  margin-top: 2px;
}
.cal-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.calendar-events {
  border-left: 1px solid var(--border-color, #ebeef5);
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #303133);
}
.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 360px;
}
.event-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--bg-secondary, #f5f7fa);
  border-left: 3px solid #409eff;
}
.event-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.event-title { font-size: 14px; font-weight: 500; }
.event-time { font-size: 12px; color: var(--text-secondary, #606266); }
.event-desc { font-size: 12px; color: var(--text-secondary, #909399); }
.event-actions { display: flex; gap: 2px; }

/* ===== Contacts ===== */
.contacts-section { padding-top: 8px; display: flex; flex-direction: column; gap: 16px; }
.contacts-toolbar { display: flex; gap: 10px; }
.contact-search { max-width: 280px; }
.contacts-list { display: flex; flex-direction: column; gap: 10px; }
.contact-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 8px;
}
.contact-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0;
  width: 100%;
}
.contact-avatar { flex-shrink: 0; }
.contact-body { flex: 1; min-width: 0; }
.contact-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  display: flex;
  align-items: center;
  gap: 6px;
}
.fav-icon { color: #e6a23c; font-size: 14px; }
.contact-detail {
  font-size: 13px;
  color: var(--text-secondary, #606266);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.contact-actions { display: flex; gap: 2px; flex-shrink: 0; }

/* ===== Sticky Notes ===== */
.stickynotes-section { padding-top: 8px; display: flex; flex-direction: column; gap: 16px; }
.stickynotes-toolbar { display: flex; gap: 10px; }
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.sticky-card {
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--box-shadow-medium, 0 2px 8px rgba(0, 0, 0, 0.1));
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: grab;
}
.sticky-card:hover { box-shadow: var(--box-shadow-heavy, 0 4px 16px rgba(0, 0, 0, 0.15)); transform: translateY(-2px); }
.sticky-card:active { cursor: grabbing; }
.sticky-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sticky-textarea :deep(textarea) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.sticky-footer { display: flex; justify-content: flex-end; }
.sticky-date { font-size: 11px; color: #999; }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .pim-page { padding: 12px; }
  .calendar-section {
    grid-template-columns: 1fr;
  }
  .calendar-events {
    border-left: none;
    border-top: 1px solid var(--border-color, #ebeef5);
    padding-left: 0;
    padding-top: 12px;
  }
  .notes-grid { grid-template-columns: 1fr; }
}
</style>
