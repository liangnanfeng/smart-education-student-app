import { useState } from 'react'
import { BookOpen, Camera, FileText, Languages, ScanLine, SearchCheck, Sparkles, Copy } from 'lucide-react'
import type { ToolId, ToolResult } from './recognitionTools'

const presentation = {
  object: { label: '物品观察卡', Icon: Camera, extension: '认识这个物品' },
  scan: { label: '扫码信息卡', Icon: ScanLine, extension: '读懂二维码' },
  ocr: { label: '文字提取稿', Icon: FileText, extension: '从文字里学知识' },
  solve: { label: '解题学习单', Icon: BookOpen, extension: '举一反三 · 知识拓展' },
  translate: { label: '双语对照本', Icon: Languages, extension: '语言小课堂' },
  check: { label: '内容检查报告', Icon: SearchCheck, extension: '学会判断信息' },
}
export const extensionTitle = (tool: ToolId) => presentation[tool].extension

export function RecognitionResultView({ tool, result, image, target, onNotice }: { tool: ToolId; result: ToolResult; image: string; target: string; onNotice: (message: string) => void }) {
  const [draft, setDraft] = useState(result.output)
  const [answerOpen, setAnswerOpen] = useState(false)
  const { label, Icon } = presentation[tool]
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); onNotice('已复制') } catch { onNotice('复制失败，请手动选择文字复制。') }
  }
  const evidence = <ul className="result-evidence">{result.evidence.map((item, i) => <li key={i}>{item}</li>)}</ul>
  const steps = <ol className="result-method">{result.steps.map((step, i) => <li key={i}><span>{i + 1}</span><div><strong>{step.title}</strong><p>{step.detail}</p></div></li>)}</ol>
  return <div className={`result-view result-view-${tool}`}>
    <header className="result-view-header"><Icon size={20} aria-hidden="true" /><div><p>{label}</p><h3>{result.title}</h3></div></header>
    {tool === 'object' && <>
      <section className="object-discovery">{image && <img src={image} alt="这次观察的物品" />}<div><span className="result-eyebrow">我发现了</span><p className="result-prose">{result.output}</p></div></section>
      <section className="result-block"><h4>认出它的特征</h4><div className="object-features">{result.evidence.map((item, i) => <p key={i}><Sparkles size={14} aria-hidden="true" />{item}</p>)}</div></section>
      <details className="result-details"><summary>AI 怎样观察和比较？</summary>{steps}</details>
    </>}
    {tool === 'scan' && <>
      <section className="scan-original"><span className="result-eyebrow">码中原始内容</span><pre>{result.scanContent ?? '请重新扫码以查看独立的原始内容。'}</pre>{result.scanContent && <button type="button" onClick={() => copy(result.scanContent!)}><Copy size={14} />复制码中文字</button>}</section>
      <section className="result-block"><h4>这段内容是什么意思？</h4><p className="result-prose">{result.output}</p></section>
      <details className="result-details"><summary>解码记录与 AI 判断</summary>{evidence}{steps}</details>
      <p className="scan-note">识别成功不代表链接安全，页面不会自动跳转。</p>
    </>}
    {tool === 'ocr' && <>
      <section className="ocr-paper"><div className="ocr-paper-head"><span>提取原文 · 可核对修改</span><span>{draft.length} 字符</span></div><textarea aria-label="提取的文字" value={draft} onChange={e => setDraft(e.target.value)} /><div className="ocr-actions"><button type="button" onClick={() => copy(draft)}><Copy size={14} />复制当前文字</button><button type="button" disabled={draft === result.output} onClick={() => setDraft(result.output)}>恢复提取原文</button></div></section>
      <p className="recognition-hint">对照图片检查错字；修改只影响本框，“复制当前文字”会复制修改稿。</p>
      <details className="result-details"><summary>文字是怎样提取的？</summary>{evidence}{steps}</details>
    </>}
    {tool === 'solve' && <>
      <section className="result-block solve-conditions"><h4>① 先读懂题目</h4>{evidence}</section>
      <section className="result-block"><h4>② 一步一步解题</h4>{steps}</section>
      <section className="solve-answer"><button type="button" aria-expanded={answerOpen} onClick={() => setAnswerOpen(!answerOpen)}>{answerOpen ? '收起答案' : '③ 我想好了，查看答案'}</button>{answerOpen && <p className="result-prose">{result.output}</p>}</section>
    </>}
    {tool === 'translate' && <>
      <div className="translation-pair"><section><span className="result-eyebrow">原文</span><p className="result-prose">{result.sourceText || '请展开“查看本次材料”对照原文。'}</p></section><section><span className="result-eyebrow">{target}译文</span><p className="result-prose">{result.output}</p><button type="button" onClick={() => copy(result.output)}><Copy size={14} />复制译文</button></section></div>
      <section className="result-block"><h4>词语与表达</h4>{steps}</section><details className="result-details"><summary>翻译时参考了哪些内容？</summary>{evidence}</details>
    </>}
    {tool === 'check' && <>
      <section className="check-summary"><span className="result-eyebrow">检查结论与修改建议</span><p className="result-prose">{result.output}</p></section>
      <section className="result-block"><h4>值得留意的表达</h4>{result.evidence.map((item, i) => <blockquote className="check-quote" key={i}>{item}</blockquote>)}</section>
      <section className="result-block"><h4>怎么检查，怎么改？</h4><div className="check-items">{result.steps.map((step, i) => <article key={i}><span>检查点 {i + 1}</span><h5>{step.title}</h5><p>{step.detail}</p></article>)}</div></section>
      <p className="recognition-hint">这是 AI 提供的检查建议，重要事实还要查阅可靠资料。</p>
    </>}
  </div>
}
