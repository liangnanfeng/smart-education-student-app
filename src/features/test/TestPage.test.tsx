import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { createEmptyLearningProgress, getGradeBand, getPartIdsForBand } from '../../app/learning'
import { defaultState, type AppState } from '../../app/model'
import { getPointsBalance } from '../../app/points'
import { saveState } from '../../app/storage'
import { getCourseForBand } from '../knowledge/courseCatalog'
import { getMapNodes } from './testMapData'
import { TestPage } from './TestPage'

function renderMap(state: Partial<AppState> = {}) {
  saveState({ ...defaultState, ...state })
  return render(<AppStateProvider><TestPage /></AppStateProvider>)
}

describe('TestPage', () => {
  beforeEach(() => localStorage.clear())

  it('uses the shared grade-band course and gives every part one map node', () => {
    for (const grade of ['grade1', 'grade3', 'grade5'] as const) {
      const band = getGradeBand(grade)
      const course = getCourseForBand(band)
      const nodes = getMapNodes(course.id)

      expect(nodes.map((node) => node.id)).toEqual(getPartIdsForBand(band))
      expect(nodes.every((node) => node.x >= 10 && node.x <= 90)).toBe(true)
      expect(nodes.every((node) => node.y >= 10 && node.y <= 90)).toBe(true)
    }
  })

  it('blocks a test whose matching knowledge is incomplete', async () => {
    const user = userEvent.setup()
    renderMap({
      grade: 'grade5',
      learningProgress: {
        ...createEmptyLearningProgress(),
        'grade5-6': { knowledgeCompleted: ['ael-1'], testsPassed: [] },
      },
    })

    await user.click(screen.getByRole('button', { name: '数据侦探营 · 先学知识' }))

    expect(screen.getByRole('status')).toHaveTextContent('先完成第 2 部分知识')
    expect(screen.queryByRole('button', { name: '开始答题' })).not.toBeInTheDocument()
  })

  it('shows an introduction before opening an unlocked quiz', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade5' })

    await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
    expect(screen.getByRole('dialog', { name: '算法工具箱挑战介绍' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '开始答题' }))
    expect(screen.getByRole('heading', { name: '算法工具箱' })).toBeInTheDocument()
  })

  it('keeps the companion centered above the current node and moves it after passing', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade5' })

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'ael-3')
    await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
    await user.click(screen.getByRole('button', { name: '开始答题' }))
    for (const answer of ['分类', '聚类', '数值预测', '错', '先说明需求并允许同学调整']) {
      await user.click(screen.getByRole('button', { name: answer }))
      await user.click(screen.getByRole('button', { name: /下一题|查看成绩/ }))
    }

    expect(screen.getByText('通关成功！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'ael-4')
  })

  it('persists a passing reward once when the same challenge is completed again', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade5' })
    const balanceBefore = getPointsBalance(defaultState.transactions)

    async function passCurrentChallenge() {
      await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
      await user.click(screen.getByRole('button', { name: '开始答题' }))
      for (const answer of ['分类', '聚类', '数值预测', '错', '先说明需求并允许同学调整']) {
        await user.click(screen.getByRole('button', { name: answer }))
        await user.click(screen.getByRole('button', { name: /下一题|查看成绩/ }))
      }
      await user.click(screen.getByRole('button', { name: '完成' }))
    }

    await passCurrentChallenge()
    await user.click(screen.getByRole('button', { name: '算法工具箱 · 已通关' }))
    await user.click(screen.getByRole('button', { name: '开始答题' }))
    for (const answer of ['分类', '聚类', '数值预测', '错', '先说明需求并允许同学调整']) {
      await user.click(screen.getByRole('button', { name: answer }))
      await user.click(screen.getByRole('button', { name: /下一题|查看成绩/ }))
    }

    const saved = JSON.parse(localStorage.getItem('student-app-state') ?? '{}') as AppState
    expect(saved.learningProgress['grade5-6'].testsPassed).toEqual(['ael-1', 'ael-2', 'ael-3'])
    expect(saved.transactions.filter((item) => item.eventId === 'test:ael-3')).toHaveLength(1)
    expect(getPointsBalance(saved.transactions)).toBe(balanceBefore + 70)
  })

  it('offers knowledge review and retry after a failed challenge without a reward', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade5' })

    await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
    await user.click(screen.getByRole('button', { name: '开始答题' }))
    for (const answer of ['聚类', '分类', '分类', '对', '直接替所有人决定']) {
      await user.click(screen.getByRole('button', { name: answer }))
      await user.click(screen.getByRole('button', { name: /下一题|查看成绩/ }))
    }

    expect(screen.getByText('再试一次吧')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再试一次' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '回顾第 3 部分知识' }))
    expect(screen.getByRole('heading', { name: '第3章 · 算法工具箱' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument()
    const saved = JSON.parse(localStorage.getItem('student-app-state') ?? '{}') as AppState
    expect(saved.learningProgress['grade5-6'].testsPassed).toEqual(['ael-1', 'ael-2'])
    expect(saved.transactions.some((item) => item.eventId === 'test:ael-3')).toBe(false)
  })

  it('renders all nine 5-6 challenges from the shared course catalog', () => {
    const allAelParts = getPartIdsForBand('grade5-6')
    renderMap({
      grade: 'grade6',
      learningProgress: {
        ...createEmptyLearningProgress(),
        'grade5-6': { knowledgeCompleted: allAelParts, testsPassed: [] },
      },
    })

    const route = screen.getByRole('region', { name: '可上下滑动的完整闯关地图' })
    expect(route).toHaveAttribute('tabindex', '0')
    expect(within(route).getAllByRole('button')).toHaveLength(9)
    expect(within(route).getByRole('button', { name: '我的 AI 小项目 · 可挑战' })).toBeInTheDocument()
  })
})
