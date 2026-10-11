import { BookOpen, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import { getCourseData, type CourseActivity } from './knowledgeData'
import './knowledge.css'

const typeColors: Record<CourseActivity['type'], string> = {
  story: 'story',
  knowledge: 'knowledge',
  gem: 'gem',
  experiment: 'experiment',
  'try-it': 'try-it',
}

type Props = {
  onOpenContent?: (courseId: string, chapterNum: number) => void
}

export function KnowledgePage({ onOpenContent }: Props) {
  const { state } = useAppState()
  const course = getCourseData(state.stage, state.grade)
  const [expandedDay, setExpandedDay] = useState<string | null>('第一天')
  const [expandedCh, setExpandedCh] = useState<number | null>(1)
  const [showTreasure, setShowTreasure] = useState(false)

  return (
    <div className="knowledge-page">
      <header className="knowledge-header">
        <div>
          <p className="knowledge-grade">{course.gradeLabel}</p>
          <h1>{course.courseName}</h1>
          <p className="knowledge-subtitle">{course.subtitle}</p>
        </div>
        <span className="knowledge-motto">{course.motto}</span>
      </header>

      <section className="knowledge-plan-card">
        <div className="plan-card-head">
          <h2>{course.courseName}计划</h2>
          <span className="plan-pill">
            <span className="plan-dot" />
            {course.gems.length} {(course.id === 'qmx' ? '颗宝石' : '枚徽章')}挑战
          </span>
        </div>

        {course.days && course.days.map((d, di) => {
          const key = d.day
          const isOpen = expandedDay === key
          const allDone = d.activities.every((a) => a.done)
          return (
            <div key={key} className={`day-card ${isOpen ? 'expanded' : ''}`}>
              <button
                type="button"
                className="day-title-row"
                onClick={() => setExpandedDay(isOpen ? null : key)}
              >
                <span className="day-label">{d.day}</span>
                <span className="day-island">{d.island}</span>
                <span className="day-steps">{d.activities.length} 个环节</span>
                {allDone ? (
                  <span className="day-badge done">已完成</span>
                ) : (
                  <span className="day-badge locked">未解锁</span>
                )}
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="day-body">
                  <div className="day-tag-row">
                    <span className="subject-tag">AI课</span>
                    <span className="subject-topic">{course.gradeLabel} · {d.island}</span>
                  </div>
                  <div className="activity-list">
                    {d.activities.map((a, i) => (
                      <div key={i} className="activity-row">
                        <span className="activity-icon">{a.icon}</span>
                        <div className="activity-text">
                          <div className="activity-title-row">
                            <span className="activity-title">{a.title}</span>
                            <span className={`activity-chip ${typeColors[a.type]}`}>{a.typeLabel}</span>
                          </div>
                          <p className="activity-desc">{a.desc}</p>
                        </div>
                        <span className="activity-state">
                          {a.done ? (
                            <span className="check-circle"><Check size={14} strokeWidth={3} /></span>
                          ) : (
                            <Lock size={16} className="lock-icon" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="day-unlock">{d.unlockText}</p>
                  {onOpenContent && (
                    <button
                      type="button"
                      className="read-content-btn"
                      onClick={() => onOpenContent(course.id, di + 1)}
                    >
                      <BookOpen size={16} />
                      <span>阅读本集内容</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {course.chapters && course.chapters.map((ch) => {
          const isOpen = expandedCh === ch.num
          const allDone = ch.activities.every((a) => a.done)
          return (
            <div key={ch.num} className={`day-card ${isOpen ? 'expanded' : ''}`}>
              <button
                type="button"
                className="day-title-row"
                onClick={() => setExpandedCh(isOpen ? null : ch.num)}
              >
                <span className="day-label">第{ch.num}章</span>
                <span className="day-island">{ch.title}</span>
                <span className="day-steps">{ch.activities.length} 个环节</span>
                {allDone ? (
                  <span className="day-badge done">已完成</span>
                ) : (
                  <span className="day-badge locked">未解锁</span>
                )}
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="day-body">
                  <div className="day-tag-row">
                    <span className="subject-tag">AI课</span>
                    <span className="subject-topic">{course.gradeLabel} · {ch.badgeIcon} {ch.badge}</span>
                  </div>
                  <p className="chapter-summary">{ch.summary}</p>
                  <div className="activity-list">
                    {ch.activities.map((a, i) => (
                      <div key={i} className="activity-row">
                        <span className="activity-icon">{a.icon}</span>
                        <div className="activity-text">
                          <div className="activity-title-row">
                            <span className="activity-title">{a.title}</span>
                            <span className={`activity-chip ${typeColors[a.type]}`}>{a.typeLabel}</span>
                          </div>
                          <p className="activity-desc">{a.desc}</p>
                        </div>
                        <span className="activity-state">
                          {a.done ? (
                            <span className="check-circle"><Check size={14} strokeWidth={3} /></span>
                          ) : (
                            <Lock size={16} className="lock-icon" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="try-it-box">
                    <span className="try-it-label">试一试</span>
                    <p>{ch.tryIt}</p>
                  </div>
                  {onOpenContent && (
                    <button
                      type="button"
                      className="read-content-btn"
                      onClick={() => onOpenContent(course.id, ch.num)}
                    >
                      <BookOpen size={16} />
                      <span>阅读本章内容</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>

      <button
        type="button"
        className="treasure-toggle"
        onClick={() => setShowTreasure((v) => !v)}
      >
        <span>💎 {course.treasureBlurb}</span>
        {showTreasure ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {showTreasure && (
        <section className="treasure-section">
          <div className="gem-grid">
            {course.gems.map((g, i) => (
              <div key={i} className="gem-card">
                <div className="gem-head">
                  <span className="gem-icon">{g.icon}</span>
                  <span className="gem-name">{g.name}</span>
                </div>
                <p className="gem-source">{g.island}</p>
                <p className="gem-desc">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="safety-tips">
            <h3>🌟 安全小贴士</h3>
            {course.safetyTips.map((t, i) => (
              <div key={i} className="safety-item">
                <span className="safety-icon">{t.icon}</span>
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="achievement-banner">
            <span className="achievement-icon">🏅</span>
            <span className="achievement-text">
              {course.id === 'qmx' && '恭喜点亮启明星，你已经是「AI启明星·小新星」啦！'}
              {course.id === 'cxd' && '恭喜集齐六枚徽章，你已经是「AI创想家」啦！'}
              {course.id === 'lab' && '恭喜完成全部实验，你已经是「AI研究员」啦！'}
            </span>
          </div>
        </section>
      )}
    </div>
  )
}
