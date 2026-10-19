import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { createDefaultState } from '../../app/model'
import { MedalsPage } from './MedalsPage'
import { PointsPage } from './PointsPage'

describe('profile rewards', () => {
  it('derives the default first two medals and explains the third', () => {
    render(<AppStateProvider><MedalsPage onBack={vi.fn()} /></AppStateProvider>)

    expect(screen.getByText('已获得 2 枚课程徽章')).toBeInTheDocument()
    expect(screen.getByText('算法徽章').closest('li')).toHaveTextContent('知识已完成，测试待通过')
    expect(screen.getByRole('heading', { name: '成长勋章' })).toBeInTheDocument()
  })

  it('keeps the finale separate and locked until every course part is complete', () => {
    render(<AppStateProvider><MedalsPage onBack={vi.fn()} /></AppStateProvider>)

    expect(screen.getByRole('heading', { name: '终章勋章' })).toBeInTheDocument()
    expect(screen.getByText('AI 探索小导师').closest('li')).toHaveTextContent('完成全部课程知识与测试后点亮')
  })

  it('lights the finale only after every course knowledge and test is complete', () => {
    const state = createDefaultState()
    const allPartIds = [
      'ael-1', 'ael-2', 'ael-3', 'ael-4', 'ael-5',
      'ael-6', 'ael-7', 'ael-8', 'ael-9',
    ] as const
    state.learningProgress['grade5-6'] = {
      knowledgeCompleted: [...allPartIds],
      testsPassed: [...allPartIds],
    }
    localStorage.setItem('student-app-state', JSON.stringify(state))

    render(<AppStateProvider><MedalsPage onBack={vi.fn()} /></AppStateProvider>)

    expect(screen.getByText('AI 探索小导师').closest('li')).toHaveTextContent('已点亮')
  })

  it('renders totals and records from the same 2000-point ledger', () => {
    render(<AppStateProvider><PointsPage onBack={vi.fn()} /></AppStateProvider>)

    expect(screen.getByText('当前积分').parentElement).toHaveTextContent('2,000')
    expect(screen.getByText('累计获得').parentElement).toHaveTextContent('+2,000')
    expect(screen.getByText('累计消耗').parentElement).toHaveTextContent('-0')
    expect(screen.getByText('成长体验账号启航积分')).toBeInTheDocument()
    expect(screen.queryByText(/星空精灵/)).not.toBeInTheDocument()
  })
})
