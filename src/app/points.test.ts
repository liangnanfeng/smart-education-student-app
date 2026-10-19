import { describe, expect, it } from 'vitest'
import { makeCoursePartId } from './learning'
import {
  applyTransactionOnce,
  buildProgressRewardTransactions,
  getPointsBalance,
  getPointsSummary,
} from './points'

describe('points and progress rewards', () => {
  it('keeps balance and totals mathematically consistent', () => {
    const records = [
      { id: 'a', eventId: 'starter', kind: 'starter' as const, title: '启航积分', amount: 2000, occurredAt: '2026-10-12' },
      { id: 'b', eventId: 'purchase:yunduo', kind: 'purchase' as const, title: '购买云朵', amount: -360, occurredAt: '2026-10-12' },
    ]
    expect(getPointsBalance(records)).toBe(1640)
    expect(getPointsSummary(records)).toEqual({ earned: 2000, spent: 360, balance: 1640 })
  })

  it('does not append the same event twice', () => {
    const initial = { transactions: [], processedRewardIds: [] as string[] }
    const tx = { id: 'r1', eventId: 'knowledge:ael-1', kind: 'knowledge' as const, title: '完成知识', amount: 30, occurredAt: '2026-10-12' }
    const once = applyTransactionOnce(initial, tx)
    expect(applyTransactionOnce(once, tx)).toEqual(once)
  })

  it('awards 30, 50, 20 and the 100-point finale exactly once', () => {
    const partIds = [makeCoursePartId('ael', 1), makeCoursePartId('ael', 2)]
    const before = { knowledgeCompleted: [partIds[0]], testsPassed: [] }
    const after = { knowledgeCompleted: partIds, testsPassed: partIds }
    const txs = buildProgressRewardTransactions(before, after, 'grade5-6', partIds, '2026-10-12')
    expect(txs.map((tx) => tx.amount)).toEqual([50, 20, 30, 50, 20, 100])
    expect(new Set(txs.map((tx) => tx.eventId)).size).toBe(txs.length)
  })
})
