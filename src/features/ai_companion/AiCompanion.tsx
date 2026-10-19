import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppState } from '../../app/AppState'
import { AiPanel } from './AiPanel'
import { startSpeechCapture, speakCompanionReply, type SpeechCapture } from './browserSpeech'
import { requestCompanionReply } from './companionChat'
import { getCompanionItem } from './companionCatalog'
import { LOGIN_COMPANION_HANDOFF_KEY } from './LoginCompanion'
import { PartnerAppearance } from './PartnerAppearance'
import './ai-companion.css'

const LONG_PRESS_MS = 600
const HANDOFF_DURATION_MS = 720
const COMPANION_HALF_SIZE = 39
const COMPANION_EDGE_GAP = 8
const BOTTOM_NAV_SAFE_SPACE = 87
const MAP_ROUTE_DURATION_MS = 820

type MapTarget = {
  id: string
  x: number
  y: number
}

type AiCompanionProps = {
  placement?: 'floating' | 'test-map'
  mapTarget?: MapTarget
}

type AppFrameBounds = {
  left: number
  top: number
  width: number
  height: number
}

type HandoffRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

type HandoffRecord = {
  version: 2
  appearanceId: string
  rect: HandoffRect
}

type ActiveHandoff = {
  start: HandoffRect
  end: HandoffRect
}

function hasValidRect(rect: unknown): rect is HandoffRect {
  if (!rect || typeof rect !== 'object') return false
  const candidate = rect as Partial<HandoffRect>
  return ['left', 'top', 'right', 'bottom', 'width', 'height'].every((key) => Number.isFinite(candidate[key as keyof HandoffRect]))
    && Number(candidate.width) > 0
    && Number(candidate.height) > 0
}

function readHandoffRecord(): HandoffRecord | null {
  const raw = sessionStorage.getItem(LOGIN_COMPANION_HANDOFF_KEY)
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<HandoffRecord> | null
    if (!value || value.version !== 2 || typeof value.appearanceId !== 'string' || getCompanionItem(value.appearanceId)?.category !== 'appearance' || !hasValidRect(value.rect)) {
      return null
    }
    return value as HandoffRecord
  } catch {
    return null
  }
}

function toHandoffRect(rect: DOMRect): HandoffRect {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

function getAppFrameBounds(): AppFrameBounds | null {
  const frame = document.querySelector<HTMLElement>('.app-frame')
  if (!frame) return null
  const rect = frame.getBoundingClientRect()
  const visibleLeft = Math.max(0, rect.left)
  const visibleTop = Math.max(0, rect.top)
  const visibleRight = Math.min(window.innerWidth, rect.right)
  const visibleBottom = Math.min(window.innerHeight, rect.bottom)
  const visibleWidth = visibleRight - visibleLeft
  const visibleHeight = visibleBottom - visibleTop
  if (visibleWidth <= 0 || visibleHeight <= 0) return null
  return { left: visibleLeft, top: visibleTop, width: visibleWidth, height: visibleHeight }
}

function keepPositionInsideFrame(position: { x: number; y: number }, bounds: AppFrameBounds) {
  const horizontalInset = Math.min(COMPANION_HALF_SIZE + COMPANION_EDGE_GAP, bounds.width / 2)
  const minimumX = horizontalInset / bounds.width
  const maximumX = 1 - minimumX
  const minimumY = Math.min(.12, (COMPANION_HALF_SIZE + COMPANION_EDGE_GAP) / bounds.height)
  const maximumY = Math.max(minimumY, 1 - (BOTTOM_NAV_SAFE_SPACE + COMPANION_HALF_SIZE) / bounds.height)
  return {
    x: Math.min(maximumX, Math.max(minimumX, position.x)),
    y: Math.min(maximumY, Math.max(minimumY, position.y)),
  }
}

export function AiCompanion({ placement = 'floating', mapTarget }: AiCompanionProps) {
  const { state, setAiPosition } = useAppState()
  const [open, setOpen] = useState(false)
  const [dragPosition, setDragPosition] = useState(state.aiPosition)
  const [handoff, setHandoff] = useState<ActiveHandoff | null>(null)
  const [handoffStatus, setHandoffStatus] = useState<'running' | 'complete'>('complete')
  const [voiceMessage, setVoiceMessage] = useState('')
  const [routeMoving, setRouteMoving] = useState(false)
  const [appFrameBounds, setAppFrameBounds] = useState<AppFrameBounds | null>(null)
  const controlRef = useRef<HTMLButtonElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffStartedRef = useRef(false)
  const voiceCaptureRef = useRef<SpeechCapture | null>(null)
  const routeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousMapTargetRef = useRef(mapTarget?.id)
  const startRef = useRef({ x: 0, y: 0 })
  const pendingPositionRef = useRef(dragPosition)
  const movedRef = useRef(false)
  const longPressedRef = useRef(false)
  const loadout = state.companion

  const measureAppFrame = useCallback(() => {
    setAppFrameBounds(getAppFrameBounds())
  }, [])

  useLayoutEffect(() => {
    if (placement === 'test-map') return
    measureAppFrame()
    window.addEventListener('resize', measureAppFrame)
    window.addEventListener('scroll', measureAppFrame, true)
    return () => {
      window.removeEventListener('resize', measureAppFrame)
      window.removeEventListener('scroll', measureAppFrame, true)
    }
  }, [measureAppFrame, placement])

  useLayoutEffect(() => {
    if (placement === 'test-map') {
      handoffStartedRef.current = true
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }
    if (handoffStartedRef.current) return
    const record = readHandoffRecord()
    if (!record) {
      handoffStartedRef.current = true
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducedMotion || record.appearanceId !== loadout.equipped.appearance) {
      handoffStartedRef.current = true
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }
    if (!appFrameBounds) return

    handoffStartedRef.current = true
    const targetRect = controlRef.current?.getBoundingClientRect()
    if (!targetRect || targetRect.width <= 0 || targetRect.height <= 0) {
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }

    const end = toHandoffRect(targetRect)
    const startLeft = record.rect.left + (record.rect.width - end.width) / 2
    const startTop = record.rect.top + (record.rect.height - end.height) / 2
    const start = {
      left: startLeft,
      top: startTop,
      right: startLeft + end.width,
      bottom: startTop + end.height,
      width: end.width,
      height: end.height,
    }
    setHandoff({ start, end })
    setHandoffStatus('running')
    handoffTimerRef.current = window.setTimeout(() => {
      setHandoffStatus('complete')
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
    }, HANDOFF_DURATION_MS)

  }, [appFrameBounds, placement, loadout.equipped.appearance])

  useEffect(() => {
    const previousId = previousMapTargetRef.current
    previousMapTargetRef.current = mapTarget?.id
    if (placement !== 'test-map' || !previousId || !mapTarget?.id || previousId === mapTarget.id) return

    setRouteMoving(true)
    if (routeTimerRef.current) window.clearTimeout(routeTimerRef.current)
    routeTimerRef.current = window.setTimeout(() => setRouteMoving(false), MAP_ROUTE_DURATION_MS)
    return () => {
      if (routeTimerRef.current) window.clearTimeout(routeTimerRef.current)
    }
  }, [mapTarget?.id, placement])

  useEffect(() => () => {
    voiceCaptureRef.current?.cancel()
    if (handoffTimerRef.current) window.clearTimeout(handoffTimerRef.current)
    if (routeTimerRef.current) window.clearTimeout(routeTimerRef.current)
  }, [])

  const answerVoiceQuestion = useCallback(async (question: string) => {
    if (!question) {
      setVoiceMessage('我没有听清，可以再说一遍吗？')
      return
    }

    setVoiceMessage('我想一想，马上回答你。')
    try {
      const reply = await requestCompanionReply({
        companionId: loadout.equipped.appearance ?? 'unknown',
        question,
      })
      setVoiceMessage(reply)
      speakCompanionReply(reply, state.voiceEnabled)
    } catch {
      setVoiceMessage('伙伴暂时没听清，我们换个简单的问题试试。')
    }
  }, [loadout.equipped.appearance, state.voiceEnabled])

  const startVoiceQuestion = useCallback(() => {
    voiceCaptureRef.current?.cancel()
    setVoiceMessage('请说，我在听。')
    voiceCaptureRef.current = startSpeechCapture({
      onComplete: (question) => {
        voiceCaptureRef.current = null
        void answerVoiceQuestion(question)
      },
      onError: () => {
        voiceCaptureRef.current = null
        setVoiceMessage('这次没有听清，可以再试一次。')
      },
    })
    if (!voiceCaptureRef.current) setVoiceMessage('请在支持语音识别的浏览器中使用长按语音。')
  }, [answerVoiceQuestion])

  function pointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Dragging and long-press remain usable in WebViews without pointer capture.
    }
    startRef.current = { x: event.clientX, y: event.clientY }
    movedRef.current = false
    longPressedRef.current = false
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) {
        longPressedRef.current = true
        startVoiceQuestion()
      }
    }, LONG_PRESS_MS)
  }

  function pointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const dx = event.clientX - startRef.current.x
    const dy = event.clientY - startRef.current.y
    if (Math.hypot(dx, dy) < 8) return
    movedRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    if (placement === 'test-map') return
    const bounds = appFrameBounds ?? getAppFrameBounds()
    if (!bounds) return
    const nextPosition = keepPositionInsideFrame({
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    }, bounds)
    pendingPositionRef.current = nextPosition
    setDragPosition(nextPosition)
  }

  function pointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (longPressedRef.current) voiceCaptureRef.current?.stop()
    if (movedRef.current && placement === 'floating') {
      const currentPosition = pendingPositionRef.current
      const bounds = appFrameBounds ?? getAppFrameBounds()
      const snapped = bounds
        ? keepPositionInsideFrame({ ...currentPosition, x: currentPosition.x < .5 ? 0 : 1 }, bounds)
        : currentPosition
      setDragPosition(snapped)
      setAiPosition(snapped)
    }
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Ignore incomplete pointer capture implementations.
    }
  }

  function click() {
    if (longPressedRef.current || movedRef.current) return
    setOpen(true)
  }

  const safePosition = appFrameBounds ? keepPositionInsideFrame(dragPosition, appFrameBounds) : null
  const floatingPositionStyle = safePosition && appFrameBounds ? {
    left: `${appFrameBounds.left + safePosition.x * appFrameBounds.width}px`,
    top: `${appFrameBounds.top + safePosition.y * appFrameBounds.height}px`,
  } as CSSProperties : {
    left: '88vw',
    top: '78vh',
  } as CSSProperties
  const positionStyle = placement === 'test-map' && mapTarget ? {
    left: `${mapTarget.x}%`,
    bottom: `${mapTarget.y}%`,
  } as CSSProperties : floatingPositionStyle
  const isOnRightSide = placement === 'test-map' ? (mapTarget?.x ?? 50) > 50 : dragPosition.x > .5

  const handoffStyle = handoff ? {
    '--handoff-x': `${handoff.end.left - handoff.start.left}px`,
    '--handoff-y': `${handoff.end.top - handoff.start.top}px`,
    '--handoff-soft-x': `${(handoff.end.left - handoff.start.left) * .12}px`,
    '--handoff-soft-y': `${(handoff.end.top - handoff.start.top) * .12 + 4}px`,
    '--handoff-curve-x': `${(handoff.end.left - handoff.start.left) * .55}px`,
    '--handoff-curve-y': `${(handoff.end.top - handoff.start.top) * .55 - 10}px`,
    '--handoff-near-x': `${(handoff.end.left - handoff.start.left) * .86}px`,
    '--handoff-near-y': `${(handoff.end.top - handoff.start.top) * .86 + 2}px`,
    left: `${handoff.start.left}px`,
    top: `${handoff.start.top}px`,
    width: `${handoff.start.width}px`,
    height: `${handoff.start.height}px`,
  } as CSSProperties : undefined

  return (
    <>
      <button
        ref={controlRef}
        className={`ai-companion-control ai-companion-control--${placement} ${isOnRightSide ? 'is-on-right-side' : 'is-on-left-side'} ${routeMoving ? 'is-route-moving' : ''} ${handoffStatus === 'running' ? 'is-handoff-target' : ''}`}
        type="button"
        aria-label="AI伙伴"
        data-companion-placement={placement}
        data-map-node-id={mapTarget?.id}
        style={positionStyle}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onContextMenu={(event) => event.preventDefault()}
        onClick={click}
      >
        <PartnerAppearance loadout={loadout} size="floating" motion={routeMoving ? 'run' : 'idle'} interactive />
        {voiceMessage && <span className="ai-companion__bubble" role="status">{voiceMessage}</span>}
      </button>

      {placement === 'floating' && handoff && (
        <div
          className="companion-handoff"
          data-testid="companion-handoff"
          data-handoff-status={handoffStatus}
          data-handoff-motion="glide"
          style={handoffStyle}
          aria-hidden="true"
        >
          <PartnerAppearance loadout={loadout} size="floating" />
        </div>
      )}

      {open && <AiPanel onClose={() => setOpen(false)} />}
    </>
  )
}
