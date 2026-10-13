import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { defaultState, type AppState } from '../../app/model'
import { saveState } from '../../app/storage'
import { TestPage } from './TestPage'

function renderMap(state: Partial<AppState>) {
  saveState({ ...defaultState, ...state })
  return render(<AppStateProvider><TestPage /></AppStateProvider>)
}

describe('TestPage', () => {
  beforeEach(() => localStorage.clear())

  it('lets elementary students start the highlighted next island challenge', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade1' })

    expect(screen.getByText('下一站：眼睛岛')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '出发挑战：眼睛岛' }))
    expect(screen.getByRole('heading', { name: '眼睛岛' })).toBeInTheDocument()
  })

  it('keeps the complete elementary island route vertically explorable', () => {
    renderMap({ grade: 'grade1' })

    const islandRoute = screen.getByRole('region', { name: '可上下滑动的岛屿路线' })
    expect(islandRoute).toHaveAttribute('tabindex', '0')
    expect(islandRoute).toHaveStyle({ overflowY: 'auto', touchAction: 'pan-y' })
    expect(screen.getByText('上下滑动，探索完整岛屿路线')).toBeInTheDocument()
    expect(screen.getByLabelText('启明星岛地貌')).toBeInTheDocument()
    expect(screen.getByLabelText('城堡岛地貌')).toBeInTheDocument()
  })

  it('uses the compact 4-6 grade island route instead of the longer lower-grade layout', () => {
    renderMap({ grade: 'grade4' })

    const islandRoute = screen.getByRole('region', { name: '可上下滑动的4至6年级岛屿路线' })
    expect(islandRoute).toHaveClass('elementary-route--cxd')
    expect(islandRoute.querySelector('.elementary-route__canvas')).toHaveClass('elementary-route__canvas--cxd')
  })

  it('does not unlock the chapter after a treasure chest before the preceding lesson is completed', () => {
    renderMap({ grade: 'grade4' })

    expect(screen.getByRole('button', { name: '创意放大器 · 当前关卡' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '负责任的创想家 · 未解锁' })).toBeInTheDocument()
  })

  it('keeps the player-equipped companion interactive inside the elementary test map', async () => {
    const user = userEvent.setup()
    renderMap({
      grade: 'grade4',
      companion: {
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
    })

    const mapCompanion = screen.getByRole('button', { name: 'AI伙伴' })
    expect(mapCompanion).toHaveAttribute('data-companion-placement', 'test-map')
    expect(within(mapCompanion).getByRole('img', { name: '云朵 Yunduo AI 伙伴形象' })).toBeInTheDocument()
    expect(within(mapCompanion).getByTestId('companion-outfit')).toHaveAttribute('src', '/mall/elementary/cloud-backpack.png')
    expect(within(mapCompanion).getByTestId('companion-decoration')).toHaveAttribute('src', '/mall/elementary/cloud-flower-lamp.png')
    await user.click(mapCompanion)
    expect(screen.getByRole('dialog', { name: 'AI 学习伙伴' })).toBeInTheDocument()
  })

  it('centers the elementary companion directly above the current level icon', () => {
    renderMap({ grade: 'grade4' })

    const mapCompanion = screen.getByRole('button', { name: 'AI伙伴' })
    expect(mapCompanion).toHaveStyle({ left: '72%', bottom: '34%' })
    expect(mapCompanion).toHaveAttribute('data-map-node-id', 'l3')
  })

  it('moves the elementary companion from the current island to the newly unlocked test', async () => {
    const user = userEvent.setup()
    renderMap({ grade: 'grade1' })

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'l3')
    await user.click(screen.getByRole('button', { name: '出发挑战：眼睛岛' }))
    await user.click(screen.getByRole('button', { name: '开始答题' }))
    await user.click(screen.getByRole('button', { name: /看很多很多猫的照片/ }))
    await user.click(screen.getByRole('button', { name: /下一题/ }))
    await user.click(screen.getByRole('button', { name: '错' }))
    await user.click(screen.getByRole('button', { name: /下一题/ }))
    await user.click(screen.getByRole('button', { name: /尖耳朵、长胡须/ }))
    await user.click(screen.getByRole('button', { name: /下一题/ }))
    await user.click(screen.getByRole('button', { name: '对' }))
    await user.click(screen.getByRole('button', { name: /下一题/ }))
    await user.click(screen.getByRole('button', { name: '查看参考答案' }))
    await user.click(screen.getByRole('button', { name: /查看成绩/ }))

    expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'l4')
  })

  it('frames primary learning as an adventure while keeping the map accessible', () => {
    renderMap({ grade: 'grade5' })

    expect(screen.getByRole('heading', { name: 'AI 创想大陆' })).toBeInTheDocument()
    expect(screen.getByText('下一站：创意放大器')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '闯关地图' })).toBeInTheDocument()
  })
})
