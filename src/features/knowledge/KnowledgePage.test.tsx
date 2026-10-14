import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { createEmptyLearningProgress, getGradeBand, type PrimaryGrade } from '../../app/learning'
import { defaultState } from '../../app/model'
import { saveState } from '../../app/storage'
import { KnowledgePage } from './KnowledgePage'

describe('KnowledgePage', () => {
  beforeEach(() => localStorage.clear())

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

  it.each([
    ['grade1', 8],
    ['grade3', 6],
    ['grade6', 9],
  ] as const)('renders the complete vertical course map for %s', (grade, expectedParts) => {
    saveState({
      ...defaultState,
      grade: grade as PrimaryGrade,
      learningProgress: createEmptyLearningProgress(),
    })

    const view = render(
      <AppStateProvider>
        <KnowledgePage onOpenContent={vi.fn()} />
      </AppStateProvider>,
    )

    const band = getGradeBand(grade)
    expect(view.container.querySelector('.knowledge-page')).toHaveAttribute('data-band', band)
    expect(view.container.querySelectorAll('.day-card')).toHaveLength(expectedParts)
    view.unmount()
  })
})
