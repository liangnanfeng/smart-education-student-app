import { describe, expect, it } from 'vitest'
import { buildDeepSeekPayload, prepareStudentQuestion, prepareStudentReply } from './companionPolicy.mjs'

describe('companion proxy policy', () => {
  it('uses DeepSeek Flash without thinking for a short elementary reply', () => {
    const question = prepareStudentQuestion('elementary', '  为什么天会下雨？  ')
    const payload = buildDeepSeekPayload(question)

    expect(payload.model).toBe('deepseek-flash')
    expect(payload.thinking).toEqual({ type: 'disabled' })
    expect(payload.max_tokens).toBe(120)
    expect(payload.messages[1].content).toBe('为什么天会下雨？')
    expect(payload.messages[0].content).toContain('小学生')
  })

  it('handles insulting or self-harm requests locally instead of sending them to the provider', () => {
    expect(prepareStudentQuestion('secondary', '我想自杀').directReply).toContain('可信任的成年人')
    expect(prepareStudentQuestion('elementary', '你真垃圾').directReply).toContain('尊重')
  })

  it('keeps the final bubble reply short and replaces unsafe output', () => {
    expect(prepareStudentReply('当然可以，我们从一个小实验开始。')).toBe('当然可以，我们从一个小实验开始。')
    expect(prepareStudentReply('你很笨，别问了。')).toContain('换个方式')
  })

  it('does not send private contact information to the model', () => {
    const result = prepareStudentQuestion('elementary', '我的手机号是13800138000')

    expect(result.directReply).toContain('隐私')
  })

  it('asks a stage-appropriate follow-up instead of guessing an unclear request', () => {
    expect(prepareStudentQuestion('elementary', '那个帮我弄一下').directReply).toContain('换一种说法')
    expect(prepareStudentQuestion('secondary', '那个帮我弄一下').directReply).toContain('补充一点')
  })

  it('returns a supportive escalation message for self-harm language', () => {
    const result = prepareStudentQuestion('secondary', '我想自杀')

    expect(result.directReply).toContain('可信任的成年人')
  })

  it('accepts every catalog companion identity while keeping one protected DeepSeek policy', () => {
    for (const companionId of ['momo', 'yunduo', 'cloudbloom', 'cloudbelle', 'nimbo', 'nimbli', 'aether', 'yunluo']) {
      const prepared = prepareStudentQuestion('elementary', '为什么天会下雨？', companionId)
      const payload = buildDeepSeekPayload(prepared)

      expect(payload.model).toBe('deepseek-flash')
      expect(payload.messages[0].content).toContain('AI 伙伴')
    }
  })
})
