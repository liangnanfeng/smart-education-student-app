import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { defaultState } from '../../app/model'
import { AiCompanion } from './AiCompanion'
import { classifyDemoCommand } from './safety'

const savedMatchMedia = window.matchMedia
const savedInnerHeight = window.innerHeight

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
})

afterEach(() => {
  vi.useRealTimers()
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: savedMatchMedia })
  Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: savedInnerHeight })
  vi.restoreAllMocks()
})

describe('temporary AI companion', () => {
  it('starts in the lower-right safe zone above the bottom navigation', () => {
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    const control = screen.getByRole('button', { name: 'AI伙伴' })
    expect(control.style.left).toBe('88vw')
    expect(control.style.top).toBe('78vh')
    expect(control).toHaveClass('is-on-right-side')
  })

  it('keeps the companion in the visible lower-right corner of a tall app frame', () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 800 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('app-frame')) {
        return { left: 200, top: 0, right: 660, bottom: 1600, width: 460, height: 1600 } as DOMRect
      }
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } as DOMRect
    })

    render(<div className="app-frame"><AppStateProvider><AiCompanion /></AppStateProvider></div>)

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveStyle({
      left: '604.8px',
      top: '672px',
    })
  })

  it('renders the equipped layered companion instead of the legacy bot icon', () => {
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    const control = screen.getByRole('button', { name: 'AI伙伴' })
    expect(within(control).getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
    expect(within(control).queryByText('AI')).not.toBeInTheDocument()
  })

  it('keeps tap and chat available after an appearance, outfit, and decoration are equipped', async () => {
    const user = userEvent.setup()
    localStorage.setItem('student-app-state', JSON.stringify({
      ...defaultState,
      companions: {
        ...defaultState.companions,
        elementary: {
          owned: {
            appearance: ['momo', 'yunduo'],
            outfit: ['cloud-backpack'],
            decoration: ['cloud-flower-lamp'],
          },
          equipped: {
            appearance: 'yunduo',
            outfit: 'cloud-backpack',
            decoration: 'cloud-flower-lamp',
          },
          version: 1,
        },
      },
    }))
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    const control = screen.getByRole('button', { name: 'AI伙伴' })
    expect(within(control).getByRole('img', { name: '云朵 Yunduo AI 伙伴形象' })).toBeInTheDocument()
    expect(within(control).getByTestId('companion-outfit')).toBeInTheDocument()
    expect(within(control).getByTestId('companion-decoration')).toBeInTheDocument()
    await user.click(control)
    expect(screen.getByRole('dialog', { name: 'AI 学习伙伴' })).toBeInTheDocument()
  })

  it('uses the saved login bounds once and clears the handoff record after the animation', () => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: 800 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('app-frame')) {
        return { left: 200, top: 0, right: 660, bottom: 1600, width: 460, height: 1600 } as DOMRect
      }
      if (this.classList.contains('ai-companion-control')) {
        return { left: 300, top: 500, right: 370, bottom: 570, width: 70, height: 70 } as DOMRect
      }
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } as DOMRect
    })
    sessionStorage.setItem('student-app-login-companion-bounds', JSON.stringify({
      version: 1,
      stage: 'elementary',
      appearanceId: 'momo',
      outfitId: null,
      decorationId: null,
      rect: { left: 40, top: 80, right: 220, bottom: 260, width: 180, height: 180 },
    }))

    render(<div className="app-frame"><AppStateProvider><AiCompanion /></AppStateProvider></div>)

    const handoff = screen.getByTestId('companion-handoff')
    expect(handoff).toHaveAttribute('data-handoff-status', 'running')
    expect(handoff).toHaveAttribute('data-handoff-motion', 'glide')
    expect(handoff).toHaveStyle({
      left: '95px',
      top: '135px',
      width: '70px',
      height: '70px',
      '--handoff-x': '205px',
      '--handoff-y': '365px',
    })
    expect(handoff.style.getPropertyValue('--handoff-scale')).toBe('')
    act(() => vi.advanceTimersByTime(800))
    expect(screen.getByTestId('companion-handoff')).toHaveAttribute('data-handoff-status', 'complete')
    expect(sessionStorage.getItem('student-app-login-companion-bounds')).toBeNull()
  })

  it('skips the handoff when reduced motion is requested', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    })
    sessionStorage.setItem('student-app-login-companion-bounds', JSON.stringify({
      version: 1,
      stage: 'elementary',
      appearanceId: 'momo',
      outfitId: null,
      decorationId: null,
      rect: { left: 40, top: 80, right: 220, bottom: 260, width: 180, height: 180 },
    }))

    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    expect(screen.queryByTestId('companion-handoff')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
    expect(sessionStorage.getItem('student-app-login-companion-bounds')).toBeNull()
  })

  it('classifies unclear and risk-sensitive demo commands deterministically', () => {
    expect(classifyDemoCommand('那个帮我弄一下')).toBe('unclear')
    expect(classifyDemoCommand('把明天的学习安排改到晚上')).toBe('medium')
    expect(classifyDemoCommand('帮我修改账号密码')).toBe('high')
    expect(classifyDemoCommand('你真蠢')).toBe('blocked')
    expect(classifyDemoCommand('打开我的作品')).toBe('safe')
  })

  it('opens the AI learning assistant on tap', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: 'AI伙伴' }))
    expect(screen.getByRole('dialog', { name: 'AI 学习伙伴' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('发消息...')).toBeInTheDocument()
  })

  it('starts voice listening in a small companion bubble after a deliberate long press', () => {
    vi.useFakeTimers()
    const recognition = {
      lang: '', continuous: false, interimResults: false, maxAlternatives: 0,
      onresult: null, onerror: null, onend: null,
      start: vi.fn(), stop: vi.fn(), abort: vi.fn(),
    }
    const SpeechRecognitionMock = function () { return recognition } as unknown as new () => typeof recognition
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: SpeechRecognitionMock })
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)
    const control = screen.getByRole('button', { name: 'AI伙伴' })

    fireEvent.pointerDown(control, { clientX: 300, clientY: 500, pointerId: 1 })
    act(() => vi.advanceTimersByTime(650))
    fireEvent.pointerUp(control, { clientX: 300, clientY: 500, pointerId: 1 })

    expect(screen.queryByRole('dialog', { name: 'AI 学习伙伴' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('请说，我在听')
    expect(recognition.start).toHaveBeenCalledTimes(1)
  })
})
