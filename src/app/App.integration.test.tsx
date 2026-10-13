import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('student app integration', () => {
  it('moves from login through all four destinations and back through logout', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.queryByRole('button', { name: '小学端' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '中学端' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('学习账号／学习码'), 'demo-student')
    await user.type(screen.getByLabelText('密码'), 'demo-password')
    await user.click(screen.getByRole('button', { name: '进入学习世界' }))
    expect(screen.getByRole('heading', { name: '精选 AI 创意游戏' })).toBeInTheDocument()
    expect(screen.getByText('AI 通识新鲜报')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '知识' }))
    expect(screen.getByRole('heading', { name: 'AI 探索实验室' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '测试' }))
    expect(screen.getByRole('region', { name: '闯关地图' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '我的' }))
    expect(screen.getByRole('heading', { name: '晨曦同学' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '进入设置' }))
    expect(screen.getByRole('heading', { name: '设置' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '退出当前账号' }))
    await user.click(screen.getByRole('button', { name: '确认退出' }))
    expect(screen.getByRole('heading', { name: '欢迎来到数智学习世界' })).toBeInTheDocument()
  })
})
