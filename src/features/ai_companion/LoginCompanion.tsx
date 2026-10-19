import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppState } from '../../app/AppState'
import { startSpeechCapture, speakCompanionReply, type SpeechCapture } from './browserSpeech'
import { requestCompanionReply } from './companionChat'
import { getCompanionItem } from './companionCatalog'
import { PartnerAppearance } from './PartnerAppearance'

type LoginCompanionProps = {
  onBoundsChange: (rect: DOMRect) => void
}

export const LOGIN_COMPANION_HANDOFF_KEY = 'student-app-login-companion-bounds'

const WELCOME_COPY = '嗨！今天想先去哪里冒险？'

export function LoginCompanion({ onBoundsChange }: LoginCompanionProps) {
  const { state } = useAppState()
  const loadout = state.companion
  const appearance = getCompanionItem(loadout.equipped.appearance)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const voiceCaptureRef = useRef<SpeechCapture | null>(null)
  const longPressTriggeredRef = useRef(false)
  const [message, setMessage] = useState('')
  const [isInteracting, setIsInteracting] = useState(false)

  const measure = useCallback(() => {
    if (buttonRef.current) onBoundsChange(buttonRef.current.getBoundingClientRect())
  }, [onBoundsChange])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, loadout.equipped.appearance, loadout.equipped.outfit, loadout.equipped.decoration])

  useEffect(() => () => {
    voiceCaptureRef.current?.cancel()
  }, [])

  const answerVoiceQuestion = useCallback(async (question: string) => {
    if (!question) {
      setMessage('我没有听清，可以再说一遍吗？')
      return
    }

    setMessage('我想一想，马上回答你。')
    try {
      const reply = await requestCompanionReply({
        companionId: loadout.equipped.appearance ?? 'unknown',
        question,
      })
      setMessage(reply)
      speakCompanionReply(reply, state.voiceEnabled)
    } catch {
      setMessage('伙伴暂时没听清，我们换个简单的问题试试。')
    }
  }, [loadout.equipped.appearance, state.voiceEnabled])

  const startVoiceQuestion = useCallback(() => {
    voiceCaptureRef.current?.cancel()
    setMessage('请说，我在听。')
    voiceCaptureRef.current = startSpeechCapture({
      onComplete: (question) => {
        voiceCaptureRef.current = null
        void answerVoiceQuestion(question)
      },
      onError: () => {
        voiceCaptureRef.current = null
        setMessage('这次没有听清，可以再试一次。')
      },
    })

    if (!voiceCaptureRef.current) setMessage('请在支持语音识别的浏览器中使用长按语音。')
  }, [answerVoiceQuestion])

  const finishLongPress = (event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setIsInteracting(false)
    if (longPressTriggeredRef.current) {
      if (cancelled) voiceCaptureRef.current?.cancel()
      else voiceCaptureRef.current?.stop()
    }
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Older mobile WebViews may expose pointer APIs without fully implementing capture.
    }
  }

  const startLongPress = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // The long-press still works when pointer capture is unavailable.
    }
    longPressTriggeredRef.current = false
    setIsInteracting(true)
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      setIsInteracting(false)
      startVoiceQuestion()
    }, 600)
  }

  const handleShortInteraction = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }
    setMessage(WELCOME_COPY)
    setIsInteracting(true)
    window.setTimeout(() => setIsInteracting(false), 420)
  }

  return (
    <section className="login-companion" aria-label="登录页 AI 伙伴">
      {message && <p className="login-companion__bubble" role="status">{message}</p>}
      <button
        ref={buttonRef}
        className={`login-companion__target ${isInteracting ? 'is-interacting' : ''}`}
        type="button"
        aria-label={`和${appearance?.name ?? 'AI 伙伴'}互动`}
        onClick={handleShortInteraction}
        onPointerDown={startLongPress}
        onPointerUp={(event) => finishLongPress(event)}
        onPointerCancel={(event) => finishLongPress(event, true)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="login-companion__frame" data-testid="login-companion-frame">
          <PartnerAppearance loadout={loadout} size="login" />
        </span>
      </button>
      <p className="login-companion__hint"><MessageCircle aria-hidden="true" size={13} />轻点打招呼 · 长按直接说话</p>
    </section>
  )
}
