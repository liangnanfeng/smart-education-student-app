type RecognitionResultItem = {
  0?: { transcript?: string }
  isFinal?: boolean
}

type RecognitionEventLike = {
  resultIndex?: number
  results?: ArrayLike<RecognitionResultItem>
}

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type RecognitionConstructor = new () => RecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
}

type SpeechCaptureCallbacks = {
  onComplete: (transcript: string) => void
  onError: () => void
}

export type SpeechCapture = {
  stop: () => void
  cancel: () => void
}

export function startSpeechCapture({ onComplete, onError }: SpeechCaptureCallbacks): SpeechCapture | null {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
  if (!Recognition) return null

  const recognition = new Recognition()
  let transcript = ''
  let finished = false

  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.onresult = (event) => {
    const start = event.resultIndex ?? 0
    const results = event.results ?? []
    for (let index = start; index < results.length; index += 1) {
      const result = results[index]
      if (result?.isFinal) transcript += result[0]?.transcript ?? ''
    }
  }
  recognition.onerror = () => {
    if (finished) return
    finished = true
    onError()
  }
  recognition.onend = () => {
    if (finished) return
    finished = true
    onComplete(transcript.trim())
  }

  try {
    recognition.start()
  } catch {
    return null
  }

  return {
    stop: () => recognition.stop(),
    cancel: () => {
      finished = true
      recognition.abort()
    },
  }
}

export function speakCompanionReply(text: string, enabled: boolean) {
  if (!enabled || typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance === 'undefined') return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = .96
  utterance.pitch = 1
  window.speechSynthesis.speak(utterance)
}
