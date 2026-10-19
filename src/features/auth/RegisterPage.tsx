import { useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Mail, ShieldCheck } from 'lucide-react'
import { useAppState } from '../../app/AppState'
import { GRADE_LABELS, PRIMARY_GRADES, type PrimaryGrade } from '../../app/learning'
import { AuthLayout } from './AuthLayout'
import { isGuardianConsentRequired } from './age'

type RegisterPageProps = {
  onBack: () => void
  onGuardianRequired: () => void
}

export function RegisterPage({ onBack, onGuardianRequired }: RegisterPageProps) {
  const { setGrade } = useAppState()
  const today = new Date()
  const [grade, setLocalGrade] = useState<PrimaryGrade | ''>('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(0)

  const birthDate = formatBirthDate(birthYear, birthMonth, birthDay)
  const selectedDate = birthDate ? new Date(`${birthDate}T00:00:00`) : null
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay()
  const yearOptions = Array.from({ length: 101 }, (_, index) => today.getFullYear() - index)

  function openCalendar() {
    if (selectedDate) {
      setCalendarYear(selectedDate.getFullYear())
      setCalendarMonth(selectedDate.getMonth())
    } else {
      setCalendarYear(today.getFullYear())
      setCalendarMonth(today.getMonth())
    }
    setCalendarOpen(true)
  }

  function moveMonth(direction: -1 | 1) {
    const next = new Date(calendarYear, calendarMonth + direction, 1)
    const isAfterCurrentMonth = next.getFullYear() > today.getFullYear()
      || (next.getFullYear() === today.getFullYear() && next.getMonth() > today.getMonth())
    if (!isAfterCurrentMonth) {
      setCalendarYear(next.getFullYear())
      setCalendarMonth(next.getMonth())
    }
  }

  function pickDate(day: number) {
    setBirthYear(String(calendarYear))
    setBirthMonth(String(calendarMonth + 1))
    setBirthDay(String(day))
    setCalendarOpen(false)
  }

  function requestCode() {
    setCountdown(60)
    setMessage('页面初版未连接验证码服务，请继续体验表单结构')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!birthDate) {
      setMessage('请填写完整且有效的出生日期')
      return
    }
    if (!grade) {
      setMessage('请选择年级')
      return
    }
    setGrade(grade)
    if (isGuardianConsentRequired(birthDate)) {
      onGuardianRequired()
      return
    }
    setMessage('演示注册信息已检查，可返回登录页体验')
  }

  return (
    <AuthLayout title="创建学习账号" subtitle="选择你的年级，为你准备合适的学习体验" backAction={<button className="text-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" size={18} />返回登录</button>}>
      <form className="auth-card auth-form-grid" onSubmit={submit}>
        <label>选择年级<select required aria-label="选择年级" value={grade} onChange={(event) => setLocalGrade(event.target.value as PrimaryGrade)}><option value="">请选择年级</option>{PRIMARY_GRADES.map((id) => <option key={id} value={id}>{GRADE_LABELS[id]}</option>)}</select></label>
        <fieldset className="birth-date-field">
          <legend>出生日期</legend>
          <div className="birth-date-input-row" role="group" aria-label="出生日期输入">
            <label className="birth-date-segment">
              <span className="sr-only">出生年</span>
              <input aria-label="出生年" type="number" inputMode="numeric" min="1900" max={today.getFullYear()} placeholder="年份" value={birthYear} onChange={(event) => setBirthYear(event.target.value)} required />
              <span aria-hidden="true">年</span>
            </label>
            <label className="birth-date-segment">
              <span className="sr-only">出生月</span>
              <input aria-label="出生月" type="number" inputMode="numeric" min="1" max="12" placeholder="月份" value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)} required />
              <span aria-hidden="true">月</span>
            </label>
            <label className="birth-date-segment">
              <span className="sr-only">出生日</span>
              <input aria-label="出生日" type="number" inputMode="numeric" min="1" max="31" placeholder="日期" value={birthDay} onChange={(event) => setBirthDay(event.target.value)} required />
              <span aria-hidden="true">日</span>
            </label>
            <button className="birth-date-calendar-button" type="button" aria-label="打开日期选择器" aria-expanded={calendarOpen} onClick={openCalendar}>
              <CalendarDays aria-hidden="true" size={20} />
            </button>
          </div>
          <small>可直接填数字，或点右侧日历选择</small>

          {calendarOpen && (
            <section className="birth-calendar birth-calendar-inline" role="dialog" aria-label="选择出生日期">
              <div className="birth-calendar-head">
                <div>
                  <span>选择出生日期</span>
                  <strong>{calendarYear} 年 {calendarMonth + 1} 月</strong>
                </div>
                <button type="button" className="calendar-close" aria-label="关闭日期选择器" onClick={() => setCalendarOpen(false)}>×</button>
              </div>
              <div className="birth-calendar-controls">
                <select aria-label="选择年份" value={calendarYear} onChange={(event) => setCalendarYear(Number(event.target.value))}>
                  {yearOptions.map((year) => <option key={year} value={year}>{year} 年</option>)}
                </select>
                <div className="calendar-month-switch">
                  <button type="button" aria-label="上一个月" onClick={() => moveMonth(-1)}><ChevronLeft aria-hidden="true" size={18} /></button>
                  <span>{calendarMonth + 1} 月</span>
                  <button type="button" aria-label="下一个月" onClick={() => moveMonth(1)} disabled={calendarYear === today.getFullYear() && calendarMonth === today.getMonth()}><ChevronRight aria-hidden="true" size={18} /></button>
                </div>
              </div>
              <div className="calendar-weekdays" aria-hidden="true">{['日', '一', '二', '三', '四', '五', '六'].map((weekday) => <span key={weekday}>{weekday}</span>)}</div>
              <div className="calendar-days">
                {Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1
                  const date = new Date(calendarYear, calendarMonth, day)
                  const isFuture = date > new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const isSelected = selectedDate?.getFullYear() === calendarYear && selectedDate.getMonth() === calendarMonth && selectedDate.getDate() === day
                  return (
                    <button key={day} type="button" aria-label={`${calendarYear}年${calendarMonth + 1}月${day}日`} aria-pressed={isSelected} className={isSelected ? 'selected' : ''} disabled={isFuture} onClick={() => pickDate(day)}>{day}</button>
                  )
                })}
              </div>
              <button type="button" className="calendar-today" onClick={() => { setCalendarYear(today.getFullYear()); setCalendarMonth(today.getMonth()) }}>回到本月</button>
            </section>
          )}
        </fieldset>
        <label>学习账号／学习码<input required /></label>
        <label>手机号／邮箱<div className="input-with-icon"><Mail aria-hidden="true" size={18} /><input type="text" required /></div></label>
        <label>验证码<div className="code-row"><input required /><button type="button" onClick={requestCode}>{countdown ? `${countdown} 秒` : '获取验证码'}</button></div></label>
        <label>设置密码<input type="password" required autoComplete="new-password" /></label>
        {message && <p className="form-alert calm" role="status">{message}</p>}
        <button className="primary-button" type="submit"><ShieldCheck aria-hidden="true" size={18} />检查并继续</button>
      </form>
    </AuthLayout>
  )
}

function formatBirthDate(yearText: string, monthText: string, dayText: string) {
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return ''

  const date = new Date(year, month - 1, day)
  const today = new Date()
  const latestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > latestDate) return ''

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
