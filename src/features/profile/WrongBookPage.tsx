import { ArrowLeft, Filter, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import type { WrongQuestion } from '../../app/model'
import './profile.css'

// 学习主题与项目课程（启明星大冒险 / 创想大陆 / AI 探索实验室）保持一致，
// 不再使用语数外学科分类，跨年级段通用。
type Topic = '全部' | '认识 AI' | '观察识别' | '语音交互' | '数据与算法' | '安全与责任' | '综合探索'

const topics: Topic[] = ['全部', '认识 AI', '观察识别', '语音交互', '数据与算法', '安全与责任', '综合探索']

// 把 occurredAt 渲染成孩子能看懂的相对时间：今天 / 昨天 / N 天前 / 上周 / 更早。
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return '刚刚'
  const diffMs = Date.now() - t
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  if (days < 14) return '上周'
  return '更早'
}

export function WrongBookPage({ onBack }: { onBack: () => void }) {
  const { state, removeWrongQuestion, toggleWrongReviewed } = useAppState()
  const wrongQuestions = state.wrongQuestions ?? []
  const [topicFilter, setTopicFilter] = useState<Topic>('全部')
  const [reviewFilter, setReviewFilter] = useState<'全部' | '待复习'>('全部')
  const [expanded, setExpanded] = useState<string | null>(null)

  // 主题覆盖：统计各主题错题数（只统计实际出现的主题，避免空柱子）。
  const presentTopics = topics.slice(1).filter((t) => wrongQuestions.some((q) => q.topic === t))
  const topicCounts = presentTopics.map((t) => ({
    label: t,
    count: wrongQuestions.filter((q) => q.topic === t).length,
  }))
  const maxTopicCount = Math.max(...topicCounts.map((t) => t.count), 1)

  let filtered = wrongQuestions
  if (topicFilter !== '全部') {
    filtered = filtered.filter((q) => q.topic === topicFilter)
  }
  if (reviewFilter === '待复习') {
    filtered = filtered.filter((q) => !q.reviewed)
  }

  const pendingCount = wrongQuestions.filter((q) => !q.reviewed).length

  return (
    <div className="rewards-page wrongbook-page">
      <header className="profile-page-header">
        <button className="profile-back" type="button" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1>错题本</h1>
      </header>

      {wrongQuestions.length === 0 ? (
        <div className="wb-empty" role="status">
          <p className="wb-empty-title">还没有内容，慢慢积累就好</p>
          <p className="wb-empty-desc">去「测试」里挑战闯关答题，答错的题会自动放到这里。</p>
        </div>
      ) : (
        <>
          <div className="rewards-summary">
            <div
              className={`rewards-stat clickable ${topicFilter !== '全部' || reviewFilter !== '全部' ? 'active' : ''}`}
              role="button" tabIndex={0}
              onClick={() => { setTopicFilter('全部'); setReviewFilter('全部') }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setTopicFilter('全部'); setReviewFilter('全部') } }}
              title="显示全部错题"
            >
              <XCircle size={24} />
              <div>
                <strong>{wrongQuestions.length}</strong>
                <span>累计错题</span>
              </div>
            </div>
            <div
              className={`rewards-stat clickable ${reviewFilter === '待复习' ? 'active' : ''}`}
              role="button" tabIndex={0}
              onClick={() => setReviewFilter(reviewFilter === '待复习' ? '全部' : '待复习')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setReviewFilter(reviewFilter === '待复习' ? '全部' : '待复习') }}
              title="只看待复习"
            >
              <RotateCcw size={24} />
              <div>
                <strong>{pendingCount}</strong>
                <span>待复习</span>
              </div>
            </div>
            <div
              className={`rewards-stat clickable ${topicFilter !== '全部' ? 'active' : ''}`}
              role="button" tabIndex={0}
              onClick={() => {
                if (topicFilter === '全部') {
                  // 快速切到有错题的第一个主题
                  const first = topicCounts.find((t) => t.count > 0)
                  if (first) setTopicFilter(first.label as Topic)
                } else {
                  setTopicFilter('全部')
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (topicFilter === '全部') {
                    const first = topicCounts.find((t) => t.count > 0)
                    if (first) setTopicFilter(first.label as Topic)
                  } else {
                    setTopicFilter('全部')
                  }
                }
              }}
              title="按主题快速筛选"
            >
              <Filter size={24} />
              <div>
                <strong>{topicCounts.length}</strong>
                <span>主题覆盖</span>
              </div>
            </div>
          </div>

          {topicCounts.length > 0 && (
            <div className="wb-subject-bars">
              {topicCounts.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className={`wb-subject-bar ${topicFilter === t.label ? 'active' : ''}`}
                  onClick={() => setTopicFilter(topicFilter === t.label ? '全部' : t.label)}
                >
                  <strong>{t.count}</strong>
                  <div className="wb-subject-bar-track">
                    <span style={{ width: `${(t.count / maxTopicCount) * 100}%` }} />
                  </div>
                  <small>{t.label}</small>
                </button>
              ))}
            </div>
          )}

          <div className="wb-filter-row">
            <button
              type="button"
              className={`wb-filter-chip ${reviewFilter === '全部' && topicFilter === '全部' ? 'active' : ''}`}
              onClick={() => { setTopicFilter('全部'); setReviewFilter('全部') }}
            >全部错题</button>
            <button
              type="button"
              className={`wb-filter-chip ${reviewFilter === '待复习' ? 'active' : ''}`}
              onClick={() => setReviewFilter(reviewFilter === '待复习' ? '全部' : '待复习')}
            >待复习</button>
            {presentTopics.map((t) => (
              <button
                key={t}
                type="button"
                className={`wb-filter-chip ${topicFilter === t ? 'active' : ''}`}
                onClick={() => setTopicFilter(topicFilter === t ? '全部' : t)}
              >{t}</button>
            ))}
          </div>

          <div className="wb-list">
            {filtered.map((q) => (
              <WrongCard
                key={q.id}
                question={q}
                isOpen={expanded === q.id}
                onToggle={() => setExpanded(expanded === q.id ? null : q.id)}
                onMarkReviewed={() => toggleWrongReviewed(q.id)}
                onRemove={() => removeWrongQuestion(q.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="wb-empty-filter" role="status">当前筛选下没有错题，换个筛选看看吧。</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function WrongCard({ question, isOpen, onToggle, onMarkReviewed, onRemove }: {
  question: WrongQuestion
  isOpen: boolean
  onToggle: () => void
  onMarkReviewed: () => void
  onRemove: () => void
}) {
  return (
    <div className={`wb-card ${question.reviewed ? 'reviewed' : 'pending'}`}>
      <div className="wb-card-header" onClick={onToggle} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle() }}>
        <span className="wb-subject-tag">{question.topic}</span>
        <span className="wb-tag">{question.partTitle}</span>
        <span className="wb-time">{relativeTime(question.occurredAt)}</span>
      </div>

      <p className="wb-question">{question.prompt}</p>

      {isOpen && (
        <div className="wb-detail">
          <div className="wb-answer wrong">
            <small>你的答案</small>
            <strong>{question.options[question.pickedIndex] ?? '—'}</strong>
          </div>
          <div className="wb-answer correct">
            <small>正确答案</small>
            <strong>{question.options[question.answerIndex] ?? '—'}</strong>
          </div>
          {question.explanation && (
            <p className="wb-explanation">{question.explanation}</p>
          )}
        </div>
      )}

      <div className="wb-card-footer">
        <button
          type="button"
          className="wb-action-btn"
          onClick={(e) => { e.stopPropagation(); onMarkReviewed() }}
        >
          <RotateCcw size={14} /> {question.reviewed ? '标记为待复习' : '我已掌握'}
        </button>
        <button
          type="button"
          className="wb-action-btn ghost"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
        >
          <Trash2 size={14} /> 删除
        </button>
        {question.reviewed && <span className="wb-reviewed-tag">已复习</span>}
      </div>
    </div>
  )
}
