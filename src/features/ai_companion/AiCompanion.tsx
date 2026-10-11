import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useAppState } from '../../app/AppState'
import { AiPanel } from './AiPanel'
import { LOGIN_COMPANION_HANDOFF_KEY } from './LoginCompanion'
import { PartnerAppearance } from './PartnerAppearance'
import './ai-companion.css'

const LONG_PRESS_MS = 600
const HANDOFF_DURATION_MS = 780

type HandoffRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

type HandoffRecord = {
  version: 1
  stage: 'elementary' | 'secondary'
  appearanceId: string
  outfitId: string | null
  decorationId: string | null
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
    const value = JSON.parse(raw) as Partial<HandoffRecord>
    if (value.version !== 1 || (value.stage !== 'elementary' && value.stage !== 'secondary') || !value.appearanceId || !hasValidRect(value.rect)) {
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

export function AiCompanion() {
  const { state, setAiPosition } = useAppState()
  const [open, setOpen] = useState(false)
  const [dragPosition, setDragPosition] = useState(state.aiPositions[state.stage])
  const [handoff, setHandoff] = useState<ActiveHandoff | null>(null)
  const [handoffStatus, setHandoffStatus] = useState<'running' | 'complete'>('complete')
  const controlRef = useRef<HTMLButtonElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const longPressedRef = useRef(false)
  const loadout = state.companions[state.stage]

  useLayoutEffect(() => {
    const record = readHandoffRecord()
    if (!record) {
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const targetRect = controlRef.current?.getBoundingClientRect()
    if (reducedMotion || record.stage !== state.stage || !targetRect || targetRect.width <= 0 || targetRect.height <= 0) {
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
      return
    }

    setHandoff({ start: record.rect, end: toHandoffRect(targetRect) })
    setHandoffStatus('running')
    handoffTimerRef.current = window.setTimeout(() => {
      setHandoffStatus('complete')
      sessionStorage.removeItem(LOGIN_COMPANION_HANDOFF_KEY)
    }, HANDOFF_DURATION_MS)

    return () => {
      if (handoffTimerRef.current) window.clearTimeout(handoffTimerRef.current)
    }
  }, [state.stage])

  function pointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    startRef.current = { x: event.clientX, y: event.clientY }
    movedRef.current = false
    longPressedRef.current = false
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) {
        longPressedRef.current = true
        setOpen(true)
      }
    }, LONG_PRESS_MS)
  }

  function pointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const dx = event.clientX - startRef.current.x
    const dy = event.clientY - startRef.current.y
    if (Math.hypot(dx, dy) < 8) return
    movedRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    const width = Math.max(window.innerWidth, 320)
    const height = Math.max(window.innerHeight, 568)
    setDragPosition({ x: Math.min(.92, Math.max(.08, event.clientX / width)), y: Math.min(.78, Math.max(.12, event.clientY / height)) })
  }

  function pointerUp() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (movedRef.current) {
      const snapped = { ...dragPosition, x: dragPosition.x < .5 ? .08 : .92 }
      setDragPosition(snapped)
      setAiPosition(snapped)
    }
  }

  function click() {
    if (longPressedRef.current || movedRef.current) return
    setOpen(true)
  }

  const positionStyle = {
    '--ai-x': `${dragPosition.x * 100}%`,
    '--ai-y': `${dragPosition.y * 100}%`,
  } as CSSProperties

  const handoffStyle = handoff ? {
    left: `${handoff.start.left}px`,
    top: `${handoff.start.top}px`,
    width: `${handoff.start.width}px`,
    height: `${handoff.start.height}px`,
    '--handoff-x': `${handoff.end.left - handoff.start.left}px`,
    '--handoff-y': `${handoff.end.top - handoff.start.top}px`,
    '--handoff-mid-x': `${(handoff.end.left - handoff.start.left) * .48}px`,
    '--handoff-mid-y': `${(handoff.end.top - handoff.start.top) * .48 - 38}px`,
    '--handoff-scale': `${handoff.end.width / handoff.start.width}`,
    '--handoff-mid-scale': `${Math.max(.72, (1 + handoff.end.width / handoff.start.width) / 2)}`,
  } as CSSProperties : undefined

  return (
    <>
      <button
        ref={controlRef}
        className={`ai-companion-control ${handoffStatus === 'running' ? 'is-handoff-target' : ''}`}
        type="button"
        aria-label="AI伙伴"
        style={positionStyle}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onClick={click}
      >
        <PartnerAppearance stage={state.stage} loadout={loadout} size="floating" interactive />
      </button>

      {handoff && (
        <div
          className="companion-handoff"
          data-testid="companion-handoff"
          data-handoff-status={handoffStatus}
          style={handoffStyle}
          aria-hidden="true"
        >
          <PartnerAppearance stage={state.stage} loadout={loadout} size="login" />
        </div>
      )}

      {open && <AiPanel onClose={() => setOpen(false)} />}
    </>
  )
}
