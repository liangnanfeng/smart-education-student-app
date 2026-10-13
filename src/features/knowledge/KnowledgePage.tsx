import { BookOpen, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import { GRADE_BAND_LABELS, getGradeBand, type CoursePartId, type PrimaryGrade } from '../../app/learning'
import { getCourseForBand, type CoursePart } from './courseCatalog'
import './knowledge.css'

type Props = {
  onOpenContent?: (courseId: string, chapterNum: number) => void
}

type PartStatus = 'completed' | 'current' | 'available'

const statusLabels: Record<PartStatus, string> = {
  completed: '已完成',
  current: '当前学习',
  available: '待学习',
}

const activityRows = (part: CoursePart) => [
  { icon: '💡', title: '核心知识', type: 'knowledge', typeLabel: '学知识', desc: part.concept },
  { icon: '🧪', title: '小实验', type: 'experiment', typeLabel: '做实验', desc: part.experiment },
  { icon: '🛡️', title: '安全提醒', type: 'knowledge', typeLabel: '保安全', desc: part.safety },
  { icon: '🎯', title: '本章挑战', type: 'try-it', typeLabel: '去挑战', desc: part.challenge },
] as const

export function KnowledgePage({ onOpenContent }: Props) {
  const { state } = useAppState()
  const band = getGradeBand(state.grade as PrimaryGrade)
  const course = getCourseForBand(band)
  const progress = state.learningProgress[band]
  const firstIncomplete = course.parts.find((part) => !progress.knowledgeCompleted.includes(part.id))?.id
  const [expandedPart, setExpandedPart] = useState<CoursePartId | null>(() => firstIncomplete ?? course.parts[0]?.id ?? null)
  const [showTreasure, setShowTreasure] = useState(false)

  function partStatus(part: CoursePart): PartStatus {
    if (progress.knowledgeCompleted.includes(part.id)) return 'completed'
    if (part.id === firstIncomplete) return 'current'
    return 'available'
  }

  return (
    <div className="knowledge-page" data-band={band}>
      <header className="knowledge-header">
        <div>
          <p className="knowledge-grade">{GRADE_BAND_LABELS[band]}</p>
          <h1>{course.name}</h1>
          <p className="knowledge-subtitle">{course.subtitle}</p>
        </div>
        <span className="knowledge-motto">{course.motto}</span>
      </header>

      <section className="knowledge-plan-card">
        <div className="plan-card-head">
          <h2>{course.name}计划</h2>
          <span className="plan-pill">
            <span className="plan-dot" />
            {course.parts.length} {course.id === 'qmx' ? '颗宝石' : '枚徽章'}挑战
          </span>
        </div>

        {course.parts.map((part) => {
          const status = partStatus(part)
          const isOpen = expandedPart === part.id
          const completed = status === 'completed'
          return (
            <div key={part.id} className={`day-card ${status} ${isOpen ? 'expanded' : ''}`}>
              <button
                type="button"
                className="day-title-row"
                aria-expanded={isOpen}
                onClick={() => setExpandedPart(isOpen ? null : part.id)}
              >
                <span className="day-label">{course.id === 'qmx' ? `第${part.number}天` : `第${part.number}章`}</span>
                <span className="day-island">{part.title}</span>
                <span className="day-steps">4 个环节</span>
                <span className={`day-badge ${status}`}>{statusLabels[status]}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isOpen && (
                <div className="day-body">
                  <div className="day-tag-row">
                    <span className="subject-tag">AI课</span>
                    <span className="subject-topic">{GRADE_BAND_LABELS[band]} · {part.title}</span>
                  </div>
                  <p className="chapter-summary">{part.summary}</p>
                  <div className="activity-list">
                    {activityRows(part).map((activity) => (
                      <div key={activity.title} className="activity-row">
                        <span className="activity-icon">{activity.icon}</span>
                        <div className="activity-text">
                          <div className="activity-title-row">
                            <span className="activity-title">{activity.title}</span>
                            <span className={`activity-chip ${activity.type}`}>{activity.typeLabel}</span>
                          </div>
                          <p className="activity-desc">{activity.desc}</p>
                        </div>
                        <span className="activity-state">
                          {completed ? (
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
                    <p>{part.challenge}</p>
                  </div>
                  {onOpenContent && (
                    <button
                      type="button"
                      className="read-content-btn"
                      onClick={() => onOpenContent(course.id, part.number)}
                    >
                      <BookOpen size={16} />
                      <span>阅读本{course.id === 'qmx' ? '集' : '章'}内容</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </section>

      <button type="button" className="treasure-toggle" onClick={() => setShowTreasure((value) => !value)}>
        <span>💎 {course.id === 'qmx' ? '宝石' : '徽章'}宝库</span>
        {showTreasure ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {showTreasure && (
        <section className="treasure-section">
          <div className="gem-grid">
            {course.medals.map((medal) => (
              <div key={medal.partId} className="gem-card">
                <div className="gem-head">
                  <span className="gem-icon">{medal.icon}</span>
                  <span className="gem-name">{medal.name}</span>
                </div>
                <p className="gem-source">{course.parts.find((part) => part.id === medal.partId)?.title}</p>
                <p className="gem-desc">{medal.description}</p>
              </div>
            ))}
          </div>
          <div className="achievement-banner">
            <span className="achievement-icon">🏅</span>
            <span className="achievement-text">完成全部学习，点亮「{course.finaleMedal.name}」！</span>
          </div>
        </section>
      )}
    </div>
  )
}
