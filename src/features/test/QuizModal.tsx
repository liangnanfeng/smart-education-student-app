import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, BookOpen, Check, RotateCcw, Trophy, X, XCircle } from 'lucide-react'
import { useAppState } from '../../app/AppState'
import type { QuizChapter } from '../knowledge/courseCatalog'
import './quiz-modal.css'

type QuizResult = {
  score: number
  total: number
  passed: boolean
}

type Props = {
  levelTitle: string
  chapter: QuizChapter
  partNumber: number
  result: QuizResult | null
  onClose: () => void
  onComplete: (score: number, total: number) => void
  onRetry: () => void
  onReviewKnowledge: () => void
}

// 依据课程部分标题推断错题主题，与错题本主题分类（认识 AI / 观察识别 / 语音交互 / 数据与算法 / 安全与责任）对齐。
function inferTopic(partId: string, partTitle: string): string {
  const text = `${partId} ${partTitle}`
  if (/qmx-1|ael-1|认识 AI|启明星|AI 系统|是什么|超能力图鉴/.test(text)) return '认识 AI'
  if (/qmx-3|ael-4|眼睛|图像|识别|拍照|实验/.test(text)) return '观察识别'
  if (/qmx-4|耳朵|语音|听/.test(text)) return '语音交互'
  if (/qmx-5|ael-2|ael-3|ael-5|智慧|数据|算法|训练|学习|评委|评价/.test(text)) return '数据与算法'
  if (/qmx-8|ael-8|城堡|安全|隐私|守护/.test(text)) return '安全与责任'
  return '综合探索'
}

export function QuizModal({
  levelTitle,
  chapter,
  partNumber,
  result,
  onClose,
  onComplete,
  onRetry,
  onReviewKnowledge,
}: Props) {
  const { addWrongQuestion, removeWrongQuestion } = useAppState()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => chapter.questions.map(() => null))
  const currentQuestion = chapter.questions[questionIndex]
  const picked = answers[questionIndex]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function pick(answerIndex: number) {
    if (picked !== null || result) return
    const question = currentQuestion
    setAnswers((previous) => {
      const next = [...previous]
      next[questionIndex] = answerIndex
      return next
    })

    // 答错：写入错题本（同题覆盖旧记录）；答对：如果之前在错题本里，自动移除。
    if (answerIndex !== question.answerIndex) {
      addWrongQuestion({
        id: question.id,
        partId: chapter.partId,
        partTitle: levelTitle,
        topic: inferTopic(chapter.partId, levelTitle),
        prompt: question.prompt,
        options: question.options,
        answerIndex: question.answerIndex,
        pickedIndex: answerIndex,
        explanation: question.explanation,
        occurredAt: new Date().toISOString(),
        reviewed: false,
      })
    } else {
      removeWrongQuestion(question.id)
    }
  }

  function next() {
    if (picked === null) return
    if (questionIndex < chapter.questions.length - 1) {
      setQuestionIndex((index) => index + 1)
      return
    }
    const score = chapter.questions.reduce((total, question, index) => (
      total + (answers[index] === question.answerIndex ? 1 : 0)
    ), 0)
    onComplete(score, chapter.questions.length)
  }

  function retry() {
    setQuestionIndex(0)
    setAnswers(chapter.questions.map(() => null))
    onRetry()
  }

  return createPortal(
    <div className="quiz-overlay" role="dialog" aria-modal="true" aria-label={`${levelTitle}答题`}>
      <div className="quiz-modal quiz-modal--catalog">
        <header className="quiz-header">
          <div className="quiz-titles">
            <p className="quiz-eyebrow">第 {partNumber} 部分 · 闯关答题</p>
            <h2 className="quiz-chapter-title">{levelTitle}</h2>
          </div>
          <button type="button" className="quiz-close" onClick={onClose} aria-label="关闭">
            <X size={20} />
          </button>
        </header>

        {!result && currentQuestion && (
          <>
            <div className="quiz-progress">
              <div className="quiz-progress-bar">
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${((questionIndex + (picked === null ? 0 : 1)) / chapter.questions.length) * 100}%` }}
                />
              </div>
              <span className="quiz-progress-text">{questionIndex + 1} / {chapter.questions.length}</span>
            </div>
            <div className="quiz-body">
              <div className="quiz-question">
                <div className={`quiz-q-tag quiz-q-tag-${currentQuestion.type}`}>
                  {currentQuestion.type === 'choice' && '选择题'}
                  {currentQuestion.type === 'judgment' && '判断题'}
                  {currentQuestion.type === 'scenario' && '情境题'}
                </div>
                <p className="quiz-q-text">{currentQuestion.prompt}</p>
                <div className={currentQuestion.type === 'judgment' ? 'quiz-jud-options' : 'quiz-options'}>
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isPicked = picked === optionIndex
                    const isCorrect = optionIndex === currentQuestion.answerIndex
                    const answered = picked !== null
                    const className = [
                      currentQuestion.type === 'judgment' ? 'quiz-jud-btn' : 'quiz-option',
                      answered && isCorrect ? currentQuestion.type === 'judgment' ? 'quiz-jud-correct' : 'quiz-option-correct' : '',
                      answered && isPicked && !isCorrect ? currentQuestion.type === 'judgment' ? 'quiz-jud-wrong' : 'quiz-option-wrong' : '',
                      answered && !isPicked && !isCorrect ? currentQuestion.type === 'judgment' ? 'quiz-jud-dim' : 'quiz-option-dim' : '',
                    ].filter(Boolean).join(' ')
                    return (
                      <button
                        key={option}
                        type="button"
                        className={className}
                        aria-label={option}
                        onClick={() => pick(optionIndex)}
                        disabled={answered}
                      >
                        {currentQuestion.type !== 'judgment' && (
                          <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                        )}
                        <span className="quiz-option-text">{option}</span>
                        {answered && isCorrect && <Check size={18} className="quiz-option-icon" />}
                        {answered && isPicked && !isCorrect && <XCircle size={18} className="quiz-option-icon" />}
                      </button>
                    )
                  })}
                </div>
                {picked !== null && (
                  <div className={`quiz-feedback ${picked === currentQuestion.answerIndex ? 'quiz-feedback-ok' : 'quiz-feedback-no'}`}>
                    {picked === currentQuestion.answerIndex ? <Check size={18} /> : <XCircle size={18} />}
                    <span>{currentQuestion.explanation}</span>
                  </div>
                )}
              </div>
            </div>
            {picked !== null && (
              <footer className="quiz-footer">
                <button type="button" className="quiz-btn quiz-btn-primary quiz-next-btn" onClick={next}>
                  {questionIndex === chapter.questions.length - 1 ? '查看成绩' : '下一题'} <ArrowRight size={18} />
                </button>
              </footer>
            )}
          </>
        )}

        {result && (
          <div className="quiz-body">
            <div className="quiz-result">
              <div className={`quiz-result-medal ${result.passed ? 'medal-win' : 'medal-try'}`}>
                {result.passed ? <Trophy size={40} /> : <RotateCcw size={40} />}
              </div>
              <h3 className="quiz-result-title">{result.passed ? '通关成功！' : '再试一次吧'}</h3>
              <p className="quiz-result-score">答对 <strong>{result.score}</strong> / {result.total} 题</p>
              <p className="quiz-result-tip">
                {result.passed ? '挑战结果已保存，新的路线正在展开。' : '回顾对应知识后再挑战，答对 60% 即可通关。'}
              </p>
              <div className="quiz-result-actions">
                {result.passed ? (
                  <button type="button" className="quiz-btn quiz-btn-primary" onClick={onClose}>完成</button>
                ) : (
                  <>
                    <button type="button" className="quiz-btn quiz-btn-ghost" onClick={onReviewKnowledge}>
                      <BookOpen size={16} /> 回顾第 {partNumber} 部分知识
                    </button>
                    <button type="button" className="quiz-btn quiz-btn-primary" onClick={retry}>
                      <RotateCcw size={16} /> 再试一次
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
