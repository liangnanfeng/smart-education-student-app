import { MessageCircle, Send, ShieldCheck, X } from 'lucide-react'
import { useCallback, useLayoutEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppState } from '../../app/AppState'
import { getCompanionItem } from './companionCatalog'
import { PartnerAppearance } from './PartnerAppearance'

type LoginCompanionProps = {
  onBoundsChange: (rect: DOMRect) => void
}

export const LOGIN_COMPANION_HANDOFF_KEY = 'student-app-login-companion-bounds'

const WELCOME_COPY = {
  elementary: '嗨！今天想先去哪里冒险？',
  secondary: '你好，要从一个问题开始探索吗？',
} as const

const GUEST_REPLY = {
  elementary: '我可以先陪你聊一个安全的小问题。登录后，我还能记住你的学习安排和进度。',
  secondary: '这是未登录体验。我可以做简单科普问答；登录后再使用学习建议、记录与应用控制。',
} as const

export function LoginCompanion({ onBoundsChange }: LoginCompanionProps) {
  const { state } = useAppState()
  const loadout = state.companions[state.stage]
  const appearance = getCompanionItem(loadout.equipped.appearance)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)
  const [message, setMessage] = useState('')
  const [isInteracting, setIsInteracting] = useState(false)
  const [guestChatOpen, setGuestChatOpen] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [guestReply, setGuestReply] = useState('长按伙伴，就可以先和我简单聊聊。')

  const measure = useCallback(() => {
    if (buttonRef.current) onBoundsChange(buttonRef.current.getBoundingClientRect())
  }, [onBoundsChange])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, state.stage, loadout.equipped.appearance, loadout.equipped.outfit, loadout.equipped.decoration])

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setIsInteracting(false)
  }

  const startLongPress = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    longPressTriggeredRef.current = false
    setIsInteracting(true)
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      setGuestChatOpen(true)
      setIsInteracting(false)
    }, 600)
  }

  const handleShortInteraction = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }
    setMessage(WELCOME_COPY[state.stage])
    setIsInteracting(true)
    window.setTimeout(() => setIsInteracting(false), 420)
  }

  const sendGuestMessage = (event: FormEvent) => {
    event.preventDefault()
    if (!guestInput.trim()) return
    setGuestReply(GUEST_REPLY[state.stage])
    setGuestInput('')
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
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerLeave={clearLongPress}
      >
        <PartnerAppearance stage={state.stage} loadout={loadout} size="login" interactive />
      </button>
      <p className="login-companion__hint"><MessageCircle aria-hidden="true" size={13} />轻点打招呼 · 长按聊一聊</p>

      {guestChatOpen && (
        <div className="login-companion__dialog-backdrop">
          <section className="login-companion__dialog" role="dialog" aria-modal="true" aria-label="未登录体验">
            <button className="login-companion__close" type="button" aria-label="关闭未登录体验" onClick={() => setGuestChatOpen(false)}>
              <X aria-hidden="true" size={18} />
            </button>
            <div className="login-companion__dialog-title">
              <PartnerAppearance stage={state.stage} loadout={loadout} size="floating" />
              <span><small>AI 伙伴</small><strong>未登录体验</strong></span>
            </div>
            <p className="login-companion__privacy"><ShieldCheck aria-hidden="true" size={15} />不会读取账号资料、保存聊天记录或控制应用</p>
            <div className="login-companion__message" aria-live="polite">{guestReply}</div>
            <form className="login-companion__form" onSubmit={sendGuestMessage}>
              <label className="login-companion__visually-hidden" htmlFor="guest-companion-message">想问 AI 伙伴的问题</label>
              <input
                id="guest-companion-message"
                value={guestInput}
                onChange={(event) => setGuestInput(event.target.value)}
                placeholder={state.stage === 'elementary' ? '例如：彩虹是怎么来的？' : '例如：什么是生成式 AI？'}
              />
              <button type="submit" aria-label="发送体验消息"><Send aria-hidden="true" size={16} /></button>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
