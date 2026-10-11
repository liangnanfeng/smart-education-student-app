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

  it('responds with a stage-specific welcome on a short tap', async () => {
    const user = userEvent.setup()
    renderCompanion('secondary')

    await user.click(screen.getByRole('button', { name: '和云宝 Nimbo互动' }))

    expect(screen.getByRole('status')).toHaveTextContent('要从一个问题开始探索吗')
  })

  it('opens a restricted guest chat after a 600ms long press', () => {
    vi.useFakeTimers()
    renderCompanion()
    const button = screen.getByRole('button', { name: '和绒桃 Momo互动' })

    fireEvent.pointerDown(button)
    act(() => vi.advanceTimersByTime(650))
    fireEvent.pointerUp(button)

    expect(screen.getByRole('dialog', { name: '未登录体验' })).toBeInTheDocument()
    expect(screen.getByText(/不会读取账号资料、保存聊天记录或控制应用/)).toBeInTheDocument()
  })
})
