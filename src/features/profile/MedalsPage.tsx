import { ArrowLeft, Medal, Star } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import { getGradeBand, type PrimaryGrade } from '../../app/learning'
import { getCourseForBand } from '../knowledge/courseCatalog'
import { deriveCourseMedals, growthMedals } from './medalsData'
import { MedalIcon } from './MedalIcon'
import './profile.css'

type MedalFilter = '全部' | '已获得' | '待解锁'

export function MedalsPage({ onBack }: { onBack: () => void }) {
  const { state } = useAppState()
  const [filter, setFilter] = useState<MedalFilter>('全部')
  const band = getGradeBand(state.grade as PrimaryGrade)
  const course = getCourseForBand(band)
  const progress = state.learningProgress[band]
  const courseMedals = deriveCourseMedals(course, progress)
  const finaleEarned = course.parts.every((part) => (
    progress.knowledgeCompleted.includes(part.id)
    && progress.testsPassed.includes(part.id)
  ))
  const courseEarnedCount = courseMedals.filter((medal) => medal.earned).length
  const growthEarnedCount = growthMedals.filter((medal) => medal.earned).length
  const earnedCount = courseEarnedCount + growthEarnedCount + (finaleEarned ? 1 : 0)
  const totalCount = courseMedals.length + growthMedals.length + 1
  const matchesFilter = (earned: boolean) => (
    filter === '全部' || (filter === '已获得' ? earned : !earned)
  )

  const filteredCourseMedals = courseMedals.filter((medal) => matchesFilter(medal.earned))
  const filteredGrowthMedals = growthMedals.filter((medal) => matchesFilter(medal.earned))

  return (
    <div className="rewards-page medals-page">
      <header className="profile-page-header">
        <button className="profile-back" type="button" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1>我的勋章</h1>
      </header>

      <div className="rewards-summary">
        <div
          className={`rewards-stat clickable ${filter === '已获得' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setFilter(filter === '已获得' ? '全部' : '已获得')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFilter(filter === '已获得' ? '全部' : '已获得') }}
        >
          <Medal size={24} />
          <div>
            <strong>{earnedCount}</strong>
            <span>已获得</span>
          </div>
        </div>
        <div
          className={`rewards-stat clickable ${filter === '待解锁' ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setFilter(filter === '待解锁' ? '全部' : '待解锁')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFilter(filter === '待解锁' ? '全部' : '待解锁') }}
        >
          <Star size={24} />
          <div>
            <strong>{totalCount - earnedCount}</strong>
            <span>待解锁</span>
          </div>
        </div>
      </div>

      <div className="wb-filter-row">
        {(['全部', '已获得', '待解锁'] as MedalFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`wb-filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <h3 className="detail-section-title">
        课程徽章
        <span style={{ color: 'var(--muted)', fontSize: '0.7em', marginLeft: '8px', fontWeight: 500 }}>
          已获得 {courseEarnedCount} 枚课程徽章
        </span>
      </h3>
      <ul className="medal-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {filteredCourseMedals.map((medal) => (
          <li key={medal.partId} className={`medal-card ${medal.earned ? 'earned' : 'locked'}`}>
            <div className="medal-icon" aria-hidden="true">{medal.icon}</div>
            <strong>{medal.name}</strong>
            <small>{medal.description}</small>
            <span className="lock-tag">{medal.progressText}</span>
          </li>
        ))}
      </ul>

      <h3 className="detail-section-title">终章勋章</h3>
      {matchesFilter(finaleEarned) && (
        <ul className="medal-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <li className={`medal-card ${finaleEarned ? 'earned' : 'locked'}`}>
            <div className="medal-icon" aria-hidden="true">🏆</div>
            <strong>{course.finaleMedal.name}</strong>
            <small>{course.finaleMedal.description}</small>
            <span className="lock-tag">
              {finaleEarned ? '已点亮' : '完成全部课程知识与测试后点亮'}
            </span>
          </li>
        </ul>
      )}

      <h3 className="detail-section-title">成长勋章</h3>
      <ul className="medal-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {filteredGrowthMedals.map((medal) => (
          <li key={medal.id} className={`medal-card ${medal.earned ? 'earned' : 'locked'}`}>
            <MedalIcon medal={medal} />
            <strong>{medal.name}</strong>
            <small>{medal.desc}</small>
            {!medal.earned && <span className="lock-tag">未解锁</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
