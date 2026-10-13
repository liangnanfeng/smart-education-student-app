import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { KnowledgePage } from './KnowledgePage'

describe('KnowledgePage', () => {
  it('shows the default grade-5 account with parts 1-3 complete and part 4 current', () => {
    render(
      <AppStateProvider>
        <KnowledgePage onOpenContent={vi.fn()} />
      </AppStateProvider>,
    )

    expect(screen.getByRole('heading', { name: 'AI 探索实验室' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /AI 系统拆解站.*已完成/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /算法工具箱.*已完成/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /第一次 AI 实验.*当前学习/ })).toHaveAttribute('aria-expanded', 'true')
  })
})
