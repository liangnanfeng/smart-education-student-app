import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppStateProvider } from '../../app/AppState'
import { defaultState } from '../../app/model'
import { MallPage } from './MallPage'

const STORAGE_KEY = 'student-app-state'

function renderMall(stage: 'elementary' | 'secondary') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultState, stage }))
  return render(<AppStateProvider><MallPage onBack={() => undefined} /></AppStateProvider>)
}

describe('points mall companion catalogue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows only the four elementary companion pets in the image catalogue', () => {
    renderMall('elementary')

    for (const name of ['绒桃 Momo', '云朵 Yunduo', '云绽 Cloudbloom', '云贝儿 Cloudbelle']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByText('星空精灵')).not.toBeInTheDocument()
    expect(screen.queryByText('云宝 Nimbo')).not.toBeInTheDocument()
  })

  it('switches to the four secondary companion pets for secondary students', () => {
    renderMall('secondary')

    for (const name of ['云宝 Nimbo', '霁绒 Nimbli', '澄霄 Aether', '云珞 Yunluo']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByText('绒桃 Momo')).not.toBeInTheDocument()
    expect(screen.queryByText('阳光小熊')).not.toBeInTheDocument()
  })

  it('shows elementary 3D companion clothing instead of the forthcoming placeholder', async () => {
    const user = userEvent.setup()
    renderMall('elementary')

    await user.click(screen.getByRole('tab', { name: '服饰' }))
    expect(screen.getByText('云朵小背包')).toBeInTheDocument()
    expect(screen.getByText('晨光云杖')).toBeInTheDocument()
    expect(screen.queryByText('服饰正在准备中')).not.toBeInTheDocument()
  })

  it('shows four elementary 3D learning-space decorations', async () => {
    const user = userEvent.setup()
    renderMall('elementary')

    await user.click(screen.getByRole('tab', { name: '装饰' }))
    for (const name of ['云光花灯', '彩虹云门', '花云风铃', '云朵花椅']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByText('装饰正在准备中')).not.toBeInTheDocument()
  })

  it('shows three futuristic companion clothing items for secondary students', async () => {
    const user = userEvent.setup()
    renderMall('secondary')

    await user.click(screen.getByRole('tab', { name: '服饰' }))
    for (const name of ['澄月铃饰', '云纹晶匣', '星羽晶杖']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByText('服饰正在准备中')).not.toBeInTheDocument()
  })

  it('shows three futuristic learning-space decorations for secondary students', async () => {
    const user = userEvent.setup()
    renderMall('secondary')

    await user.click(screen.getByRole('tab', { name: '装饰' }))
    for (const name of ['翼晶云门', '星环观测仪', '霄云王座']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(screen.queryByText('装饰正在准备中')).not.toBeInTheDocument()
  })

  it('opens a large preview before offering purchase', async () => {
    const user = userEvent.setup()
    renderMall('elementary')

    await user.click(screen.getByRole('button', { name: '查看 云朵 Yunduo' }))

    expect(screen.getByRole('dialog', { name: '云朵 Yunduo 商品预览' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '购买 云朵 Yunduo' })).toBeInTheDocument()
  })

  it('keeps the current appearance when purchase equip confirmation is declined', async () => {
    const user = userEvent.setup()
    renderMall('elementary')

    await user.click(screen.getByRole('button', { name: '查看 云朵 Yunduo' }))
    await user.click(screen.getByRole('button', { name: '购买 云朵 Yunduo' }))
    expect(screen.getByRole('dialog', { name: '现在换上吗？' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '暂不更换' }))

    expect(screen.getByText('当前伙伴：绒桃 Momo')).toBeInTheDocument()
  })

  it('equips a purchased appearance after confirmation', async () => {
    const user = userEvent.setup()
    renderMall('elementary')

    await user.click(screen.getByRole('button', { name: '查看 云朵 Yunduo' }))
    await user.click(screen.getByRole('button', { name: '购买 云朵 Yunduo' }))
    await user.click(screen.getByRole('button', { name: '现在换上' }))

    expect(screen.getByText('当前伙伴：云朵 Yunduo')).toBeInTheDocument()
  })
})
