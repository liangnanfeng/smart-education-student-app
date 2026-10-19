import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CameraToolSheet } from './CameraToolSheet'
import { cameraTools } from './homeData'
import { readResult } from './readResult'
vi.mock('./readResult', () => ({ readResult: vi.fn() }))
const translationResult = { title: '中文译文', output: '你好', evidence: ['Hello'], steps: [{ title: '翻译', detail: '转换问候语' }], uncertainty: '请结合上下文核对。', introduction: { overview: '英语问候语用于打招呼。', funFact: '不同场合使用不同的问候语。', question: '早上还可以怎么打招呼？' } }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })
describe('recognition tools', () => {
  it.each(cameraTools.map((t, i) => [t.title, i] as const))('opens %s without a sample entry', async (title, i) => {
    const user = userEvent.setup()
    render(<CameraToolSheet open onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: title }))
    expect(screen.getByRole('button', { name: i === 1 ? '开始扫码' : '开始分析' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '体验示例' })).not.toBeInTheDocument()
  })
  it('sends target language and text and displays provider results', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: translationResult }) })
    vi.stubGlobal('fetch', mock)
    const user = userEvent.setup()
    render(<CameraToolSheet open onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: '翻译文字' }))
    await user.type(screen.getByRole('textbox'), 'Hello')
    await user.selectOptions(screen.getByRole('combobox'), '英语')
    await user.click(screen.getByRole('button', { name: '开始分析' }))
    expect(JSON.parse(mock.mock.calls[0][1].body)).toMatchObject({ tool: 'translate', target: '英语', text: 'Hello' })
    expect(await screen.findByText('AI 的发现 · 一起核对看看')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '语言小课堂' })).toBeInTheDocument()
    expect(screen.getByText('英语问候语用于打招呼。')).toBeInTheDocument()
  })
  it.each(['题目解析', '翻译文字', '内容检查'])('reads %s results and stops when leaving', async (title) => {
    const stop = vi.fn()
    vi.mocked(readResult).mockReturnValue(stop)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: translationResult }) }))
    const user = userEvent.setup()
    render(<CameraToolSheet open onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: title }))
    await user.type(screen.getByRole('textbox'), 'Hello')
    await user.click(screen.getByRole('button', { name: '开始分析' }))
    await user.click(await screen.findByRole('button', { name: '朗读结果' }))
    expect(readResult).toHaveBeenCalledWith(expect.stringContaining('英语问候语用于打招呼。'), expect.any(Function), expect.any(Function))
    expect(screen.getByRole('button', { name: '停止朗读' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: '停止朗读' }))
    expect(stop).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: '朗读结果' }))
    await user.click(screen.getByRole('button', { name: '返回工具列表' }))
    expect(stop).toHaveBeenCalledTimes(2)
  })
  it('reports missing service rather than inventing a result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'text_not_configured' }) }))
    const user = userEvent.setup()
    render(<CameraToolSheet open onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: '题目解析' }))
    await user.type(screen.getByRole('textbox'), '1+1')
    await user.click(screen.getByRole('button', { name: '开始分析' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('文字分析服务尚未配置')
    expect(screen.queryByText('识别成果')).not.toBeInTheDocument()
  })
})

