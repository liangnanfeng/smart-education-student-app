import { ArrowLeft, Check, Camera, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAppState } from '../../app/AppState'
import { GRADE_LABELS, PRIMARY_GRADES, type PrimaryGrade } from '../../app/learning'

const AVATAR_GRADIENTS = 5

export function ProfileEditPage({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { state, setProfile, setGrade } = useAppState()
  const [nickname, setNickname] = useState(state.nickname)
  const [avatar, setAvatar] = useState(state.avatar)
  const [grade, setLocalGrade] = useState<PrimaryGrade>(state.grade as PrimaryGrade)
  const [saved, setSaved] = useState(false)

  const trimmed = nickname.trim()
  const canSave = trimmed.length > 0 && trimmed.length <= 12
  const dirty =
    trimmed !== state.nickname ||
    avatar !== state.avatar ||
    grade !== state.grade

  const handleSave = () => {
    if (!canSave) return
    setProfile({ nickname: trimmed, avatar })
    if (grade !== state.grade) setGrade(grade)
    setSaved(true)
    window.setTimeout(onDone, 400)
  }

  return (
    <div className="profile-edit-page">
      <header className="profile-page-header">
        <button className="profile-back" type="button" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h1>编辑资料</h1>
      </header>

      <div className="profile-edit-avatar-section">
        <div className={`profile-avatar-large avatar-${avatar % AVATAR_GRADIENTS}`}>
          <UserRound size={60} />
        </div>
        <button
          className="profile-avatar-change"
          type="button"
          onClick={() => setAvatar((avatar + 1) % AVATAR_GRADIENTS)}
        >
          <Camera aria-hidden="true" size={14} />
          更换头像
        </button>
      </div>

      <section className="profile-edit-card">
        <label className="profile-edit-field">
          <span>昵称</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setSaved(false) }}
            placeholder="输入你的昵称"
            maxLength={12}
          />
        </label>
        <p className="profile-edit-hint">{trimmed.length}/12 个字符</p>

        <div className="profile-edit-field">
          <span>年级</span>
          <div className="profile-grade-grid" role="radiogroup" aria-label="选择年级">
            {PRIMARY_GRADES.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={grade === id}
                className={grade === id ? 'active' : ''}
                onClick={() => setLocalGrade(id)}
              >
                {GRADE_LABELS[id]}
              </button>
            ))}
          </div>
          <p className="profile-edit-hint">切换年级后，知识和闯关内容会同步更新</p>
        </div>

        <div className="profile-edit-field">
          <span>等级称号</span>
          <div className="profile-edit-readonly">Lv. 7 · 灵感探索者</div>
        </div>
      </section>

      <button
        className="profile-edit-btn"
        type="button"
        onClick={handleSave}
        disabled={!canSave || !dirty}
      >
        {saved ? <><Check aria-hidden="true" size={16} /> 已保存</> : '保存修改'}
      </button>
      {!canSave && <p className="profile-edit-hint center">昵称需为 1-12 个字符</p>}
    </div>
  )
}
