import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { AiCompanion } from './AiCompanion'
import { classifyDemoCommand } from './safety'

const savedMatchMedia = window.matchMedia

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
  vi.restoreAllMocks()
})

describe('temporary AI companion', () => {
  it('starts in the lower-right safe zone above the bottom navigation', () => {
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveStyle({
      '--ai-x': '88%',
      '--ai-y': '84%',
    })
  })

  it('renders the equipped layered companion instead of the legacy bot icon', () => {
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    const control = screen.getByRole('button', { name: 'AI伙伴' })
    expect(within(control).getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
    expect(within(control).queryByText('AI')).not.toBeInTheDocument()
  })

  it('uses the saved login bounds once and clears the handoff record after the animation', () => {
    vi.useFakeTimers()
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 300,
      y: 500,
      left: 300,
      top: 500,
      right: 370,
      bottom: 570,
      width: 70,
      height: 70,
      toJSON: () => ({}),
    } as DOMRect)
    sessionStorage.setItem('student-app-login-companion-bounds', JSON.stringify({
      version: 1,
      stage: 'elementary',
      appearanceId: 'momo',
      outfitId: null,
      decorationId: null,
      rect: { left: 40, top: 80, right: 220, bottom: 260, width: 180, height: 180 },
    }))

    render(<AppStateProvider><AiCompanion /></AppStateProvider>)

    expect(screen.getByTestId('companion-handoff')).toHaveAttribute('data-handoff-status', 'running')
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

  it('opens the AI learning assistant after a deliberate long press', () => {
    vi.useFakeTimers()
    render(<AppStateProvider><AiCompanion /></AppStateProvider>)
    const control = screen.getByRole('button', { name: 'AI伙伴' })

    fireEvent.pointerDown(control, { clientX: 300, clientY: 500, pointerId: 1 })
    act(() => vi.advanceTimersByTime(650))
    fireEvent.pointerUp(control, { clientX: 300, clientY: 500, pointerId: 1 })

    expect(screen.getByRole('dialog', { name: 'AI 学习伙伴' })).toBeInTheDocument()
  })
})
