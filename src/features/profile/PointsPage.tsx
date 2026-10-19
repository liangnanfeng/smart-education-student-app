import { ArrowLeft, Plus, Sparkles, Minus } from 'lucide-react'
import { useAppState } from '../../app/AppState'
import { getPointsSummary } from '../../app/points'
import './profile.css'

export function PointsPage({ onBack }: { onBack: () => void }) {
  const { state } = useAppState()
  const summary = getPointsSummary(state.transactions)

  return (
    <div className="rewards-page points-page">
      <header className="profile-page-header">
        <button className="profile-back" type="button" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1>积分账户</h1>
      </header>

      <div className="points-balance-card">
        <Sparkles aria-hidden="true" size={28} />
        <div>
          <span>当前积分</span>
          <strong>{summary.balance.toLocaleString('zh-CN')}</strong>
        </div>
      </div>

      <div className="points-summary">
        <div><span>累计获得</span><strong>+{summary.earned.toLocaleString('zh-CN')}</strong></div>
        <div><span>累计消耗</span><strong>-{summary.spent.toLocaleString('zh-CN')}</strong></div>
      </div>

      <h3 className="detail-section-title">收支明细</h3>
      <ul className="points-list">
        {[...state.transactions].reverse().map((record) => (
          <li key={record.id} className={`points-item ${record.amount > 0 ? 'earn' : 'spend'}`}>
            <div className="points-icon">{record.amount > 0 ? <Plus size={16} /> : <Minus size={16} />}</div>
            <div className="points-copy">
              <strong>{record.title}</strong>
              <small>{record.occurredAt}</small>
            </div>
            <span className="points-amount">
              {record.amount > 0 ? '+' : ''}{record.amount.toLocaleString('zh-CN')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
