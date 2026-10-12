import type { BandProgress, CoursePartId, GradeBand } from './learning'

export type RewardKind = 'knowledge' | 'test' | 'medal' | 'band' | 'starter' | 'purchase'

export type PointTransaction = {
  id: string
  eventId: string
  kind: RewardKind
  title: string
  amount: number
  occurredAt: string
}

export const REWARD_POINTS = {
  knowledge: 30,
  test: 50,
  medal: 20,
  band: 100,
} as const

export function getPointsBalance(records: PointTransaction[]) {
  return records.reduce((sum, record) => sum + record.amount, 0)
}

export function getPointsSummary(records: PointTransaction[]) {
  const earned = records
    .filter((record) => record.amount > 0)
    .reduce((sum, record) => sum + record.amount, 0)
  const spent = records
    .filter((record) => record.amount < 0)
    .reduce((sum, record) => sum + Math.abs(record.amount), 0)

  return { earned, spent, balance: earned - spent }
}

export function applyTransactionOnce<
  T extends { transactions: PointTransaction[]; processedRewardIds: string[] },
>(state: T, transaction: PointTransaction): T {
  if (state.processedRewardIds.includes(transaction.eventId)) return state

  return {
    ...state,
    transactions: [...state.transactions, transaction],
    processedRewardIds: [...state.processedRewardIds, transaction.eventId],
  }
}

export function buildProgressRewardTransactions(
  before: BandProgress,
  after: BandProgress,
  band: GradeBand,
  partIds: CoursePartId[],
  occurredAt: string,
): PointTransaction[] {
  const result: PointTransaction[] = []

  for (const partId of partIds) {
    const knowledgeNew = !before.knowledgeCompleted.includes(partId)
      && after.knowledgeCompleted.includes(partId)
    const testNew = !before.testsPassed.includes(partId)
      && after.testsPassed.includes(partId)
    const medalBefore = before.knowledgeCompleted.includes(partId)
      && before.testsPassed.includes(partId)
    const medalAfter = after.knowledgeCompleted.includes(partId)
      && after.testsPassed.includes(partId)

    if (knowledgeNew) {
      result.push(createTransaction(
        `knowledge:${partId}`,
        'knowledge',
        `完成知识：${partId}`,
        REWARD_POINTS.knowledge,
        occurredAt,
      ))
    }
    if (testNew) {
      result.push(createTransaction(
        `test:${partId}`,
        'test',
        `通过测试：${partId}`,
        REWARD_POINTS.test,
        occurredAt,
      ))
    }
    if (!medalBefore && medalAfter) {
      result.push(createTransaction(
        `medal:${partId}`,
        'medal',
        `点亮课程徽章：${partId}`,
        REWARD_POINTS.medal,
        occurredAt,
      ))
    }
  }

  const completeBefore = partIds.every((partId) => (
    before.knowledgeCompleted.includes(partId) && before.testsPassed.includes(partId)
  ))
  const completeAfter = partIds.every((partId) => (
    after.knowledgeCompleted.includes(partId) && after.testsPassed.includes(partId)
  ))

  if (!completeBefore && completeAfter) {
    result.push(createTransaction(
      `band:${band}`,
      'band',
      `${band} 终章奖励`,
      REWARD_POINTS.band,
      occurredAt,
    ))
  }

  return result
}

function createTransaction(
  eventId: string,
  kind: RewardKind,
  title: string,
  amount: number,
  occurredAt: string,
): PointTransaction {
  return { id: eventId, eventId, kind, title, amount, occurredAt }
}
