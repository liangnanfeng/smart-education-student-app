import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { defaultState } from '../../app/model'
import { LoginCompanion } from '../ai_companion/LoginCompanion'

const STORAGE_KEY = 'student-app-state'

function renderCompanion(stage: 'elementary' | 'secondary' = 'elementary') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultState, stage }))
  const onBoundsChange = vi.fn()
  render(
    <AppStateProvider>
      <LoginCompanion onBoundsChange={onBoundsChange} />
    </AppStateProvider>,
  )
  return { onBoundsChange }
}

describe('login companion', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the equipped companion for the selected learning stage', () => {
    renderCompanion('elementary')

    expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '和绒桃 Momo互动' })).toBeInTheDocument()
  })

  it('places the companion inside a compact circular login frame', () => {
    renderCompanion('elementary')

    const frame = screen.getByTestId('login-companion-frame')
    expect(frame).toContainElement(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' }))
  })

  it('responds with a stage-specific welcome on a short tap', async () => {
    const user = userEvent.setup()
    renderCompanion('secondary')

    await user.click(screen.getByRole('button', { name: '和云宝 Nimbo互动' }))

    expect(screen.getByRole('status')).toHaveTextContent('要从一个问题开始探索吗')
  })

  it('starts voice listening beside the companion after a 600ms long press', () => {
    vi.useFakeTimers()
    const recognition = {
      lang: '',
      continuous: false,
      interimResults: false,
      maxAlternatives: 0,
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
    }
    const SpeechRecognitionMock = function () { return recognition } as unknown as new () => typeof recognition
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SpeechRecognitionMock })
    renderCompanion()
    const button = screen.getByRole('button', { name: '和绒桃 Momo互动' })

    fireEvent.pointerDown(button)
    act(() => vi.advanceTimersByTime(650))

    expect(screen.queryByRole('dialog', { name: '语音聊天体验' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('请说，我在听')
    expect(recognition.start).toHaveBeenCalledTimes(1)
  })

  it('keeps listening when a held finger drifts outside the companion before the threshold', () => {
    vi.useFakeTimers()
    const recognition = {
      lang: '', continuous: false, interimResults: false, maxAlternatives: 0,
      onresult: null, onerror: null, onend: null,
      start: vi.fn(), stop: vi.fn(), abort: vi.fn(),
    }
    const SpeechRecognitionMock = function () { return recognition } as unknown as new () => typeof recognition
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SpeechRecognitionMock })
    renderCompanion()
    const button = screen.getByRole('button', { name: '和绒桃 Momo互动' })

    fireEvent.pointerDown(button, { pointerId: 7, button: 0 })
    fireEvent.pointerLeave(button, { pointerId: 7 })
    act(() => vi.advanceTimersByTime(650))

    expect(recognition.start).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('请说，我在听')
  })

  it('stops recording on release so the spoken question can be sent', () => {
    vi.useFakeTimers()
    const recognition = {
      lang: '', continuous: false, interimResults: false, maxAlternatives: 0,
      onresult: null, onerror: null, onend: null,
      start: vi.fn(), stop: vi.fn(), abort: vi.fn(),
    }
    const SpeechRecognitionMock = function () { return recognition } as unknown as new () => typeof recognition
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SpeechRecognitionMock })
    renderCompanion()
    const button = screen.getByRole('button', { name: '和绒桃 Momo互动' })

    fireEvent.pointerDown(button, { pointerId: 9, button: 0 })
    act(() => vi.advanceTimersByTime(650))
    fireEvent.pointerUp(button, { pointerId: 9, button: 0 })

    expect(recognition.stop).toHaveBeenCalledTimes(1)
  })
})
