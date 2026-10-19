import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { RecognitionResultView } from './RecognitionResultView'
import type { ToolId } from './recognitionTools'
afterEach(cleanup)
const result = { title: '测试结果', output: '最终内容', sourceText: 'Hello', scanContent: 'https://example.com', evidence: ['材料中的依据'], steps: [{ title: '检查步骤', detail: '具体说明' }], uncertainty: '需要核对' }
function show(tool: ToolId) { render(<RecognitionResultView tool={tool} result={result} image="" target="中文" onNotice={vi.fn()} />) }
it.each([['object', '认出它的特征'], ['scan', '码中原始内容'], ['ocr', '提取原文 · 可核对修改'], ['solve', '② 一步一步解题'], ['translate', '中文译文'], ['check', '怎么检查，怎么改？']] as const)('%s shows its own result structure', (tool, label) => { show(tool); expect(screen.getByText(label)).toBeInTheDocument() })
it('keeps answer hidden until the student requests it', async () => {
 const user = userEvent.setup(); show('solve')
 expect(screen.queryByText('最终内容')).not.toBeInTheDocument()
 await user.click(screen.getByRole('button', { name: '③ 我想好了，查看答案' }))
 expect(screen.getByText('最终内容')).toBeInTheDocument()
 await user.click(screen.getByRole('button', { name: '收起答案' }))
 expect(screen.queryByText('最终内容')).not.toBeInTheDocument()
})
it('copies edited OCR text and can restore the extracted text', async () => {
 const user = userEvent.setup(); const copy = vi.spyOn(navigator.clipboard, 'writeText'); show('ocr')
 await user.clear(screen.getByRole('textbox')); await user.type(screen.getByRole('textbox'), '校对后的内容')
 await user.click(screen.getByRole('button', { name: '复制当前文字' }))
 expect(copy).toHaveBeenCalledWith('校对后的内容')
 await user.click(screen.getByRole('button', { name: '恢复提取原文' }))
 expect(screen.getByRole('textbox')).toHaveValue('最终内容')
})
it('shows original translation text independently', () => { show('translate'); expect(screen.getByText('Hello')).toBeInTheDocument(); expect(screen.getByText('最终内容')).toBeInTheDocument() })
it('keeps decoded content separate from AI explanation', () => { show('scan'); expect(screen.getByText('https://example.com')).toBeInTheDocument(); expect(screen.getByText('最终内容')).toBeInTheDocument() })
