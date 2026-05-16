import re

with open('src/renderer/modules/tools/views/ToolsPage.vue', 'r', encoding='utf-8') as f:
    content = f.read()

old_start = content.find('// ── 语音转文字 ──')
old_end = content.find('</script>', old_start)

new_code = '''// ── 语音转文字 ──
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
})'''

content = content[:old_start] + new_code + content[old_end:]
with open('src/renderer/modules/tools/views/ToolsPage.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print('OK')
