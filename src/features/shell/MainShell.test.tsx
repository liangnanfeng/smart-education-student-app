import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { defaultState } from '../../app/model'
import { MainShell } from './MainShell'

describe('main shell navigation', () => {
  beforeEach(() => localStorage.clear())

  it('keeps four main destinations available', () => {
    render(<AppStateProvider><MainShell /></AppStateProvider>)
    const nav = screen.getByRole('navigation', { name: '主要导航' })
    expect(nav).toBeInTheDocument()
    for (const label of ['首页', '知识', '测试', '我的']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('opens the available knowledge course and test map', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><MainShell /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '知识' }))
    expect(screen.getByRole('heading', { name: 'AI 创想大陆' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '测试' }))
    expect(screen.getByRole('region', { name: '闯关地图' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '主要导航' })).toBeInTheDocument()
  })

  it('keeps the AI companion available on nested app screens', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><MainShell /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '我的' }))
    await user.click(screen.getByRole('button', { name: '进入设置' }))

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toBeInTheDocument()
  })

  it('uses only the in-map interactive companion on the elementary test tab', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><MainShell /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '测试' }))
    const companions = screen.getAllByRole('button', { name: 'AI伙伴' })
    expect(companions).toHaveLength(1)
    expect(companions[0]).toHaveAttribute('data-companion-placement', 'test-map')
  })

  it('keeps only the lower-right companion on the secondary test tab', async () => {
    const user = userEvent.setup()
    localStorage.setItem('student-app-state', JSON.stringify({ ...defaultState, stage: 'secondary', grade: 'grade7' }))
    render(<AppStateProvider><MainShell /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '测试' }))
    const companions = screen.getAllByRole('button', { name: 'AI伙伴' })
    expect(companions).toHaveLength(1)
    expect(companions[0]).toHaveAttribute('data-companion-placement', 'floating')
  })
})
