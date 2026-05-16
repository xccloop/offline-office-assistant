<template>







  <div class="tools-page">







    <h2 class="page-title">{{ $t('nav.tools') }}</h2>















    <div class="tools-grid">







      <!-- 剪贴板历史 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><DocumentCopy /></el-icon>







            <span>{{ $t('tools.clipboard.title') }}</span>







          </div>







        </template>







        <div class="clipboard-section">







          <div class="clipboard-actions">







            <el-button size="small" type="primary" @click="pasteFromClipboard">







              <el-icon><Plus /></el-icon>







              {{ $t('tools.clipboard.pasteFromClipboard') }}







            </el-button>







            <el-button







              size="small"







              :disabled="clipboardHistory.length === 0"







              @click="clearClipboardHistory"







            >







              <el-icon><Delete /></el-icon>







              {{ $t('tools.clipboard.clear') }}







            </el-button>







          </div>







          <div class="clipboard-list" v-if="clipboardHistory.length > 0">







            <div







              v-for="(item, idx) in clipboardHistory"







              :key="idx"







              class="clipboard-item"







            >







              <span class="clipboard-text">{{ item }}</span>







              <el-button







                size="small"







                text







                @click="copyToClipboard(item)"







              >







                <el-icon><CopyDocument /></el-icon>







              </el-button>







            </div>







          </div>







          <el-empty







            v-else







            :description="$t('tools.clipboard.empty')"







            :image-size="60"







          />







        </div>







      </el-card>















      <!-- 颜色选择器 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Brush /></el-icon>







            <span>{{ $t('tools.colorPicker.title') }}</span>







          </div>







        </template>







        <div class="color-picker-section">







          <div class="color-display">







            <div







              class="color-swatch"







              :style="{ backgroundColor: selectedColor }"







            />







            <div class="color-values">







              <div class="color-row">







                <span class="color-label">HEX</span>







                <code class="color-code">{{ selectedColor }}</code>







                <el-button size="small" text @click="copyToClipboard(selectedColor)">







                  <el-icon><CopyDocument /></el-icon>







                </el-button>







              </div>







              <div class="color-row">







                <span class="color-label">RGB</span>







                <code class="color-code">{{ rgbString }}</code>







                <el-button size="small" text @click="copyToClipboard(rgbString)">







                  <el-icon><CopyDocument /></el-icon>







                </el-button>







              </div>







              <div class="color-row">







                <span class="color-label">HSL</span>







                <code class="color-code">{{ hslString }}</code>







                <el-button size="small" text @click="copyToClipboard(hslString)">







                  <el-icon><CopyDocument /></el-icon>







                </el-button>







              </div>







            </div>







          </div>







          <div class="color-picker-control">







            <el-color-picker v-model="selectedColor" show-alpha />







            <span class="picker-hint">{{ $t('tools.colorPicker.pick') }}</span>







          </div>







        </div>







      </el-card>















      <!-- 字符统计 -->







      <el-card class="tool-card tool-card-wide" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><DataAnalysis /></el-icon>







            <span>{{ $t('tools.charCounter.title') }}</span>







          </div>







        </template>







        <div class="char-counter-section">







          <el-input







            v-model="textInput"







            type="textarea"







            :rows="8"







            :placeholder="$t('tools.charCounter.input')"







            class="text-input"







          />







          <div class="stats-grid">







            <div class="stat-item">







              <span class="stat-value">{{ stats.characters }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.characters') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.charactersNoSpaces }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.charactersNoSpaces') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.words }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.words') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.lines }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.lines') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.paragraphs }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.paragraphs') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.bytes }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.bytes') }}</span>







            </div>







            <div class="stat-item">







              <span class="stat-value">{{ stats.sentences }}</span>







              <span class="stat-label">{{ $t('tools.charCounter.sentences') }}</span>







            </div>







          </div>







        </div>







      </el-card>















      <!-- ====== NEW TOOLS ====== -->















      <!-- 计算器 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Operation /></el-icon>







            <span>{{ $t('tools.calculator.title') }}</span>







          </div>







        </template>







        <div class="calculator-section">







          <div class="calc-display">







            <span class="calc-expression">{{ calcExpression || '0' }}</span>







            <span class="calc-result">{{ calcResult }}</span>







          </div>







          <div class="calc-buttons">







            <el-button class="calc-btn calc-btn-fn" @click="calcClear">{{ $t('tools.calculator.clear') }}</el-button>







            <el-button class="calc-btn calc-btn-fn" @click="calcBackspace">⌫</el-button>







            <el-button class="calc-btn calc-btn-fn" @click="calcPercent">%</el-button>







            <el-button class="calc-btn calc-btn-op" @click="calcAppend('/')">/</el-button>















            <el-button class="calc-btn" @click="calcAppend('7')">7</el-button>







            <el-button class="calc-btn" @click="calcAppend('8')">8</el-button>







            <el-button class="calc-btn" @click="calcAppend('9')">9</el-button>







            <el-button class="calc-btn calc-btn-op" @click="calcAppend('*')">*</el-button>















            <el-button class="calc-btn" @click="calcAppend('4')">4</el-button>







            <el-button class="calc-btn" @click="calcAppend('5')">5</el-button>







            <el-button class="calc-btn" @click="calcAppend('6')">6</el-button>







            <el-button class="calc-btn calc-btn-op" @click="calcAppend('-')">-</el-button>















            <el-button class="calc-btn" @click="calcAppend('1')">1</el-button>







            <el-button class="calc-btn" @click="calcAppend('2')">2</el-button>







            <el-button class="calc-btn" @click="calcAppend('3')">3</el-button>







            <el-button class="calc-btn calc-btn-op" @click="calcAppend('+')">+</el-button>















            <el-button class="calc-btn calc-btn-zero" @click="calcAppend('0')">0</el-button>







            <el-button class="calc-btn" @click="calcAppend('.')">.</el-button>







            <el-button class="calc-btn calc-btn-eq" @click="calcEvaluate">=</el-button>







          </div>







        </div>







      </el-card>















      <!-- 正则表达式测试器 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Search /></el-icon>







            <span>{{ $t('tools.regexTester.title') }}</span>







          </div>







        </template>







        <div class="regex-section">







          <div class="regex-pattern-row">







            <span class="regex-delimiter">/</span>







            <el-input







              v-model="regexPattern"







              :placeholder="$t('tools.regexTester.patternPlaceholder')"







              size="small"







              class="regex-pattern-input"







            />







            <span class="regex-delimiter">/</span>







            <el-select v-model="regexFlags" multiple size="small" style="width: 140px" placeholder="flags">







              <el-option label="g (global)" value="g" />







              <el-option label="i (ignoreCase)" value="i" />







              <el-option label="m (multiline)" value="m" />







              <el-option label="s (dotAll)" value="s" />







            </el-select>







          </div>







          <el-input







            v-model="regexTestText"







            type="textarea"







            :rows="5"







            :placeholder="$t('tools.regexTester.testPlaceholder')"







            class="regex-test-input"







          />







          <div class="regex-highlight" v-if="regexPattern && regexTestText">







            <span







              v-for="(part, idx) in highlightedParts"







              :key="idx"







              :class="{ 'match-highlight': part.match }"







            >{{ part.text }}</span>







          </div>







          <div v-if="regexMatches.length > 0" class="regex-matches">







            <div class="regex-match-count">







              {{ $t('tools.regexTester.matchCount', { count: regexMatches.length }) }}







            </div>







            <div v-for="(m, idx) in regexMatches" :key="idx" class="regex-match-item">







              <code>{{ idx + 1 }}: {{ m }}</code>







            </div>







          </div>







          <div v-else-if="regexPattern && regexTestText" class="regex-no-match">







            {{ $t('tools.regexTester.noMatch') }}







          </div>







        </div>







      </el-card>















      <!-- 加解密工具 -->







      <el-card class="tool-card tool-card-wide" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Lock /></el-icon>







            <span>{{ $t('tools.encryption.title') }}</span>







          </div>







        </template>







        <div class="encryption-section">







          <div class="encryption-controls">







            <el-select v-model="cryptoMethod" size="small" style="width: 120px">







              <el-option label="Base64" value="base64" />







              <el-option label="AES" value="aes" />







              <el-option label="DES" value="des" />







            </el-select>







            <el-input







              v-if="cryptoMethod !== 'base64'"







              v-model="cryptoPassword"







              size="small"







              :placeholder="$t('tools.encryption.passwordPlaceholder')"







              type="password"







              style="width: 180px"







              show-password







            />







            <el-button size="small" type="primary" @click="encryptText">







              <el-icon><Lock /></el-icon>







              {{ $t('tools.encryption.encrypt') }}







            </el-button>







            <el-button size="small" type="warning" @click="decryptText">







              <el-icon><Unlock /></el-icon>







              {{ $t('tools.encryption.decrypt') }}







            </el-button>







            <el-button size="small" @click="cryptoSwap">







              {{ $t('tools.encryption.swap') }}







            </el-button>







          </div>







          <div class="encryption-io">







            <el-input







              v-model="cryptoInput"







              type="textarea"







              :rows="4"







              :placeholder="$t('tools.encryption.inputPlaceholder')"







            />







            <el-icon class="encryption-arrow"><Bottom /></el-icon>







            <el-input







              v-model="cryptoOutput"







              type="textarea"







              :rows="4"







              :placeholder="$t('tools.encryption.outputPlaceholder')"







              readonly







            />







          </div>







          <div v-if="cryptoError" class="encryption-error">{{ cryptoError }}</div>







        </div>







      </el-card>















      <!-- 待办事项 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><List /></el-icon>







            <span>{{ $t('tools.todo.title') }}</span>







            <span class="todo-count">{{ todoStats }}</span>







          </div>







        </template>







        <div class="todo-section">







          <div class="todo-input-row">







            <el-input







              v-model="todoNewText"







              size="small"







              :placeholder="$t('tools.todo.placeholder')"







              @keyup.enter="todoAdd"







            />







            <el-button size="small" type="primary" @click="todoAdd">







              <el-icon><Plus /></el-icon>







            </el-button>







          </div>







          <div class="todo-filters">







            <el-radio-group v-model="todoFilter" size="small">







              <el-radio-button value="all">{{ $t('tools.todo.filterAll') }}</el-radio-button>







              <el-radio-button value="active">{{ $t('tools.todo.filterActive') }}</el-radio-button>







              <el-radio-button value="done">{{ $t('tools.todo.filterDone') }}</el-radio-button>







            </el-radio-group>







            <el-button







              v-if="todos.length > 0"







              size="small"







              text







              type="danger"







              @click="todoClearDone"







            >







              {{ $t('tools.todo.clearDone') }}







            </el-button>







          </div>







          <div class="todo-list" v-if="filteredTodos.length > 0">







            <div







              v-for="todo in filteredTodos"







              :key="todo.id"







              class="todo-item"







              :class="{ 'todo-done': todo.done }"







            >







              <el-checkbox v-model="todo.done" @change="todoSave" />







              <span class="todo-text">{{ todo.text }}</span>







              <el-button size="small" text type="danger" @click="todoRemove(todo.id)">







                <el-icon><Close /></el-icon>







              </el-button>







            </div>







          </div>







          <el-empty v-else :description="$t('tools.todo.empty')" :image-size="50" />







        </div>







      </el-card>















      <!-- 截图工具 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Crop /></el-icon>







            <span>{{ $t('tools.screenshot.title') }}</span>







          </div>







        </template>







        <div class="screenshot-section">







          <div class="screenshot-hint">







            <el-icon :size="36"><Camera /></el-icon>







            <span>{{ $t('tools.screenshot.hint') }}</span>







          </div>







          <div class="screenshot-hotkey">







            <el-tag size="large" type="info">{{ screenshotHotkey }}</el-tag>







            <span class="hotkey-label">{{ $t('tools.screenshot.hotkeyLabel') }}</span>







          </div>







          <el-button type="primary" @click="startScreenshot" :loading="isCapturing">






            <el-icon><Crop /></el-icon>






            {{ $t('tools.screenshot.capture') }}






          </el-button>






          <div class="screenshot-preview" v-if="screenshotDataUrl">






            <img :src="screenshotDataUrl" alt="Screenshot preview" class="screenshot-image" />






            <div class="screenshot-actions">






              <el-button size="small" type="success" @click="copyScreenshot">






                <el-icon><DocumentCopy /></el-icon>






                {{ $t('tools.screenshot.copy') }}






              </el-button>






              <el-button size="small" @click="saveScreenshot">






                <el-icon><Download /></el-icon>






                {{ $t('tools.screenshot.save') }}






              </el-button>






            </div>






          </div>






          <div class="screenshot-history" v-if="screenshotHistory.length > 0">







            <h4 class="subsection-title">{{ $t('tools.screenshot.history') }}</h4>







            <div







              v-for="(item, idx) in screenshotHistory"







              :key="idx"







              class="screenshot-item"







            >







              <el-icon><Picture /></el-icon>







              <span>{{ item.name }}</span>







              <span class="screenshot-time">{{ item.time }}</span>







            </div>







          </div>







          <el-empty







            v-else







            :description="$t('tools.screenshot.noHistory')"







            :image-size="50"







          />







        </div>







      </el-card>















      <!-- 语音转文字 -->







      <el-card class="tool-card" shadow="hover">







        <template #header>







          <div class="card-header">







            <el-icon><Microphone /></el-icon>







            <span>{{ $t('tools.voiceToText.title') }}</span>







          </div>







        </template>







        <div class="vtt-section">







          <div class="vtt-record-area">







            <el-button







              :type="isRecording ? 'danger' : 'primary'"







              :class="{ 'is-recording': isRecording }"







              circle







              :icon="isRecording ? VideoPause : Microphone"







              size="large"







              @click="toggleRecording"







            />







            <div class="vtt-status">







              <span v-if="isRecording" class="recording-indicator">







                <span class="recording-dot" />







                {{ $t('tools.voiceToText.recording') }}







              </span>







              <span v-else>{{ $t('tools.voiceToText.idle') }}</span>







            </div>







          </div>







          <div class="vtt-visualization" v-if="isRecording">







            <div class="audio-bar" v-for="n in 12" :key="n" :style="{ animationDelay: `${n * 0.08}s` }" />







          </div>







          <div class="vtt-transcript">







            <h4 class="subsection-title">{{ $t('tools.voiceToText.transcript') }}</h4>







            <el-input







              v-model="voiceTranscript"







              type="textarea"







              :rows="4"







              :placeholder="$t('tools.voiceToText.transcriptPlaceholder')"







              readonly







            />







          </div>







          <div class="vtt-history" v-if="voiceHistory.length > 0">







            <h4 class="subsection-title">{{ $t('tools.voiceToText.history') }}</h4>







            <div







              v-for="(item, idx) in voiceHistory"







              :key="idx"







              class="vtt-history-item"







            >







              <span class="vtt-history-time">{{ item.time }}</span>







              <span class="vtt-history-text">{{ item.text.substring(0, 60) }}{{ item.text.length > 60 ? '...' : '' }}</span>







              <el-button size="small" text @click="voiceTranscript = item.text">







                <el-icon><View /></el-icon>







              </el-button>







            </div>







          </div>







        </div>







      </el-card>















    </div>







  </div>







</template>















<script setup lang="ts">







import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'







import { useI18n } from 'vue-i18n'







import { ElMessage } from 'element-plus'







import {







  DocumentCopy,







  Plus,







  Delete,







  CopyDocument,







  Brush,







  DataAnalysis,







  Operation,







  Search,







  Lock,







  Unlock,







  Bottom,







  List,







  Close,







  Crop,







  Camera,







  Picture,







  Microphone,







  VideoPause,







  View,


  Download,


} from '@element-plus/icons-vue'










const { t } = useI18n()















// ── 剪贴板历史 ──







const clipboardHistory = ref<string[]>([])















async function pasteFromClipboard(): Promise<void> {







  try {







    const text = await navigator.clipboard.readText()







    if (text.trim()) {







      if (clipboardHistory.value[0] !== text) {







        clipboardHistory.value.unshift(text)







        if (clipboardHistory.value.length > 50) {







          clipboardHistory.value.pop()







        }







      }







    }







  } catch {







    ElMessage.warning(t('tools.clipboard.empty'))







  }







}















function clearClipboardHistory(): void {







  clipboardHistory.value = []







}















async function copyToClipboard(text: string): Promise<void> {







  try {







    await navigator.clipboard.writeText(text)







    ElMessage.success(t('common.copied'))







  } catch {







    ElMessage.error('Failed to copy')







  }







}















// ── 颜色选择器 ──







const selectedColor = ref('#409EFF')















function hexToRgb(hex: string): { r: number; g: number; b: number; a?: number } {







  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)







  if (!result) return { r: 0, g: 0, b: 0 }







  return {







    r: parseInt(result[1], 16),







    g: parseInt(result[2], 16),







    b: parseInt(result[3], 16),







    a: result[4] ? Math.round((parseInt(result[4], 16) / 255) * 100) / 100 : undefined,







  }







}















function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {







  r /= 255; g /= 255; b /= 255







  const max = Math.max(r, g, b)







  const min = Math.min(r, g, b)







  let h = 0, s = 0







  const l = (max + min) / 2















  if (max !== min) {







    const d = max - min







    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)







    switch (max) {







      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break







      case g: h = ((b - r) / d + 2) / 6; break







      case b: h = ((r - g) / d + 4) / 6; break







    }







  }















  return {







    h: Math.round(h * 360),







    s: Math.round(s * 100),







    l: Math.round(l * 100),







  }







}















const rgbString = computed(() => {







  const { r, g, b, a } = hexToRgb(selectedColor.value)







  if (a !== undefined && a < 1) {







    return `rgba(${r}, ${g}, ${b}, ${a})`







  }







  return `rgb(${r}, ${g}, ${b})`







})















const hslString = computed(() => {







  const { r, g, b } = hexToRgb(selectedColor.value)







  const { h, s, l } = rgbToHsl(r, g, b)







  return `hsl(${h}, ${s}%, ${l}%)`







})















// ── 字符统计 ──







const textInput = ref('')















interface TextStats {







  characters: number







  charactersNoSpaces: number







  words: number







  lines: number







  paragraphs: number







  bytes: number







  sentences: number







}















const stats = reactive<TextStats>({







  characters: 0,







  charactersNoSpaces: 0,







  words: 0,







  lines: 0,







  paragraphs: 0,







  bytes: 0,







  sentences: 0,







})















function computeStats(text: string): void {







  stats.characters = text.length







  stats.charactersNoSpaces = text.replace(/\s/g, '').length







  stats.words = text.trim() ? text.trim().split(/\s+/).length : 0







  stats.lines = text ? text.split(/\r?\n/).length : 0







  stats.paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0







  stats.bytes = new Blob([text]).size







  stats.sentences = text.trim()







    ? text.replace(/[.。!！?？]+/g, '.').split('.').filter(s => s.trim().length > 0).length







    : 0







}















watch(textInput, (val) => {







  computeStats(val)







})















// ── 计算器 ──







const calcExpression = ref('')







const calcResult = ref('')







const calcJustEvaluated = ref(false)















function calcAppend(char: string): void {







  if (calcJustEvaluated.value && '0123456789.'.includes(char)) {







    calcExpression.value = ''







    calcResult.value = ''







  }







  calcJustEvaluated.value = false







  calcExpression.value += char







  calcLiveEval()







}















function calcClear(): void {







  calcExpression.value = ''







  calcResult.value = ''







  calcJustEvaluated.value = false







}















function calcBackspace(): void {







  calcExpression.value = calcExpression.value.slice(0, -1)







  calcLiveEval()







}















function calcPercent(): void {







  calcExpression.value += '%'







}















function calcLiveEval(): void {







  try {







    let expr = calcExpression.value.replace(/%/g, '/100')







    expr = expr.replace(/[^0-9+\-*/.()]/g, '')







    if (expr && /[0-9]/.test(expr)) {







      const val = Function('"use strict"; return (' + expr + ')')()







      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {







        calcResult.value = String(Number(val.toFixed(10)))







        return







      }







    }







    calcResult.value = ''







  } catch {







    calcResult.value = ''







  }







}















function calcEvaluate(): void {







  try {







    let expr = calcExpression.value.replace(/%/g, '/100')







    expr = expr.replace(/[^0-9+\-*/.()]/g, '')







    if (expr && /[0-9]/.test(expr)) {







      const val = Function('"use strict"; return (' + expr + ')')()







      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {







        const result = Number(val.toFixed(10))







        calcResult.value = String(result)







        calcExpression.value = String(result)







        calcJustEvaluated.value = true







        return







      }







    }







    calcResult.value = t('tools.calculator.error')







  } catch {







    calcResult.value = t('tools.calculator.error')







  }







}















// ── 正则测试器 ──







const regexPattern = ref('')







const regexFlags = ref<string[]>(['g'])







const regexTestText = ref('')















const highlightedParts = computed(() => {







  if (!regexPattern.value || !regexTestText.value) return [{ text: regexTestText.value, match: false }]







  try {







    const flags = regexFlags.value.join('')







    const regex = new RegExp(regexPattern.value, flags)







    const parts: { text: string; match: boolean }[] = []







    let lastIndex = 0







    let match: RegExpExecArray | null







    // Use a copy to avoid mutating lastIndex issues







    const text = regexTestText.value







    while ((match = regex.exec(text)) !== null) {







      if (match.index > lastIndex) {







        parts.push({ text: text.slice(lastIndex, match.index), match: false })







      }







      parts.push({ text: match[0], match: true })







      lastIndex = regex.lastIndex







      if (match[0].length === 0) {







        if (regex.lastIndex >= text.length) break







        regex.lastIndex++







      }







    }







    if (lastIndex < text.length) {







      parts.push({ text: text.slice(lastIndex), match: false })







    }







    return parts.length > 0 ? parts : [{ text, match: false }]







  } catch {







    return [{ text: regexTestText.value, match: false }]







  }







})















const regexMatches = computed(() => {







  if (!regexPattern.value || !regexTestText.value) return []







  try {







    const flags = regexFlags.value.join('')







    const regex = new RegExp(regexPattern.value, flags)







    const matches: string[] = []







    let match: RegExpExecArray | null







    const text = regexTestText.value







    while ((match = regex.exec(text)) !== null) {







      matches.push(match[0])







      if (match[0].length === 0) {







        if (regex.lastIndex >= text.length) break







        regex.lastIndex++







      }







    }







    return matches







  } catch {







    return []







  }







})















// ── 加解密 ──







const cryptoMethod = ref('base64')







const cryptoPassword = ref('')







const cryptoInput = ref('')







const cryptoOutput = ref('')







const cryptoError = ref('')















// Simple Base64







function base64Encode(text: string): string {







  try { return btoa(unescape(encodeURIComponent(text))) } catch { return btoa(text) }







}







function base64Decode(text: string): string {







  try { return decodeURIComponent(escape(atob(text))) } catch { return atob(text) }







}















// Simple AES/DES using SubtleCrypto (uses PBKDF2 + AES-GCM as a reasonable substitute for DES)







async function aesEncrypt(text: string, password: string): Promise<string> {







  const enc = new TextEncoder()







  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])







  const key = await crypto.subtle.deriveKey(







    { name: 'PBKDF2', salt: enc.encode('office-salt'), iterations: 100000, hash: 'SHA-256' },







    keyMaterial,







    { name: 'AES-GCM', length: 256 },







    false,







    ['encrypt'],







  )







  const iv = crypto.getRandomValues(new Uint8Array(12))







  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text))







  const combined = new Uint8Array(iv.length + encrypted.byteLength)







  combined.set(iv)







  combined.set(new Uint8Array(encrypted), iv.length)







  return btoa(String.fromCharCode(...combined))







}















async function aesDecrypt(data: string, password: string): Promise<string> {







  const enc = new TextEncoder()







  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])







  const key = await crypto.subtle.deriveKey(







    { name: 'PBKDF2', salt: enc.encode('office-salt'), iterations: 100000, hash: 'SHA-256' },







    keyMaterial,







    { name: 'AES-GCM', length: 256 },







    false,







    ['decrypt'],







  )







  const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0))







  const iv = combined.slice(0, 12)







  const encrypted = combined.slice(12)







  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)







  return new TextDecoder().decode(decrypted)







}















async function encryptText(): Promise<void> {







  cryptoError.value = ''







  if (!cryptoInput.value) return







  try {







    if (cryptoMethod.value === 'base64') {







      cryptoOutput.value = base64Encode(cryptoInput.value)







    } else {







      if (!cryptoPassword.value) {







        cryptoError.value = t('tools.encryption.passwordRequired')







        return







      }







      cryptoOutput.value = await aesEncrypt(cryptoInput.value, cryptoPassword.value)







    }







  } catch (e: any) {







    cryptoError.value = e.message || t('tools.encryption.error')







  }







}















async function decryptText(): Promise<void> {







  cryptoError.value = ''







  if (!cryptoInput.value) return







  try {







    if (cryptoMethod.value === 'base64') {







      cryptoOutput.value = base64Decode(cryptoInput.value)







    } else {







      if (!cryptoPassword.value) {







        cryptoError.value = t('tools.encryption.passwordRequired')







        return







      }







      cryptoOutput.value = await aesDecrypt(cryptoInput.value, cryptoPassword.value)







    }







  } catch (e: any) {







    cryptoError.value = e.message || t('tools.encryption.error')







  }







}















function cryptoSwap(): void {







  const tmp = cryptoInput.value







  cryptoInput.value = cryptoOutput.value







  cryptoOutput.value = tmp







}















// ── 待办事项 ──







interface Todo {







  id: number







  text: string







  done: boolean







}















const TODOS_KEY = 'office_todos'







const todos = ref<Todo[]>([])







const todoNewText = ref('')







const todoFilter = ref<'all' | 'active' | 'done'>('all')







let todoNextId = 1















function todoLoad(): void {







  try {







    const raw = localStorage.getItem(TODOS_KEY)







    if (raw) {







      todos.value = JSON.parse(raw)







      const maxId = todos.value.reduce((max, t) => Math.max(max, t.id), 0)







      todoNextId = maxId + 1







    }







  } catch { /* ignore */ }







}















function todoSave(): void {







  localStorage.setItem(TODOS_KEY, JSON.stringify(todos.value))







}















function todoAdd(): void {







  const text = todoNewText.value.trim()







  if (!text) return







  todos.value.unshift({ id: todoNextId++, text, done: false })







  todoNewText.value = ''







  todoSave()







}















function todoRemove(id: number): void {







  todos.value = todos.value.filter(t => t.id !== id)







  todoSave()







}















function todoClearDone(): void {







  todos.value = todos.value.filter(t => !t.done)







  todoSave()







}















const todoStats = computed(() => {







  const total = todos.value.length







  const done = todos.value.filter(t => t.done).length







  return `${done}/${total}`







})















const filteredTodos = computed(() => {







  if (todoFilter.value === 'active') return todos.value.filter(t => !t.done)







  if (todoFilter.value === 'done') return todos.value.filter(t => t.done)







  return todos.value







})















// Load todos on init







todoLoad()















// ── 截图工具 ──





const screenshotHotkey = ref('Ctrl+Shift+X')





const screenshotHistory = ref<{ name: string; time: string; dataUrl: string }[]>([])





const screenshotDataUrl = ref<string | null>(null)





const isCapturing = ref(false)











async function startScreenshot(): Promise<void> {





  isCapturing.value = true





  try {





    const result = await window.electronAPI.screenshot.capture()





    if (result.success && result.data?.dataUrl) {





      const dataUrl = result.data.dataUrl





      screenshotDataUrl.value = dataUrl





      // Add to history





      const now = new Date()





      const timeStr = now.toLocaleTimeString()





      const name = `Screenshot ${now.toLocaleString()}`





      screenshotHistory.value.unshift({ name, time: timeStr, dataUrl })





      ElMessage.success(t('tools.screenshot.captured'))





    } else {





      ElMessage.error(result.error || t('tools.screenshot.failed'))





    }





  } catch (err) {





    ElMessage.error(String(err))





  } finally {





    isCapturing.value = false





  }





}











function copyScreenshot(): void {





  if (!screenshotDataUrl.value) return





  // Use clipboard API to copy the image





  const img = new Image()





  img.src = screenshotDataUrl.value





  img.onload = async () => {





    try {





      const canvas = document.createElement('canvas')





      canvas.width = img.width





      canvas.height = img.height





      const ctx = canvas.getContext('2d')





      if (!ctx) return





      ctx.drawImage(img, 0, 0)





      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))





      if (blob) {





        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])





        ElMessage.success(t('tools.screenshot.copied'))





      }





    } catch {





      // Fallback: copy data URL as text





      try {





        await navigator.clipboard.writeText(screenshotDataUrl.value)





        ElMessage.success(t('tools.clipboard.copied'))





      } catch {





        ElMessage.error(t('tools.clipboard.copyFailed'))





      }





    }





  }





}











async function saveScreenshot(): Promise<void> {



  if (!screenshotDataUrl.value) return



  try {



    const result = await window.electronAPI.screenshot.save(screenshotDataUrl.value)



    if (result.success) {



      ElMessage.success(t('tools.screenshot.saved'))



    } else if (result.error !== 'Save cancelled') {



      ElMessage.error(result.error || t('tools.screenshot.saveFailed'))



    }



  } catch (err) {



    ElMessage.error(String(err))



  }



}











// ── 语音转文字 ──
const isRecording = ref(false)
const voiceTranscript = ref('')
const voiceHistory = ref<{ text: string; time: string }[]>([])

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
let recognition: InstanceType<typeof SpeechRecognition> | null = null
const isRecognitionSupported = !!SpeechRecognitionAPI

function getSpeechLang(): string {
  const locale = (window as any).__i18n_locale__ || navigator.language || 'en-US'
  if (locale.startsWith('zh')) return 'zh-CN'
  if (locale.startsWith('ja')) return 'ja-JP'
  if (locale.startsWith('ko')) return 'ko-KR'
  if (locale.startsWith('fr')) return 'fr-FR'
  if (locale.startsWith('de')) return 'de-DE'
  if (locale.startsWith('es')) return 'es-ES'
  return 'en-US'
}

function initRecognition(): void {
  if (!isRecognitionSupported || recognition) return
  recognition = new SpeechRecognitionAPI()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = getSpeechLang()

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }
    if (interim) voiceTranscript.value = interim
    if (final) {
      voiceTranscript.value = final
      voiceHistory.value.unshift({
        text: final.trim(),
        time: new Date().toLocaleString(),
      })
      if (voiceHistory.value.length > 20) voiceHistory.value.pop()
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('[Voice] Recognition error:', event.error, event.message)
    if (event.error === 'not-allowed') {
      ElMessage.error(t('tools.voiceToText.micDenied'))
    } else if (event.error === 'no-speech' || event.error === 'aborted') {
      // Ignore
    } else {
      ElMessage.warning(t('tools.voiceToText.error'))
    }
    isRecording.value = false
  }

  recognition.onend = () => {
    if (isRecording.value && recognition) {
      try { recognition.start() } catch { /* already started */ }
    } else {
      isRecording.value = false
    }
  }
}

function toggleRecording(): void {
  if (!isRecognitionSupported) {
    ElMessage.warning(t('tools.voiceToText.notSupported'))
    return
  }
  initRecognition()
  if (!recognition) return

  if (isRecording.value) {
    isRecording.value = false
    recognition.stop()
    if (voiceTranscript.value.trim()) {
      voiceHistory.value.unshift({
        text: voiceTranscript.value.trim(),
        time: new Date().toLocaleString(),
      })
      if (voiceHistory.value.length > 20) voiceHistory.value.pop()
    }
  } else {
    voiceTranscript.value = ''
    try {
      recognition.start()
      isRecording.value = true
      ElMessage.info(t('tools.voiceToText.listening'))
    } catch (err: any) {
      console.error('[Voice] Start failed:', err)
      ElMessage.error(t('tools.voiceToText.error'))
    }
  }
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (recognition) {
    try { recognition.abort() } catch { /* ignore */ }
    recognition = null
  }
})</script>















<style scoped>







.tools-page {







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















.tools-grid {







  display: grid;







  grid-template-columns: repeat(2, 1fr);







  gap: 20px;







}















.tool-card-wide {







  grid-column: span 2;







}















.tool-card {







  border-radius: 8px;







  overflow: hidden;







}















.tool-card :deep(.el-card__header) {







  padding: 12px 16px;







  background: var(--bg-secondary, #f5f7fa);







  border-bottom: 1px solid var(--border-light, #ebeef5);







}















.card-header {







  display: flex;







  align-items: center;







  gap: 8px;







  font-weight: 600;







  font-size: 15px;







  color: var(--text-primary, #303133);







}















.card-header .el-icon {







  color: var(--el-color-primary, #409eff);







  font-size: 16px;







}















.subsection-title {







  margin: 12px 0 8px;







  font-size: 14px;







  font-weight: 600;







  color: var(--text-primary, #303133);







}















/* ── 剪贴板 ── */







.clipboard-actions {







  display: flex;







  gap: 8px;







  margin-bottom: 12px;







}















.clipboard-list {







  max-height: 280px;







  overflow-y: auto;







}















.clipboard-item {







  display: flex;







  align-items: center;







  justify-content: space-between;







  padding: 8px 10px;







  border-radius: 6px;







  background: var(--bg-secondary, #f5f7fa);







  margin-bottom: 6px;







  transition: background 0.15s;







}















.clipboard-item:hover {







  background: var(--border-light, #ebeef5);







}















.clipboard-text {







  flex: 1;







  max-width: 240px;







  overflow: hidden;







  text-overflow: ellipsis;







  white-space: nowrap;







  font-size: 13px;







  color: var(--text-primary, #303133);







}















/* ── 颜色选择器 ── */







.color-picker-section {







  display: flex;







  flex-direction: column;







  gap: 16px;







}















.color-display {







  display: flex;







  gap: 16px;







  align-items: center;







}















.color-swatch {







  width: 64px;







  height: 64px;







  border-radius: 8px;







  border: 2px solid var(--border-color, #e4e7ed);







  box-shadow: var(--box-shadow-medium, 0 2px 8px rgba(0, 0, 0, 0.1));







  flex-shrink: 0;







}















.color-values {







  flex: 1;







  display: flex;







  flex-direction: column;







  gap: 4px;







}















.color-row {







  display: flex;







  align-items: center;







  gap: 8px;







}















.color-label {







  width: 32px;







  font-size: 12px;







  font-weight: 600;







  color: var(--text-secondary, #606266);







}















.color-code {







  flex: 1;







  font-size: 13px;







  font-family: 'Cascadia Code', 'Fira Code', monospace;







  color: var(--text-primary, #303133);







  background: var(--bg-secondary, #f5f7fa);







  padding: 2px 6px;







  border-radius: 4px;







}















.color-picker-control {







  display: flex;







  align-items: center;







  gap: 12px;







}















.picker-hint {







  font-size: 13px;







  color: var(--text-secondary, #606266);







}















/* ── 字符统计 ── */







.char-counter-section {







  display: flex;







  flex-direction: column;







  gap: 16px;







}















.text-input :deep(textarea) {







  font-family: 'Cascadia Code', 'Fira Code', monospace;







  font-size: 14px;







  line-height: 1.6;







  resize: vertical;







}















.stats-grid {







  display: grid;







  grid-template-columns: repeat(4, 1fr);







  gap: 12px;







}















.stat-item {







  display: flex;







  flex-direction: column;







  align-items: center;







  padding: 12px 8px;







  background: var(--bg-secondary, #f5f7fa);







  border-radius: 8px;







  border: 1px solid var(--border-light, #ebeef5);







}















.stat-value {







  font-size: 22px;







  font-weight: 700;







  color: var(--el-color-primary, #409eff);







  line-height: 1.2;







}















.stat-label {







  font-size: 12px;







  color: var(--text-secondary, #606266);







  margin-top: 4px;







  text-align: center;







  white-space: nowrap;







}















/* ── 计算器 ── */







.calculator-section {







  display: flex;







  flex-direction: column;







  gap: 12px;







}















.calc-display {







  background: var(--bg-secondary, #f5f7fa);







  border-radius: 8px;







  padding: 16px;







  text-align: right;







  border: 1px solid var(--border-light, #ebeef5);







  min-height: 72px;







  display: flex;







  flex-direction: column;







  justify-content: flex-end;







}















.calc-expression {







  font-size: 18px;







  color: var(--text-secondary, #606266);







  word-break: break-all;







  min-height: 24px;







}















.calc-result {







  font-size: 28px;







  font-weight: 700;







  color: var(--text-primary, #303133);







  min-height: 36px;







}















.calc-buttons {







  display: grid;







  grid-template-columns: repeat(4, 1fr);







  gap: 6px;







}















.calc-btn {







  height: 44px;







  font-size: 16px;







  border-radius: 8px;







}















.calc-btn :deep(span) {







  font-weight: 600;







}















.calc-btn-zero {







  grid-column: span 2;







}















.calc-btn-op {







  --el-button-bg-color: var(--el-color-primary-light-9, #ecf5ff);







  --el-button-border-color: var(--el-color-primary-light-7, #d9ecff);







  --el-button-text-color: var(--el-color-primary, #409eff);







}















.calc-btn-fn {







  --el-button-bg-color: #f0f2f5;







  --el-button-text-color: var(--text-secondary, #606266);







}















.calc-btn-eq {







  --el-button-bg-color: var(--el-color-primary, #409eff);







  --el-button-border-color: var(--el-color-primary, #409eff);







  --el-button-text-color: #fff;







}















/* ── 正则测试器 ── */







.regex-section {







  display: flex;







  flex-direction: column;







  gap: 10px;







}















.regex-pattern-row {







  display: flex;







  align-items: center;







  gap: 4px;







}















.regex-delimiter {







  font-size: 18px;







  font-weight: 600;







  color: var(--el-color-primary, #409eff);







  font-family: monospace;







}















.regex-pattern-input {







  flex: 1;







}















.regex-test-input {







  margin-top: 4px;







}















.regex-highlight {







  padding: 10px;







  background: var(--bg-secondary, #f5f7fa);







  border-radius: 6px;







  border: 1px solid var(--border-light, #ebeef5);







  font-family: monospace;







  font-size: 14px;







  line-height: 1.6;







  word-break: break-all;







  max-height: 120px;







  overflow-y: auto;







}















.match-highlight {







  background: #ffe066;







  border-radius: 2px;







  padding: 0 1px;







  font-weight: 600;







}















.regex-matches {







  max-height: 140px;







  overflow-y: auto;







}















.regex-match-count {







  font-size: 13px;







  font-weight: 600;







  color: var(--el-color-success, #67c23a);







  margin-bottom: 6px;







}















.regex-match-item {







  padding: 4px 8px;







  background: var(--bg-secondary, #f5f7fa);







  border-radius: 4px;







  margin-bottom: 4px;







  font-size: 13px;







}















.regex-match-item code {







  color: var(--el-color-primary, #409eff);







}















.regex-no-match {







  font-size: 13px;







  color: var(--text-secondary, #909399);







  text-align: center;







  padding: 8px;







}















/* ── 加解密 ── */







.encryption-section {







  display: flex;







  flex-direction: column;







  gap: 12px;







}















.encryption-controls {







  display: flex;







  align-items: center;







  gap: 8px;







  flex-wrap: wrap;







}















.encryption-io {







  display: flex;







  align-items: center;







  gap: 10px;







}















.encryption-arrow {







  font-size: 20px;







  color: var(--el-color-primary, #409eff);







  flex-shrink: 0;







}















.encryption-error {







  color: var(--el-color-danger, #f56c6c);







  font-size: 13px;







}















/* ── 待办事项 ── */







.todo-section {







  display: flex;







  flex-direction: column;







  gap: 10px;







}















.todo-count {







  margin-left: auto;







  font-size: 13px;







  color: var(--text-secondary, #909399);







  font-weight: 400;







}















.todo-input-row {







  display: flex;







  gap: 6px;







}















.todo-filters {







  display: flex;







  align-items: center;







  justify-content: space-between;







  flex-wrap: wrap;







  gap: 6px;







}















.todo-list {







  max-height: 280px;







  overflow-y: auto;







}















.todo-item {







  display: flex;







  align-items: center;







  gap: 8px;







  padding: 8px 6px;







  border-radius: 6px;







  transition: background 0.15s;







}















.todo-item:hover {







  background: var(--bg-secondary, #f5f7fa);







}















.todo-text {







  flex: 1;







  font-size: 14px;







  color: var(--text-primary, #303133);







}















.todo-done .todo-text {







  text-decoration: line-through;







  color: var(--text-secondary, #909399);







}















/* ── 截图 ── */







.screenshot-section {







  display: flex;







  flex-direction: column;







  align-items: center;







  gap: 12px;







}















.screenshot-hint {







  display: flex;







  align-items: center;







  gap: 10px;







  color: var(--text-secondary, #606266);







  font-size: 14px;







}















.screenshot-hotkey {







  display: flex;







  align-items: center;







  gap: 8px;







}















.hotkey-label {




  font-size: 13px;




  color: var(--text-secondary, #909399);




}









.screenshot-preview {




  width: 100%;




  display: flex;




  flex-direction: column;




  align-items: center;




  gap: 10px;




}









.screenshot-image {




  width: 100%;




  max-height: 200px;




  object-fit: contain;




  border-radius: 6px;




  border: 1px solid var(--border-color, #dcdfe6);




}









.screenshot-actions {




  display: flex;




  gap: 8px;




}









.screenshot-history {




  width: 100%;







  max-height: 160px;







  overflow-y: auto;







}















.screenshot-item {







  display: flex;







  align-items: center;







  gap: 8px;







  padding: 6px 8px;







  font-size: 13px;







  border-radius: 4px;







}















.screenshot-item:hover {







  background: var(--bg-secondary, #f5f7fa);







}















.screenshot-time {







  margin-left: auto;







  color: var(--text-secondary, #909399);







  font-size: 12px;







}















/* ── 语音转文字 ── */







.vtt-section {







  display: flex;







  flex-direction: column;







  gap: 12px;







}















.vtt-record-area {







  display: flex;







  align-items: center;







  gap: 16px;







}















.vtt-status {







  font-size: 14px;







  color: var(--text-secondary, #606266);







}















.recording-indicator {







  display: flex;







  align-items: center;







  gap: 6px;







  color: var(--el-color-danger, #f56c6c);







  font-weight: 600;







}















.recording-dot {







  width: 10px;







  height: 10px;







  border-radius: 50%;







  background: var(--el-color-danger, #f56c6c);







  animation: pulse-dot 1s infinite;







}















@keyframes pulse-dot {







  0%, 100% { opacity: 1; }







  50% { opacity: 0.3; }







}















.vtt-visualization {







  display: flex;







  align-items: flex-end;







  gap: 3px;







  height: 40px;







  justify-content: center;







}















.audio-bar {







  width: 8px;







  background: var(--el-color-primary, #409eff);







  border-radius: 4px;







  animation: audio-wave 0.6s infinite alternate;







}















@keyframes audio-wave {







  from { height: 8px; }







  to { height: 36px; }







}















.vtt-history {







  max-height: 160px;







  overflow-y: auto;







}















.vtt-history-item {







  display: flex;







  align-items: center;







  gap: 8px;







  padding: 6px 8px;







  font-size: 13px;







  border-radius: 4px;







}















.vtt-history-item:hover {







  background: var(--bg-secondary, #f5f7fa);







}















.vtt-history-time {







  font-size: 12px;







  color: var(--text-secondary, #909399);







  white-space: nowrap;







}















.vtt-history-text {







  flex: 1;







  color: var(--text-primary, #303133);







  overflow: hidden;







  text-overflow: ellipsis;







  white-space: nowrap;







}















/* ── Responsive ── */







@media (max-width: 900px) {







  .tools-grid {







    grid-template-columns: 1fr;







  }















  .tool-card-wide {







    grid-column: span 1;







  }















  .stats-grid {







    grid-template-columns: repeat(3, 1fr);







  }















  .color-display {







    flex-direction: column;







    align-items: flex-start;







  }















  .encryption-io {







    flex-direction: column;







    align-items: stretch;







  }















  .encryption-arrow {







    transform: rotate(90deg);







    align-self: center;







  }







}







</style>







