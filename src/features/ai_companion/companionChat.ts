import type { LearningStage } from '../../app/model'

type CompanionReplyRequest = {
  stage: LearningStage
  companionId: string
  question: string
}

const STUDENT_FACING_ERROR = '伙伴暂时没听清，我们换个简单的问题试试。'

export async function requestCompanionReply({ stage, companionId, question }: CompanionReplyRequest): Promise<string> {
  const response = await fetch('/api/companion/reply', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ stage, companionId, question: question.trim() }),
  })

  if (!response.ok) throw new Error(STUDENT_FACING_ERROR)

  const body = await response.json() as { reply?: unknown }
  if (typeof body.reply !== 'string' || !body.reply.trim()) throw new Error(STUDENT_FACING_ERROR)

  return body.reply.trim()
}
