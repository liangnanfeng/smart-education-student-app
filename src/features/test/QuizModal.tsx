import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, XCircle, Lightbulb, Trophy, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import { useAppState } from '../../app/AppState'
import type { QuizChapter } from './quizData'
import './quiz-modal.css'

type Props = {
  levelTitle: string
  chapter: QuizChapter
  onClose: () => void
  onComplete: (score: number, total: number) => void
}

type Phase = 'intro' | 'question' | 'result'

export function QuizModal({ levelTitle, chapter, onClose, onComplete }: Props) {
  const { state } = useAppState()
  const [phase, setPhase] = useState<Phase>('intro')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | boolean | null)[]>(
    () => chapter.questions.map(() => null)
  )
  const [picked, setPicked] = useState<number | boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSitAnswer, setShowSitAnswer] = useState(false)

  // 锁定背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const total = chapter.questions.length
  const currentQ = chapter.questions[qIndex]

  const isCorrect = (): boolean => {
    if (!currentQ || picked === null) return false
    if (currentQ.kind === 'sel') return picked === currentQ.ans
    if (currentQ.kind === 'jud') return picked === currentQ.ans
    return false // sit 自评
  }

  const startQuiz = () => {
    setPhase('question')
    setQIndex(0)
    setPicked(null)
    setShowFeedback(false)
    setShowSitAnswer(false)
  }

  const pick = (v: number | boolean) => {
    if (showFeedback) return
    setPicked(v)
    setShowFeedback(true)
    setAnswers((prev) => {
      const next = [...prev]
      next[qIndex] = v
      return next
    })
  }

  const next = () => {
    if (qIndex + 1 < total) {
      setQIndex(qIndex + 1)
      setPicked(null)
      setShowFeedback(false)
      setShowSitAnswer(false)
    } else {
      // 计算得分（sit 不计分，只 sel/jud）
      let scored = 0
      let scorable = 0
      chapter.questions.forEach((q, i) => {
        if (q.kind === 'sel' || q.kind === 'jud') {
          scorable++
          if (q.kind === 'sel' && answers[i] === q.ans) scored++
          if (q.kind === 'jud' && answers[i] === q.ans) scored++
        }
      })
      setPhase('result')
      onComplete(scored, scorable)
    }
  }

  const retry = () => {
    setPhase('question')
    setQIndex(0)
    setPicked(null)
    setShowFeedback(false)
    setShowSitAnswer(false)
    setAnswers(chapter.questions.map(() => null))
  }

  // 重新渲染当前题目时同步 picked/feedback 状态（答题返回时用）
  useEffect(() => {
    if (phase === 'question') {
      const saved = answers[qIndex]
      setPicked(saved)
      setShowFeedback(saved !== null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, phase])

  const earnedCount = answers.filter((a, i) => {
    const q = chapter.questions[i]
    if (!q || a === null) return false
    if (q.kind === 'sel') return a === q.ans
    if (q.kind === 'jud') return a === q.ans
    return false
  }).length
  const scorableCount = chapter.questions.filter(q => q.kind === 'sel' || q.kind === 'jud').length
  const passed = phase === 'result' && earnedCount >= Math.ceil(scorableCount * 0.6)

  return createPortal(
    <div className={`quiz-overlay quiz-stage-${state.stage}`} role="dialog" aria-modal="true">
      <div className="quiz-modal">
        {/* 头部 */}
        <header className="quiz-header">
          <div className="quiz-titles">
            <p className="quiz-eyebrow">
              {chapter.pill ? `${chapter.pill} · 闯关答题` : '闯关答题'}
            </p>
            <h2 className="quiz-chapter-title">{levelTitle}</h2>
          </div>
          <button type="button" className="quiz-close" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </header>

        {/* 进度条 */}
        {phase === 'question' && (
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((qIndex + (showFeedback ? 1 : 0)) / total) * 100}%` }}
              />
            </div>
            <span className="quiz-progress-text">
              {qIndex + 1} / {total}
            </span>
          </div>
        )}

        {/* 内容区 */}
        <div className="quiz-body">
          {phase === 'intro' && (
            <div className="quiz-intro">
              <div className="quiz-intro-icon">
                <Sparkles size={28} />
              </div>
              <h3 className="quiz-intro-title">{chapter.title}</h3>
              <p className="quiz-intro-desc">
                共 {total} 道题，含选择、判断与情境题。答对 60% 即可通关，解锁下一关并收获宝石！
              </p>
              <button type="button" className="quiz-btn quiz-btn-primary" onClick={startQuiz}>
                开始答题 <ArrowRight size={18} />
              </button>
            </div>
          )}

          {phase === 'question' && currentQ && (
            <div className="quiz-question">
              <div className={`quiz-q-tag quiz-q-tag-${currentQ.kind}`}>
                {currentQ.kind === 'sel' && '选择题'}
                {currentQ.kind === 'jud' && '判断题'}
                {currentQ.kind === 'sit' && '情境题'}
              </div>
              <p className="quiz-q-text">{currentQ.q}</p>

              {currentQ.kind === 'sel' && (
                <div className="quiz-options">
                  {currentQ.opts.map((opt, oi) => {
                    const isPicked = picked === oi
                    const isAns = oi === currentQ.ans
                    let cls = 'quiz-option'
                    if (showFeedback) {
                      if (isAns) cls += ' quiz-option-correct'
                      else if (isPicked) cls += ' quiz-option-wrong'
                      else cls += ' quiz-option-dim'
                    } else if (isPicked) {
                      cls += ' quiz-option-picked'
                    }
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={cls}
                        onClick={() => pick(oi)}
                        disabled={showFeedback}
                      >
                        <span className="quiz-option-letter">{String.fromCharCode(65 + oi)}</span>
                        <span className="quiz-option-text">{opt}</span>
                        {showFeedback && isAns && <Check size={18} className="quiz-option-icon" />}
                        {showFeedback && isPicked && !isAns && <XCircle size={18} className="quiz-option-icon" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQ.kind === 'jud' && (
                <div className="quiz-jud-options">
                  {[
                    { val: true, label: '对', cls: 'jud-true' },
                    { val: false, label: '错', cls: 'jud-false' },
                  ].map((b) => {
                    const isPicked = picked === b.val
                    const isAns = b.val === currentQ.ans
                    let cls = `quiz-jud-btn ${b.cls}`
                    if (showFeedback) {
                      if (isAns) cls += ' quiz-jud-correct'
                      else if (isPicked) cls += ' quiz-jud-wrong'
                      else cls += ' quiz-jud-dim'
                    } else if (isPicked) {
                      cls += ' quiz-jud-picked'
                    }
                    return (
                      <button
                        key={String(b.val)}
                        type="button"
                        className={cls}
                        onClick={() => pick(b.val)}
                        disabled={showFeedback}
                      >
                        {b.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {currentQ.kind === 'sit' && (
                <div className="quiz-sit">
                  <div className="quiz-sit-hint">
                    <Lightbulb size={16} />
                    <span>提示：{currentQ.line}</span>
                  </div>
                  {!showSitAnswer ? (
                    <button
                      type="button"
                      className="quiz-btn quiz-btn-ghost"
                      onClick={() => { setShowSitAnswer(true); setShowFeedback(true) }}
                    >
                      查看参考答案
                    </button>
                  ) : (
                    <div className="quiz-sit-answer">
                      <span className="quiz-sit-answer-label">参考答案</span>
                      <p>{currentQ.ans}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 答题反馈 */}
              {showFeedback && currentQ.kind !== 'sit' && (
                <div className={`quiz-feedback ${isCorrect() ? 'quiz-feedback-ok' : 'quiz-feedback-no'}`}>
                  {isCorrect() ? <Check size={18} /> : <XCircle size={18} />}
                  <span>{isCorrect() ? '答对了！真棒～' : '答错啦，再想想'}</span>
                </div>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="quiz-result">
              <div className={`quiz-result-medal ${passed ? 'medal-win' : 'medal-try'}`}>
                {passed ? <Trophy size={40} /> : <RotateCcw size={40} />}
              </div>
              <h3 className="quiz-result-title">
                {passed ? '通关成功！' : '再试一次吧'}
              </h3>
              <p className="quiz-result-score">
                答对 <strong>{earnedCount}</strong> / {scorableCount} 题
              </p>
              <p className="quiz-result-tip">
                {passed
                  ? `已解锁下一关，宝石 +${passed ? 30 : 0} ✨`
                  : '答对 60% 即可通关，回顾一下知识点再来挑战吧～'}
              </p>
              <div className="quiz-result-actions">
                {!passed && (
                  <button type="button" className="quiz-btn quiz-btn-ghost" onClick={retry}>
                    <RotateCcw size={16} /> 再来一次
                  </button>
                )}
                <button type="button" className="quiz-btn quiz-btn-primary" onClick={onClose}>
                  {passed ? '完成' : '返回地图'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部下一题按钮 */}
        {phase === 'question' && showFeedback && qIndex < total - 1 && (
          <footer className="quiz-footer">
            <button type="button" className="quiz-btn quiz-btn-primary quiz-next-btn" onClick={next}>
              下一题 <ArrowRight size={18} />
            </button>
          </footer>
        )}
        {phase === 'question' && showFeedback && qIndex === total - 1 && (
          <footer className="quiz-footer">
            <button type="button" className="quiz-btn quiz-btn-primary quiz-next-btn" onClick={next}>
              查看成绩 <ArrowRight size={18} />
            </button>
          </footer>
        )}
      </div>
    </div>,
    document.body
  )
}
