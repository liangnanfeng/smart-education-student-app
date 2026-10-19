import { CalendarDays, ChevronRight, Lightbulb, PencilLine, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppState } from '../../app/AppState'
import { getGradeBand, type PrimaryGrade } from '../../app/learning'
import type { AppState } from '../../app/model'
import { getCourseForBand } from '../knowledge/courseCatalog'
import { GrowthRadar, type GrowthDatum } from './GrowthRadar'

// 由知识完成 + 测试通过 + 收藏/点赞 + 近期活跃，推导五维成长值（0-99）。
// 只与"自己的近期"相比，因此所有维度都给一个温和的基础分，再按完成度上浮。
function computeGrowthData(state: AppState): GrowthDatum[] {
  const band = getGradeBand(state.grade as PrimaryGrade)
  const progress = state.learningProgress[band]
  const course = getCourseForBand(band)
  const total = Math.max(course.parts.length, 1)
  const knowledgeCount = progress.knowledgeCompleted.length
  const testCount = progress.testsPassed.length
  const knowledgeRatio = knowledgeCount / total
  const testRatio = testCount / total
  const testVsKnowledge = knowledgeCount > 0 ? testCount / knowledgeCount : 0

  // 近 7 天的学习动作数（来自积分流水中的知识/测试/徽章记录）
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentLearning = state.transactions.filter(
    (t) => (t.kind === 'knowledge' || t.kind === 'test' || t.kind === 'medal')
      && new Date(t.occurredAt).getTime() > weekAgo,
  ).length

  const clamp = (n: number) => Math.max(0, Math.min(99, Math.round(n)))
  return [
    // 好奇探索：收藏 + 点赞 + 接触新知识
    { dimension: '好奇探索', value: clamp(55 + state.favorites.length * 3 + state.likes.length + knowledgeRatio * 40) },
    // 知识理解：知识部分完成率
    { dimension: '知识理解', value: clamp(40 + knowledgeRatio * 60) },
    // 问题解决：测试通过情况（已解锁测试中的通过率 + 总进度）
    { dimension: '问题解决', value: clamp(40 + testVsKnowledge * 40 + testRatio * 20) },
    // 实践创造：知识 + 测试的综合产出
    { dimension: '实践创造', value: clamp(40 + (knowledgeRatio + testRatio) * 30) },
    // 自主规划：近 7 天学习活跃 + 持续学习习惯
    { dimension: '自主规划', value: clamp(45 + recentLearning * 7 + Math.min(knowledgeCount + testCount, 10) * 2) },
  ]
}

// 根据最突出维度生成本周小称号与一句话鼓励，保持温和、不排名。
function pickWeeklyTitle(data: GrowthDatum[]): { name: string; note: string } {
  const maxValue = Math.max(...data.map((d) => d.value))
  if (maxValue < 35) {
    return { name: '刚刚起航的小探索者', note: '新的旅程才刚开始，先从一个好奇的问题出发。' }
  }
  const top = data.reduce((best, cur) => (cur.value > best.value ? cur : best), data[0])
  switch (top.dimension) {
    case '好奇探索':
      return { name: '爱提问的小探险家', note: '你最近总能提出新问题，好奇心让学习发光。' }
    case '知识理解':
      return { name: '知识小收藏家', note: '你把新学到的知识一点点收进了自己的小口袋。' }
    case '问题解决':
      return { name: '耐心找方法的小研究员', note: '你最近愿意换一种方法再试一次，这份耐心很珍贵。' }
    case '实践创造':
      return { name: '爱动手的小创造者', note: '你把想法动手做了出来，作品里有你的小心思。' }
    case '自主规划':
      return { name: '会安排的小规划师', note: '你最近能自己安排好学习节奏，特别棒。' }
    default:
      return { name: '刚刚起航的小探索者', note: '新的旅程才刚开始，先从一个好奇的问题出发。' }
  }
}

// AI 建议内容每次打开都会轮换，不再总是同一条。
const AI_SUGGESTIONS = [
  {
    kicker: '先预览，再决定',
    title: '把今天的探索提前到 18:40',
    desc: '根据你今天的安排，提前 20 分钟可能更从容。你也可以直接修改下面的时间。',
    time: '18:40',
  },
  {
    kicker: '试试小步走',
    title: '拆成两个 8 分钟小节',
    desc: '今天的内容有点多，先做 8 分钟观察练习，休息一下再完成分类挑战，会更轻松。',
    time: '19:00',
  },
  {
    kicker: '温故而知新',
    title: '先花 3 分钟回看昨天的作品',
    desc: '回看昨天的《会分类的照相机》，今天的探索会更快上手。',
    time: '19:05',
  },
  {
    kicker: '状态刚好',
    title: '保持 19:00 不变',
    desc: '你最近在这个时间段专注度最好，按原计划进行就很棒。',
    time: '19:00',
  },
]

export function GrowthSection({ onStartLearning, onAdjustSchedule, onOpenCalendar }: {
  onStartLearning: () => void
  onAdjustSchedule: () => void
  onOpenCalendar: () => void
}) {
  const { state } = useAppState()
  const [tab, setTab] = useState<'schedule' | 'portrait'>('schedule')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [suggestionIdx, setSuggestionIdx] = useState(() => Math.floor(Math.random() * AI_SUGGESTIONS.length))
  const [suggestionTime, setSuggestionTime] = useState(AI_SUGGESTIONS[suggestionIdx].time)
  const [confirmedNote, setConfirmedNote] = useState('')
  const suggestion = AI_SUGGESTIONS[suggestionIdx]

  // 成长画像：基于真实学习进度（知识 + 测试 + 互动）计算五维值与小称号。
  const growthData = useMemo(() => computeGrowthData(state), [state])
  const weeklyTitle = useMemo(() => pickWeeklyTitle(growthData), [growthData])

  const openSuggestion = () => {
    setSuggestionIdx((i) => (i + 1) % AI_SUGGESTIONS.length)
    setPreviewOpen(true)
  }

  // 弹窗打开时锁定背景滚动（html 与 body 同时锁），关闭后恢复。
  useEffect(() => {
    if (!previewOpen) return
    const { body, documentElement: root } = document
    const original = { body: body.style.overflow, root: root.style.overflow }
    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    return () => {
      body.style.overflow = original.body
      root.style.overflow = original.root
    }
  }, [previewOpen])

  return (
    <section className="profile-section growth-card">
      <div className="growth-tabs" aria-label="成长内容">
        <button type="button" aria-pressed={tab === 'schedule'} onClick={() => setTab('schedule')}>成长安排</button>
        <button type="button" aria-pressed={tab === 'portrait'} onClick={() => setTab('portrait')}>成长画像</button>
      </div>
      {tab === 'schedule' ? (
        <div className="schedule-panel">
          <div className="section-heading-row">
            <div><p className="section-kicker">下一项安排</p><h2>图片识别小探索</h2></div>
            <button className="calendar-entry" type="button" aria-label="打开整月日历" onClick={onOpenCalendar}><CalendarDays aria-hidden="true" size={25} /></button>
          </div>
          <div className="schedule-meta"><span>今天 19:00</span><span>预计 15 分钟</span><span>之后还有 2 项</span></div>
          <p className="gentle-tip">按自己的节奏来，需要时可以调整时间。</p>
          {confirmedNote && <p className="success-note" role="status">{confirmedNote}</p>}
          <div className="schedule-actions">
            <button className="solid-small" type="button" onClick={onStartLearning}>开始学习</button>
            <button className="ghost-small" type="button" onClick={onAdjustSchedule}><PencilLine aria-hidden="true" size={16} />调整安排</button>
          </div>
          <button className="ai-suggestion" type="button" onClick={openSuggestion}><Lightbulb aria-hidden="true" size={17} /><span>看看 AI 建议</span><ChevronRight aria-hidden="true" size={17} /></button>
        </div>
      ) : (
        <div className="portrait-panel">
          <div className="section-heading-row"><div><p className="section-kicker">只和自己的近期相比</p><h2>近期成长足迹</h2></div></div>
          <GrowthRadar data={growthData} />
          <div className="praise-title"><span>本周小称号</span><strong>{weeklyTitle.name}</strong><p>{weeklyTitle.note}</p></div>
          <p className="portrait-note">这是近期学习过程的温和记录，不是固定能力评价；AI 对话不会进入画像数据。</p>
        </div>
      )}
      {previewOpen && createPortal(
        <div className="profile-dialog-backdrop" role="presentation">
          <section className="profile-dialog" role="dialog" aria-modal="true" aria-label="安排建议预览">
            <button className="dialog-close" type="button" aria-label="关闭安排建议" onClick={() => setPreviewOpen(false)}><X aria-hidden="true" /></button>
            <p className="section-kicker">{suggestion.kicker}</p><h2>{suggestion.title}</h2>
            <p>{suggestion.desc}</p>
            <label>建议时间<input type="time" key={suggestionIdx} value={suggestionTime} onChange={(e) => setSuggestionTime(e.target.value)} /></label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setPreviewOpen(false)}>暂不调整</button>
              <button type="button" onClick={() => { setConfirmedNote(`安排已更新：${suggestion.title}（${suggestionTime}）`); setPreviewOpen(false) }}>确认调整</button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </section>
  )
}
