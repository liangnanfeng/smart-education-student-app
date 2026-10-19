# Primary-School-Only Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing dual-stage prototype into a coherent primary-school-only app for grades 1–6, with three grade bands, linked knowledge/test progress, idempotent rewards, a real points ledger, and a primary-only AI companion and mall.

**Architecture:** Replace `stage`-driven branching with a grade-to-band domain module and a versioned primary-only `AppState`. Course definitions use stable part IDs shared by knowledge, tests, maps, medals, and reward events; reducers atomically update progress, rewards, transactions, and purchases. Pages consume selectors from the same state instead of keeping completion, medal, or points data locally.

**Tech Stack:** React 19, TypeScript, React Router, Vite, Vitest, Testing Library, CSS, Node.js DeepSeek proxy

**Spec:** `docs/superpowers/specs/2026-10-12-primary-school-only-redesign-design.md`

## Global Constraints

- The product supports only `grade1` through `grade6`; public application state must not contain `LearningStage` or `stage`.
- Keep four equal bottom navigation destinations: 首页、知识、测试、我的. Knowledge and tests remain separate pages.
- Grade bands are exactly `grade1-2`, `grade3-4`, and `grade5-6`; changing grade inside a band preserves progress, changing bands selects that band's saved progress.
- Course mapping is fixed: `qmx` for grades 1–2, `cxd` for grades 3–4, and `ael` for grades 5–6.
- Knowledge must be completed before its matching test can start; a passing score is at least 60%; failed attempts do not deduct points.
- First completion rewards are exactly +30 knowledge, +50 test, +20 course medal, and +100 grade-band finale; reward event IDs make each award idempotent.
- The default account is grade 5, guardian-authorized, with knowledge parts 1–3 complete, tests 1–2 passed, medals 1–2 earned, Momo equipped, no outfit or decoration, and a 2,000-point balance.
- Default transactions are +90 knowledge, +100 tests, +40 medals, and +1,770 “成长体验账号启航积分”; cumulative earned and balance are both 2,000 with zero spend.
- Keep the current grade 1–2 full-ratio comic and grade 3–4 embedded-video plus original-platform link behavior.
- Rewrite the former secondary material for grades 5–6; no user-facing “中学端、初中、七至九年级” copy may remain.
- Keep DeepSeek, long-press speech, nearby reply bubble, drag position, login handoff, and child-safety restrictions; remove only secondary-specific personas and phrasing.
- The mall contains only the existing primary items; purchases atomically deduct points, add ownership, and append one spending transaction.
- Remove secondary code, tests, CSS branches, and public assets from the current tree; Git history is the recovery mechanism.
- Do not commit `.superpowers/` visual scratch output.

---

### Task 1: Introduce the primary grade, band, and course identity model

**Files:**
- Create: `src/app/learning.ts`
- Create: `src/app/learning.test.ts`

**Interfaces:**
- Consumes: no new application interfaces.
- Produces: `PrimaryGrade`, `GradeBand`, `CourseId`, `CoursePartId`, `PRIMARY_GRADES`, `GRADE_LABELS`, `getGradeBand(grade)`, `getCourseIdForBand(band)`, `makeCoursePartId(courseId, partNumber)`, `getPartIdsForBand(band)`, `createEmptyLearningProgress()`, and `isTestUnlocked(progress, partId)`.

- [ ] **Step 1: Write the failing domain tests**

```ts
// src/app/learning.test.ts
import { describe, expect, it } from 'vitest'
import {
  createEmptyLearningProgress,
  getCourseIdForBand,
  getGradeBand,
  isTestUnlocked,
  makeCoursePartId,
  PRIMARY_GRADES,
} from './learning'

describe('primary learning domain', () => {
  it('maps all six grades into the three approved bands', () => {
    expect(PRIMARY_GRADES).toEqual(['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'])
    expect(PRIMARY_GRADES.map(getGradeBand)).toEqual([
      'grade1-2', 'grade1-2', 'grade3-4', 'grade3-4', 'grade5-6', 'grade5-6',
    ])
  })

  it('maps each band to one course package', () => {
    expect(getCourseIdForBand('grade1-2')).toBe('qmx')
    expect(getCourseIdForBand('grade3-4')).toBe('cxd')
    expect(getCourseIdForBand('grade5-6')).toBe('ael')
  })

  it('unlocks a test only after matching knowledge is complete', () => {
    const progress = createEmptyLearningProgress()
    const id = makeCoursePartId('ael', 1)
    expect(isTestUnlocked(progress['grade5-6'], id)).toBe(false)
    progress['grade5-6'].knowledgeCompleted.push(id)
    expect(isTestUnlocked(progress['grade5-6'], id)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the focused test and verify the expected import failure**

Run: `npm test -- src/app/learning.test.ts --run`

Expected: FAIL because `src/app/learning.ts` does not exist.

- [ ] **Step 3: Implement the primary-only domain and simplify `model.ts`**

```ts
// src/app/learning.ts
export const PRIMARY_GRADES = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const
export type PrimaryGrade = typeof PRIMARY_GRADES[number]
export type GradeBand = 'grade1-2' | 'grade3-4' | 'grade5-6'
export type CourseId = 'qmx' | 'cxd' | 'ael'
export type CoursePartId = `${CourseId}-${number}`

export const GRADE_LABELS: Record<PrimaryGrade, string> = {
  grade1: '一年级', grade2: '二年级', grade3: '三年级',
  grade4: '四年级', grade5: '五年级', grade6: '六年级',
}

export const GRADE_BAND_LABELS: Record<GradeBand, string> = {
  'grade1-2': '1—2 年级',
  'grade3-4': '3—4 年级',
  'grade5-6': '5—6 年级',
}

export type BandProgress = {
  knowledgeCompleted: CoursePartId[]
  testsPassed: CoursePartId[]
}

export type LearningProgress = Record<GradeBand, BandProgress>

export const COURSE_PART_COUNTS: Record<GradeBand, number> = {
  'grade1-2': 8,
  'grade3-4': 6,
  'grade5-6': 9,
}

export function getGradeBand(grade: PrimaryGrade): GradeBand {
  if (grade === 'grade1' || grade === 'grade2') return 'grade1-2'
  if (grade === 'grade3' || grade === 'grade4') return 'grade3-4'
  return 'grade5-6'
}

export function getCourseIdForBand(band: GradeBand): CourseId {
  return { 'grade1-2': 'qmx', 'grade3-4': 'cxd', 'grade5-6': 'ael' }[band] as CourseId
}

export function makeCoursePartId(courseId: CourseId, partNumber: number): CoursePartId {
  if (!Number.isInteger(partNumber) || partNumber < 1) throw new Error('invalid_course_part')
  return `${courseId}-${partNumber}`
}

export function getPartIdsForBand(band: GradeBand): CoursePartId[] {
  const courseId = getCourseIdForBand(band)
  return Array.from({ length: COURSE_PART_COUNTS[band] }, (_, index) => makeCoursePartId(courseId, index + 1))
}

export function createEmptyLearningProgress(): LearningProgress {
  return {
    'grade1-2': { knowledgeCompleted: [], testsPassed: [] },
    'grade3-4': { knowledgeCompleted: [], testsPassed: [] },
    'grade5-6': { knowledgeCompleted: [], testsPassed: [] },
  }
}

export function isTestUnlocked(progress: BandProgress, partId: CoursePartId) {
  return progress.knowledgeCompleted.includes(partId)
}
```

- [ ] **Step 4: Run the domain test and TypeScript build**

Run: `npm test -- src/app/learning.test.ts --run && npm run build`

Expected: PASS. This task only adds the new domain module, so the existing app still builds before state migration begins.

- [ ] **Step 5: Commit the domain boundary**

```bash
git add src/app/learning.ts src/app/learning.test.ts
git commit -m "refactor: define primary-only learning domain"
```

---

### Task 2: Add a real points ledger and idempotent reward engine

**Files:**
- Create: `src/app/points.ts`
- Create: `src/app/points.test.ts`
- Modify: `src/app/learning.ts`

**Interfaces:**
- Consumes: `GradeBand`, `CoursePartId`, and `BandProgress` from Task 1.
- Produces: `PointTransaction`, `RewardKind`, `REWARD_POINTS`, `getPointsBalance(transactions)`, `getPointsSummary(transactions)`, `applyTransactionOnce(state, transaction)`, and `buildProgressRewardTransactions(before, after, band, partIds, occurredAt)`.

- [ ] **Step 1: Write failing ledger and reward tests**

```ts
// src/app/points.test.ts
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
```

- [ ] **Step 2: Run the focused test and verify missing exports**

Run: `npm test -- src/app/points.test.ts --run`

Expected: FAIL because `src/app/points.ts` does not exist.

- [ ] **Step 3: Implement signed transactions and deterministic event IDs**

```ts
// src/app/points.ts
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

export const REWARD_POINTS = { knowledge: 30, test: 50, medal: 20, band: 100 } as const

export function getPointsBalance(records: PointTransaction[]) {
  return records.reduce((sum, record) => sum + record.amount, 0)
}

export function getPointsSummary(records: PointTransaction[]) {
  const earned = records.filter((r) => r.amount > 0).reduce((sum, r) => sum + r.amount, 0)
  const spent = records.filter((r) => r.amount < 0).reduce((sum, r) => sum + Math.abs(r.amount), 0)
  return { earned, spent, balance: earned - spent }
}

export function applyTransactionOnce<T extends { transactions: PointTransaction[]; processedRewardIds: string[] }>(state: T, transaction: PointTransaction): T {
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
    const knowledgeNew = !before.knowledgeCompleted.includes(partId) && after.knowledgeCompleted.includes(partId)
    const testNew = !before.testsPassed.includes(partId) && after.testsPassed.includes(partId)
    const medalBefore = before.knowledgeCompleted.includes(partId) && before.testsPassed.includes(partId)
    const medalAfter = after.knowledgeCompleted.includes(partId) && after.testsPassed.includes(partId)
    if (knowledgeNew) result.push(tx(`knowledge:${partId}`, 'knowledge', `完成知识：${partId}`, 30, occurredAt))
    if (testNew) result.push(tx(`test:${partId}`, 'test', `通过测试：${partId}`, 50, occurredAt))
    if (!medalBefore && medalAfter) result.push(tx(`medal:${partId}`, 'medal', `点亮课程徽章：${partId}`, 20, occurredAt))
  }
  const completeBefore = partIds.every((id) => before.knowledgeCompleted.includes(id) && before.testsPassed.includes(id))
  const completeAfter = partIds.every((id) => after.knowledgeCompleted.includes(id) && after.testsPassed.includes(id))
  if (!completeBefore && completeAfter) result.push(tx(`band:${band}`, 'band', `${band} 终章奖励`, 100, occurredAt))
  return result
}

function tx(eventId: string, kind: RewardKind, title: string, amount: number, occurredAt: string): PointTransaction {
  return { id: eventId, eventId, kind, title, amount, occurredAt }
}
```

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- src/app/learning.test.ts src/app/points.test.ts --run`

Expected: PASS.

- [ ] **Step 5: Commit the reward engine**

```bash
git add src/app/learning.ts src/app/points.ts src/app/points.test.ts
git commit -m "feat: add idempotent learning rewards ledger"
```

---

### Task 3: Version storage and seed the approved grade-5 demonstration account

**Files:**
- Modify: `src/app/model.ts`
- Modify: `src/app/storage.ts`
- Replace: `src/app/companionState.test.ts`
- Create: `src/app/storage.test.ts`

**Interfaces:**
- Consumes: `LearningProgress`, `PointTransaction`, `CompanionLoadout`, and single `AiPosition`.
- Produces: `APP_STATE_VERSION = 2`, `createDefaultState(): AppState`, `loadState(): AppState`, and `saveState(state): void`.

- [ ] **Step 1: Write failing migration/default-state tests**

```ts
// src/app/storage.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultState } from './model'
import { loadState, saveState } from './storage'
import { getPointsBalance } from './points'

describe('primary-only state migration', () => {
  beforeEach(() => localStorage.clear())

  it('creates the approved guardian-authorized grade-5 account', () => {
    const state = createDefaultState()
    expect(state.grade).toBe('grade5')
    expect(state.guardian.authorised).toBe(true)
    expect(state.learningProgress['grade5-6']).toEqual({
      knowledgeCompleted: ['ael-1', 'ael-2', 'ael-3'],
      testsPassed: ['ael-1', 'ael-2'],
    })
    expect(state.companion.equipped).toEqual({ appearance: 'momo', outfit: null, decoration: null })
    expect(getPointsBalance(state.transactions)).toBe(2000)
  })

  it('replaces an old stage-based prototype state once without clearing unrelated keys', () => {
    localStorage.setItem('student-app-state', JSON.stringify({ stage: 'secondary', grade: 'grade8', pointsBalance: 999 }))
    localStorage.setItem('unrelated-preference', 'keep-me')
    const migrated = loadState()
    expect(migrated.stateVersion).toBe(2)
    expect(migrated.grade).toBe('grade5')
    expect(localStorage.getItem('unrelated-preference')).toBe('keep-me')
    saveState({ ...migrated, nickname: '新名字' })
    expect(loadState().nickname).toBe('新名字')
  })

  it('falls back safely when stored JSON is broken', () => {
    localStorage.setItem('student-app-state', '{broken')
    expect(loadState()).toEqual(createDefaultState())
  })
})
```

- [ ] **Step 2: Run the test and verify old-state assertions fail**

Run: `npm test -- src/app/storage.test.ts --run`

Expected: FAIL because the state still has stage-specific defaults and no versioned ledger.

- [ ] **Step 3: Implement the v2 default state and one-time project-key migration**

```ts
// essential additions in src/app/model.ts
export const APP_STATE_VERSION = 2 as const

export function createDefaultState(): AppState {
  return {
    stateVersion: APP_STATE_VERSION,
    grade: 'grade5',
    isLoggedIn: false,
    learningProgress: {
      'grade1-2': { knowledgeCompleted: [], testsPassed: [] },
      'grade3-4': { knowledgeCompleted: [], testsPassed: [] },
      'grade5-6': {
        knowledgeCompleted: ['ael-1', 'ael-2', 'ael-3'],
        testsPassed: ['ael-1', 'ael-2'],
      },
    },
    transactions: [
      { id: 'demo-knowledge', eventId: 'demo:knowledge', kind: 'knowledge', title: '已完成 3 个知识部分', amount: 90, occurredAt: '2026-10-12' },
      { id: 'demo-tests', eventId: 'demo:tests', kind: 'test', title: '已通过 2 个测试关卡', amount: 100, occurredAt: '2026-10-12' },
      { id: 'demo-medals', eventId: 'demo:medals', kind: 'medal', title: '已点亮 2 枚课程徽章', amount: 40, occurredAt: '2026-10-12' },
      { id: 'demo-starter', eventId: 'demo:starter', kind: 'starter', title: '成长体验账号启航积分', amount: 1770, occurredAt: '2026-10-12' },
    ],
    processedRewardIds: [
      'demo:knowledge', 'demo:tests', 'demo:medals', 'demo:starter',
      'knowledge:ael-1', 'knowledge:ael-2', 'knowledge:ael-3',
      'test:ael-1', 'test:ael-2', 'medal:ael-1', 'medal:ael-2',
    ],
    aiPosition: { x: 0.88, y: 0.84 },
    companion: {
      owned: { appearance: ['momo'], outfit: [], decoration: [] },
      equipped: { appearance: 'momo', outfit: null, decoration: null },
      version: 1,
    },
    fontScale: 'standard',
    nickname: '晨曦同学',
    avatar: 0,
    likes: [],
    favorites: [],
    notifications: 'important',
    accountId: 'chenxi_2026',
    passwordHint: '上次修改：30 天前',
    lastPasswordChange: '2026-08-05',
    twoFactorEnabled: false,
    guardian: { name: '陈女士', relationship: 'mother', phone: '138****6789', authorised: true },
    familyName: '晨曦家庭',
    devices: [
      { name: '当前设备 · 学习平板', lastActive: '刚刚', current: true },
      { name: '家里的学习平板', lastActive: '2 天前', current: false },
      { name: '爸爸的手机', lastActive: '3 周前', current: false },
    ],
    aiName: '小启',
    aiPersonality: 'encouraging',
    aiSkin: 0,
    voiceEnabled: true,
    autoListenEnabled: false,
    voiceMode: 'warm',
    saveHistory: true,
    aiMemoryEnabled: true,
    historyCount: 47,
    confirmDangerous: true,
    guardianApprove: false,
    safeMode: 'strict',
    soundEnabled: true,
    soundVolume: 70,
    hapticEnabled: true,
    showLearningStats: true,
    allowFriendFind: false,
    dataCollection: false,
    cameraPermission: 'prompt',
    micPermission: 'prompt',
    albumPermission: 'prompt',
    contentLevel: 'child',
    personalizedRec: true,
    storageUsed: 286,
    storageTotal: 2048,
    autoCleanDays: 30,
  }
}

export const defaultState = createDefaultState()
```

```ts
// src/app/storage.ts
const STORAGE_KEY = 'student-app-state'
const MIGRATION_KEY = 'student-app-primary-v2-migrated'

export function loadState(): AppState {
  const fresh = createDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fresh
    const parsed = JSON.parse(raw) as Partial<AppState> & { stage?: unknown }
    if (parsed.stateVersion !== APP_STATE_VERSION || 'stage' in parsed) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(MIGRATION_KEY, '1')
      saveState(fresh)
      return fresh
    }
    return normalizePrimaryState(parsed, fresh)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(MIGRATION_KEY, '1')
    saveState(fresh)
    return fresh
  }
}
```

Use this concrete normalizer so unknown runtime keys cannot re-enter the saved state:

```ts
function normalizePrimaryState(parsed: Partial<AppState>, fresh: AppState): AppState {
  const allowed = Object.fromEntries(
    (Object.keys(fresh) as Array<keyof AppState>).map((key) => [key, parsed[key] ?? fresh[key]]),
  ) as AppState
  const grade = PRIMARY_GRADES.includes(allowed.grade as PrimaryGrade) ? allowed.grade as PrimaryGrade : fresh.grade
  const learningProgress = createEmptyLearningProgress()
  for (const band of ['grade1-2', 'grade3-4', 'grade5-6'] as const) {
    const validIds = new Set(getPartIdsForBand(band))
    const stored = allowed.learningProgress?.[band]
    learningProgress[band] = {
      knowledgeCompleted: (stored?.knowledgeCompleted ?? []).filter((id): id is CoursePartId => validIds.has(id)),
      testsPassed: (stored?.testsPassed ?? []).filter((id): id is CoursePartId => validIds.has(id)),
    }
  }
  const companion = normalizePrimaryLoadout(allowed.companion, fresh.companion)
  return { ...allowed, stateVersion: APP_STATE_VERSION, grade, learningProgress, companion }
}
```

`normalizePrimaryLoadout` filters each owned list against IDs from the primary catalog, always restores `momo` to owned appearances, accepts an equipped ID only when it is owned in the matching category, and otherwise falls back to Momo/null/null.

- [ ] **Step 4: Run storage and companion defaults tests**

Run: `npm test -- src/app/storage.test.ts src/app/companionState.test.ts --run`

Expected: PASS with a single Momo loadout and 2,000-point ledger.

- [ ] **Step 5: Commit the state migration**

```bash
git add src/app/model.ts src/app/storage.ts src/app/storage.test.ts src/app/companionState.test.ts
git commit -m "refactor: migrate prototype state to primary-only v2"
```

---

### Task 4: Make the reducer own progress rewards and atomic mall purchases

**Files:**
- Modify: `src/app/AppState.tsx`
- Modify: `src/app/companionState.actions.test.tsx`
- Create: `src/app/learningState.actions.test.tsx`

**Interfaces:**
- Consumes: `getGradeBand`, course part IDs, `buildProgressRewardTransactions`, `applyTransactionOnce`, and `getPointsBalance`.
- Produces context methods `setGrade(grade)`, `completeKnowledge(partId, title)`, `passTest(partId, title)`, `purchaseCompanionItem(category, id, price, name)`, `equipCompanionItem(category, id)`, `unequipCompanionItem(category)`, `setAiPosition(position)`, and derived `pointsBalance`.

- [ ] **Step 1: Write failing reducer behavior tests**

```tsx
// src/app/learningState.actions.test.tsx
function Harness() {
  const app = useAppState()
  const band = getGradeBand(app.state.grade)
  return <>
    <output aria-label="balance">{app.pointsBalance}</output>
    <output aria-label="knowledge">{app.state.learningProgress[band].knowledgeCompleted.join(',')}</output>
    <output aria-label="tests">{app.state.learningProgress[band].testsPassed.join(',')}</output>
    <button onClick={() => app.completeKnowledge('ael-4', '第一次 AI 实验')}>完成知识</button>
    <button onClick={() => app.passTest('ael-4', '第一次 AI 实验')}>通过测试</button>
  </>
}

function GradeSwitchHarness() {
  const app = useAppState()
  const band = getGradeBand(app.state.grade)
  return <>
    <output aria-label="active progress">{app.state.learningProgress[band].knowledgeCompleted.join(',')}</output>
    <button onClick={() => app.setGrade('grade6')}>切到六年级</button>
    <button onClick={() => app.setGrade('grade3')}>切到三年级</button>
    <button onClick={() => app.setGrade('grade5')}>切回五年级</button>
  </>
}

it('awards knowledge, test and medal only on first completion', async () => {
  const user = userEvent.setup()
  render(<AppStateProvider><Harness /></AppStateProvider>)
  await user.click(screen.getByRole('button', { name: '完成知识' }))
  await user.click(screen.getByRole('button', { name: '完成知识' }))
  await user.click(screen.getByRole('button', { name: '通过测试' }))
  await user.click(screen.getByRole('button', { name: '通过测试' }))
  expect(screen.getByLabelText('balance')).toHaveTextContent('2100')
  expect(screen.getByLabelText('knowledge')).toHaveTextContent('ael-4')
  expect(screen.getByLabelText('tests')).toHaveTextContent('ael-4')
})

it('keeps each grade band progress when the concrete grade changes', async () => {
  const user = userEvent.setup()
  render(<AppStateProvider><GradeSwitchHarness /></AppStateProvider>)
  await user.click(screen.getByRole('button', { name: '切到六年级' }))
  expect(screen.getByLabelText('active progress')).toHaveTextContent('ael-1,ael-2,ael-3')
  await user.click(screen.getByRole('button', { name: '切到三年级' }))
  expect(screen.getByLabelText('active progress')).toBeEmptyDOMElement()
  await user.click(screen.getByRole('button', { name: '切回五年级' }))
  expect(screen.getByLabelText('active progress')).toHaveTextContent('ael-1,ael-2,ael-3')
})
```

The reducer's `set-grade` case changes only `grade`; it does not copy or clear any `learningProgress` entry.

Extend `companionState.actions.test.tsx` to assert one purchase produces one owned item, one `purchase:yunduo` record, and a 1,640 balance from the 2,000-point demo state even when the button is clicked twice.

- [ ] **Step 2: Run the action tests and verify missing context methods**

Run: `npm test -- src/app/learningState.actions.test.tsx src/app/companionState.actions.test.tsx --run`

Expected: FAIL because completion actions and ledger-derived balance do not exist.

- [ ] **Step 3: Implement atomic reducer actions**

```ts
type Action =
  | { type: 'set-grade'; grade: PrimaryGrade }
  | { type: 'complete-knowledge'; partId: CoursePartId; title: string; occurredAt: string }
  | { type: 'pass-test'; partId: CoursePartId; title: string; occurredAt: string }
  | { type: 'purchase-companion-item'; category: CompanionCategory; id: string; price: number; name: string; occurredAt: string }
  | { type: 'equip-companion-item'; category: CompanionCategory; id: string }
  | { type: 'unequip-companion-item'; category: Exclude<CompanionCategory, 'appearance'> }
  | { type: 'set-ai-position'; position: AiPosition }
  // Preserve existing non-stage actions.

function updateProgress(state: AppState, action: Extract<Action, { type: 'complete-knowledge' | 'pass-test' }>) {
  const band = getGradeBand(state.grade)
  const before = state.learningProgress[band]
  const field = action.type === 'complete-knowledge' ? 'knowledgeCompleted' : 'testsPassed'
  if (before[field].includes(action.partId)) return state
  if (action.type === 'pass-test' && !before.knowledgeCompleted.includes(action.partId)) return state
  const after = { ...before, [field]: [...before[field], action.partId] }
  let next = { ...state, learningProgress: { ...state.learningProgress, [band]: after } }
  for (const tx of buildProgressRewardTransactions(before, after, band, getPartIdsForBand(band), action.occurredAt)) {
    next = applyTransactionOnce(next, { ...tx, title: tx.kind === 'knowledge' ? `完成知识：${action.title}` : tx.kind === 'test' ? `通过测试：${action.title}` : tx.title })
  }
  return next
}

function purchase(state: AppState, action: Extract<Action, { type: 'purchase-companion-item' }>) {
  if (state.companion.owned[action.category].includes(action.id)) return state
  if (!Number.isFinite(action.price) || action.price <= 0 || getPointsBalance(state.transactions) < action.price) return state
  const transaction = {
    id: `purchase:${action.id}`,
    eventId: `purchase:${action.id}`,
    kind: 'purchase' as const,
    title: `积分商城购买：${action.name}`,
    amount: -action.price,
    occurredAt: action.occurredAt,
  }
  return applyTransactionOnce({
    ...state,
    companion: {
      ...state.companion,
      owned: { ...state.companion.owned, [action.category]: [...state.companion.owned[action.category], action.id] },
    },
  }, transaction)
}
```

Expose `pointsBalance: getPointsBalance(state.transactions)` in the context value. Use one `new Date().toISOString()` per dispatched event so record timestamps are stable inside an update.

- [ ] **Step 4: Run action, ledger, and storage tests**

Run: `npm test -- src/app/learningState.actions.test.tsx src/app/companionState.actions.test.tsx src/app/points.test.ts src/app/storage.test.ts --run`

Expected: PASS.

- [ ] **Step 5: Commit the state actions**

```bash
git add src/app/AppState.tsx src/app/companionState.actions.test.tsx src/app/learningState.actions.test.tsx
git commit -m "feat: connect progress rewards and mall purchases"
```

---

### Task 5: Define the three primary course packages with stable shared part IDs

**Files:**
- Create: `src/features/knowledge/courseCatalog.ts`
- Create: `src/features/knowledge/content/grade56Content.ts`
- Create: `src/features/test/grade56QuizData.ts`
- Create: `src/features/knowledge/courseCatalog.test.ts`
- Modify: `src/features/knowledge/knowledgeData.ts`
- Modify: `src/features/test/quizData.ts`
- Delete: `src/features/knowledge/content/lab/course.html`

**Interfaces:**
- Consumes: `CourseId`, `CoursePartId`, `GradeBand`, and `makeCoursePartId`.
- Produces: `CoursePackage`, `CoursePart`, `QuizChapter`, `COURSE_PACKAGES`, `getCourseForBand(band)`, and `getQuizForPart(partId)`; `getPartIdsForBand` remains owned by `src/app/learning.ts`.

- [ ] **Step 1: Write failing one-to-one mapping and content tests**

```ts
// src/features/knowledge/courseCatalog.test.ts
import { describe, expect, it } from 'vitest'
import { COURSE_PACKAGES, getCourseForBand } from './courseCatalog'

describe('primary course packages', () => {
  it.each([
    ['grade1-2', 'qmx', 8],
    ['grade3-4', 'cxd', 6],
    ['grade5-6', 'ael', 9],
  ] as const)('maps %s to %s with aligned parts, quizzes and medals', (band, id, count) => {
    const course = getCourseForBand(band)
    expect(course.id).toBe(id)
    expect(course.parts).toHaveLength(count)
    expect(course.quizzes).toHaveLength(count)
    expect(course.medals).toHaveLength(count)
    expect(course.parts.map((part) => part.id)).toEqual(course.quizzes.map((quiz) => quiz.partId))
    expect(course.parts.map((part) => part.id)).toEqual(course.medals.map((medal) => medal.partId))
  })

  it('gives every grade 5-6 quiz five answerable questions and a ninth project challenge', () => {
    const course = COURSE_PACKAGES['grade5-6']
    expect(course.parts.map((part) => part.title)).toEqual([
      'AI 系统拆解站', '数据侦探营', '算法工具箱', '第一次 AI 实验', '给 AI 当评委',
      '生成式 AI 解密', '从点子到产品', '与 AI 安全相处', '我的 AI 小项目',
    ])
    expect(course.quizzes.every((quiz) => quiz.questions.length === 5)).toBe(true)
    expect(course.quizzes[8].questions.some((question) => question.type === 'scenario')).toBe(true)
    expect(JSON.stringify(course)).not.toMatch(/初中|中学生|七至九年级|7—9/)
  })
})
```

- [ ] **Step 2: Run the catalog test and verify missing module failures**

Run: `npm test -- src/features/knowledge/courseCatalog.test.ts --run`

Expected: FAIL because `courseCatalog.ts` and grade 5–6 content do not exist.

- [ ] **Step 3: Implement the catalog and age-appropriate grade 5–6 content**

```ts
// src/features/knowledge/courseCatalog.ts
export type CoursePart = {
  id: CoursePartId
  number: number
  title: string
  summary: string
  concept: string
  experiment: string
  safety: string
  challenge: string
}

export type QuizQuestion = {
  id: string
  type: 'choice' | 'judgment' | 'scenario'
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
}

export type QuizChapter = { partId: CoursePartId; title: string; questions: QuizQuestion[] }
export type CourseMedal = { partId: CoursePartId; name: string; icon: string; description: string }
export type CoursePackage = {
  id: CourseId
  band: GradeBand
  name: string
  subtitle: string
  motto: string
  parts: CoursePart[]
  quizzes: QuizChapter[]
  medals: CourseMedal[]
  finaleMedal: { id: string; name: string; description: string }
}
```

Create `GRADE56_PARTS` with these exact child-facing structures:

```ts
export const GRADE56_PARTS: CoursePart[] = [
  part(1, 'AI 系统拆解站', '从拍照识花开始，找出数据、算法、模型、算力和应用五位队员。', 'AI 系统像一支合作队，每个部分都有自己的任务。', '拆解一个熟悉的 AI 功能并给五位队员贴标签。', 'AI 只是工具，重要决定要让人来负责。', '为校园植物识别器画一张系统图。'),
  part(2, '数据侦探营', '跟着照片从收集、整理、标注走到训练和测试。', '数据质量会影响 AI 学到什么。', '找出重复、模糊和贴错标签的坏样本。', '不收集同学姓名、人脸和住址。', '整理一份干净又均衡的样本清单。'),
  part(3, '算法工具箱', '用分类、预测、分组和推荐解决不同生活问题。', '算法不是魔法，而是解决问题的方法。', '给四个校园问题选择合适的工具。', '推荐结果不代表唯一正确选择。', '解释为什么这把算法工具最合适。'),
  part(4, '第一次 AI 实验', '用免编程工具体验采集、训练、测试和改进。', '样本数量、角度和背景都会影响结果。', '比较单一背景与多种背景下的识别表现。', '实验只使用安全、不含个人信息的物品图片。', '记录一次失败和一次改进。'),
  part(5, '给 AI 当评委', '不用“感觉不错”，改用测试结果和错误案例评价 AI。', '准确率能概括表现，错误案例能告诉我们哪里要改。', '查看十次测试，圈出 AI 最容易弄错的一类。', '分数不能代替人的公平判断。', '写一张有优点也有改进建议的评语卡。'),
  part(6, '生成式 AI 解密', '观察文字或图片怎样从提示一步步生成。', '生成式 AI 会根据学过的规律组合新内容，也可能编错。', '给同一任务写两种提示并比较结果。', '查证事实，标注 AI 参与，尊重原创。', '把模糊提示改成清楚、安全的提示。'),
  part(7, '从点子到产品', '把真实需求变成对象、功能、原型和测试计划。', '好产品先理解使用者，再决定是否需要 AI。', '采访虚构角色并画出纸面原型。', '不诱导同学提供隐私，不设计让人上瘾的奖励。', '为校园节能助手做一页产品卡。'),
  part(8, '与 AI 安全相处', '识别隐私、深度伪造、信息茧房和版权风险。', '看起来真实不等于真实，方便也不能牺牲安全。', '给四个网络情境亮绿灯、黄灯或红灯。', '遇到危险内容立即停下并告诉可信任的成年人。', '写出自己的 AI 安全三步法。'),
  part(9, '我的 AI 小项目', '把问题、方案、数据、安全和改进合成完整计划。', '小项目要有真实问题、可测试方案和清楚边界。', '用项目画布检查目标、输入、输出、测试和风险。', '不收集敏感信息，不夸大 AI 能力。', '完成方案选择、风险判断和改进说明。'),
]

function part(number: number, title: string, summary: string, concept: string, experiment: string, safety: string, challenge: string): CoursePart {
  return { id: makeCoursePartId('ael', number), number, title, summary, concept, experiment, safety, challenge }
}
```

In `grade56QuizData.ts`, define exactly five questions per part. Cover these five checks in order for each chapter so the implementation is deterministic: core concept, everyday identification, experiment/data judgment, safety judgment, and scenario improvement. For chapter 9, the five prompts must be exactly: “哪个问题最适合做成第一个 AI 小项目？”, “项目需要哪些最少输入？”, “怎样测试方案是否真的有用？”, “发现会收集同学人脸时应该怎么办？”, and “第一次测试效果一般，下一步最好的做法是什么？”. Each question must contain 2–4 explicit options, one `answerIndex`, and a one-sentence child-facing explanation.

Use this exact chapter-3 data because the test-map movement regression test depends on its labels:

```ts
{
  partId: 'ael-3',
  title: '算法工具箱',
  questions: [
    question('ael-3-q1', 'choice', '把照片分成猫和狗，最适合哪种工具？', ['分类', '聚类', '推荐'], 0, '已知类别的识别任务适合用分类。'),
    question('ael-3-q2', 'choice', '没有现成标签，想把相似图书放在一起，应选择什么？', ['分类', '聚类', '数值预测'], 1, '聚类会把相似内容自动分组。'),
    question('ael-3-q3', 'choice', '根据过去气温估计明天的温度，更像哪类任务？', ['数值预测', '分类', '推荐'], 0, '温度是连续数值，适合做数值预测。'),
    question('ael-3-q4', 'judgment', '推荐系统给出的第一名一定是唯一正确选择。', ['对', '错'], 1, '推荐是参考，使用者仍可以比较和选择。'),
    question('ael-3-q5', 'scenario', '为同学推荐课外书，怎样做更合适？', ['直接替所有人决定', '先说明需求并允许同学调整', '收集家庭住址'], 1, '先了解需求、允许调整，才能让推荐更尊重使用者。'),
  ],
}
```

Define `question(id, type, prompt, options, answerIndex, explanation)` as a typed constructor returning `QuizQuestion` so all chapters use the same validated shape.

Convert the existing `qmx` and `cxd` constants from `knowledgeData.ts` and their quizzes from `quizData.ts` into the same `CoursePackage` shape without changing their current lesson/media wording. Set part IDs to `qmx-1`…`qmx-8` and `cxd-1`…`cxd-6`.

- [ ] **Step 4: Run catalog and existing content tests**

Run: `npm test -- src/features/knowledge/courseCatalog.test.ts src/features/knowledge/CourseContentPage.test.ts --run`

Expected: PASS; the existing comic and Bilibili assertions remain green.

- [ ] **Step 5: Commit the primary course registry**

```bash
git add src/features/knowledge/courseCatalog.ts src/features/knowledge/content/grade56Content.ts src/features/test/grade56QuizData.ts src/features/knowledge/courseCatalog.test.ts src/features/knowledge/knowledgeData.ts src/features/test/quizData.ts
git rm src/features/knowledge/content/lab/course.html
git commit -m "feat: register three primary course packages"
```

---

### Task 6: Connect the knowledge page and reading pages to saved progress

**Files:**
- Modify: `src/features/knowledge/KnowledgePage.tsx`
- Modify: `src/features/knowledge/CourseContentPage.tsx`
- Modify: `src/features/knowledge/knowledge.css`
- Modify: `src/features/knowledge/course-content.css`
- Modify: `src/features/knowledge/CourseContentPage.test.tsx`
- Create: `src/features/knowledge/KnowledgePage.test.tsx`

**Interfaces:**
- Consumes: `getGradeBand`, `getCourseForBand`, `completeKnowledge(partId, title)`, and saved `learningProgress`.
- Produces: knowledge cards whose complete/current/locked status is derived from state and a reading-page completion action that awards once.

- [ ] **Step 1: Write failing saved-progress UI tests**

```tsx
it('shows the default grade-5 account with parts 1-3 complete and part 4 current', () => {
  render(<AppStateProvider><KnowledgePage onOpenContent={vi.fn()} /></AppStateProvider>)
  expect(screen.getByRole('heading', { name: 'AI 探索实验室' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /AI 系统拆解站.*已完成/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /算法工具箱.*已完成/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /第一次 AI 实验.*当前学习/ })).toHaveAttribute('aria-expanded', 'true')
})

it('marks a reading complete once and adds thirty points', async () => {
  const user = userEvent.setup()
  render(<AppStateProvider><CourseContentPage courseId="ael" chapterNum={4} onBack={vi.fn()} /></AppStateProvider>)
  await user.click(screen.getByRole('button', { name: '完成本部分知识' }))
  expect(screen.getByRole('status')).toHaveTextContent('获得 30 积分')
  await user.click(screen.getByRole('button', { name: '完成本部分知识' }))
  expect(screen.getAllByText(/获得 30 积分/)).toHaveLength(1)
})
```

- [ ] **Step 2: Run knowledge tests and verify state-driven assertions fail**

Run: `npm test -- src/features/knowledge/KnowledgePage.test.tsx src/features/knowledge/CourseContentPage.test.tsx --run`

Expected: FAIL because completion is currently hard-coded in course data.

- [ ] **Step 3: Render status from state and complete content through context**

```tsx
const band = getGradeBand(state.grade)
const course = getCourseForBand(band)
const progress = state.learningProgress[band]
const firstIncomplete = course.parts.find((part) => !progress.knowledgeCompleted.includes(part.id))?.id

function partStatus(part: CoursePart) {
  if (progress.knowledgeCompleted.includes(part.id)) return 'completed'
  if (part.id === firstIncomplete) return 'current'
  return 'available'
}
```

On the content page, resolve the part through `COURSE_PACKAGES`, render the existing qmx comic or cxd video when present, render the new five-section grade 5–6 article otherwise, and dispatch:

```tsx
const alreadyComplete = progress.knowledgeCompleted.includes(part.id)
<button type="button" onClick={() => completeKnowledge(part.id, part.title)}>
  {alreadyComplete ? '已完成本部分知识' : '完成本部分知识'}
</button>
```

Keep qmx images at intrinsic `width`/`height`, `aspect-ratio: 16 / 9`, and `object-fit: contain`. Keep cxd iframe plus the accessible original-platform link and add the existing fallback cover/message when the iframe fails. Style grade 5–6 with the same warm chapter cards as the other primary bands, using smaller illustrations and stronger headings instead of the removed dark lab theme.

- [ ] **Step 4: Run knowledge and content tests**

Run: `npm test -- src/features/knowledge/KnowledgePage.test.tsx src/features/knowledge/CourseContentPage.test.tsx src/app/learningState.actions.test.tsx --run`

Expected: PASS.

- [ ] **Step 5: Commit the knowledge flow**

```bash
git add src/features/knowledge/KnowledgePage.tsx src/features/knowledge/CourseContentPage.tsx src/features/knowledge/knowledge.css src/features/knowledge/course-content.css src/features/knowledge/KnowledgePage.test.tsx src/features/knowledge/CourseContentPage.test.tsx
git commit -m "feat: connect primary knowledge progress"
```

---

### Task 7: Rebuild testing around knowledge gates, challenge introductions, and persistent progress

**Files:**
- Create: `src/features/test/testMapData.ts`
- Create: `src/features/test/TestLevelNode.tsx`
- Modify: `src/features/test/TestPage.tsx`
- Modify: `src/features/test/QuizModal.tsx`
- Modify: `src/features/test/test.css`
- Modify: `src/features/test/quiz-modal.css`
- Modify: `src/features/test/TestPage.test.tsx`

**Interfaces:**
- Consumes: course package quizzes, `isTestUnlocked`, saved band progress, `passTest(partId, title)`, and single companion loadout.
- Produces: `MapNode`, `getMapNodes(courseId)`, challenge-intro state, persistent pass results, and an AI companion anchored above the current node.

- [ ] **Step 1: Replace local-Set tests with saved-progress and gate tests**

```tsx
it('blocks a test whose matching knowledge is incomplete', async () => {
  const user = userEvent.setup()
  renderMap({
    grade: 'grade5',
    learningProgress: { ...createEmptyLearningProgress(), 'grade5-6': { knowledgeCompleted: ['ael-1'], testsPassed: [] } },
  })
  await user.click(screen.getByRole('button', { name: '数据侦探营 · 先学知识' }))
  expect(screen.getByRole('status')).toHaveTextContent('先完成第 2 部分知识')
  expect(screen.queryByRole('button', { name: '开始答题' })).not.toBeInTheDocument()
})

it('shows an introduction before opening an unlocked quiz', async () => {
  const user = userEvent.setup()
  renderMap({ grade: 'grade5' })
  await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
  expect(screen.getByRole('dialog', { name: '算法工具箱挑战介绍' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '开始答题' }))
  expect(screen.getByRole('heading', { name: '算法工具箱' })).toBeInTheDocument()
})

it('keeps the companion centered above the current node and moves it after passing', async () => {
  const user = userEvent.setup()
  renderMap({ grade: 'grade5' })
  expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'ael-3')
  await user.click(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' }))
  await user.click(screen.getByRole('button', { name: '开始答题' }))
  for (const answer of ['分类', '聚类', '数值预测', '错', '先说明需求并允许同学调整']) {
    await user.click(screen.getByRole('button', { name: answer }))
    await user.click(screen.getByRole('button', { name: /下一题|查看成绩/ }))
  }
  expect(screen.getByText('通关成功！')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'AI伙伴' })).toHaveAttribute('data-map-node-id', 'ael-4')
})
```

- [ ] **Step 2: Run the test page tests and verify the old local progress fails**

Run: `npm test -- src/features/test/TestPage.test.tsx --run`

Expected: FAIL because `TestPage` still initializes a component-local `Set` and ignores knowledge completion.

- [ ] **Step 3: Implement persistent map state and challenge flow**

```ts
export type MapNode = {
  id: CoursePartId
  x: number
  y: number
  landmark: string
  detail: string
}

export function getCurrentPartId(course: CoursePackage, progress: BandProgress) {
  return course.parts.find((part) => !progress.testsPassed.includes(part.id) && progress.knowledgeCompleted.includes(part.id))?.id
    ?? course.parts.find((part) => !progress.knowledgeCompleted.includes(part.id))?.id
    ?? course.parts.at(-1)!.id
}
```

```tsx
const unlocked = isTestUnlocked(progress, part.id)
const passed = progress.testsPassed.includes(part.id)
const status = passed ? 'completed' : part.id === currentPartId ? 'current' : unlocked ? 'available' : 'knowledge-locked'

function openChallenge(part: CoursePart) {
  if (!isTestUnlocked(progress, part.id)) {
    setNotice(`先完成第 ${part.number} 部分知识`)
    return
  }
  setIntroPart(part)
}

function handleComplete(score: number, total: number) {
  const passed = total > 0 && score / total >= 0.6
  if (passed && activePart) passTest(activePart.id, activePart.title)
  setResult({ score, total, passed })
}
```

For all three maps, render a vertically scrollable route with one detailed landmark per part. Use separate coordinate arrays for 8, 6, and 9 nodes; all coordinates must remain between 10–90% horizontally and leave enough vertical room for the companion above the node. Pass the current node to `<AiCompanion placement="test-map" mapTarget={node} />`. Failed results show a link/button back to the matching knowledge content and a “再试一次” action; they do not dispatch rewards.

- [ ] **Step 4: Run test, reducer, and companion tests**

Run: `npm test -- src/features/test/TestPage.test.tsx src/app/learningState.actions.test.tsx src/features/ai_companion/AiCompanion.test.tsx --run`

Expected: PASS.

- [ ] **Step 5: Commit the primary test adventure**

```bash
git add src/features/test/testMapData.ts src/features/test/TestLevelNode.tsx src/features/test/TestPage.tsx src/features/test/QuizModal.tsx src/features/test/test.css src/features/test/quiz-modal.css src/features/test/TestPage.test.tsx
git commit -m "feat: persist gated primary test adventures"
```

---

### Task 8: Derive medals and points pages from the same learning state and ledger

**Files:**
- Modify: `src/features/profile/medalsData.ts`
- Modify: `src/features/profile/MedalsPage.tsx`
- Modify: `src/features/profile/PointsPage.tsx`
- Modify: `src/features/profile/RewardsSection.tsx`
- Modify: `src/features/profile/ProfilePage.test.tsx`
- Create: `src/features/profile/rewards.test.tsx`

**Interfaces:**
- Consumes: active course package, `learningProgress`, `transactions`, `getPointsSummary`, and band completion.
- Produces: `deriveCourseMedals(course, progress)`, dynamic course/growth sections, exact earned count, and ledger-based totals and records.

- [ ] **Step 1: Write failing reward presentation tests**

```tsx
it('derives the default first two medals and explains the third', () => {
  render(<AppStateProvider><MedalsPage onBack={vi.fn()} /></AppStateProvider>)
  expect(screen.getByText('已获得 2 枚课程徽章')).toBeInTheDocument()
  expect(screen.getByText('算法徽章').closest('li')).toHaveTextContent('知识已完成，测试待通过')
})

it('renders totals and records from the same 2000-point ledger', () => {
  render(<AppStateProvider><PointsPage onBack={vi.fn()} /></AppStateProvider>)
  expect(screen.getByText('当前积分').parentElement).toHaveTextContent('2,000')
  expect(screen.getByText('累计获得').parentElement).toHaveTextContent('+2,000')
  expect(screen.getByText('累计消耗').parentElement).toHaveTextContent('-0')
  expect(screen.getByText('成长体验账号启航积分')).toBeInTheDocument()
  expect(screen.queryByText('星空精灵')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run reward tests and verify hard-coded data fails**

Run: `npm test -- src/features/profile/rewards.test.tsx src/features/profile/ProfilePage.test.tsx --run`

Expected: FAIL because medal ownership and point records are hard-coded.

- [ ] **Step 3: Implement derived medals and ledger rendering**

```ts
export type DerivedCourseMedal = CourseMedal & {
  earned: boolean
  progressText: string
}

export function deriveCourseMedals(course: CoursePackage, progress: BandProgress): DerivedCourseMedal[] {
  return course.medals.map((medal) => {
    const knowledge = progress.knowledgeCompleted.includes(medal.partId)
    const test = progress.testsPassed.includes(medal.partId)
    return {
      ...medal,
      earned: knowledge && test,
      progressText: knowledge && test ? '已点亮' : knowledge ? '知识已完成，测试待通过' : '先完成对应知识',
    }
  })
}
```

```tsx
const summary = getPointsSummary(state.transactions)
<strong>{summary.balance.toLocaleString('zh-CN')}</strong>
<strong>+{summary.earned.toLocaleString('zh-CN')}</strong>
<strong>-{summary.spent.toLocaleString('zh-CN')}</strong>
{[...state.transactions].reverse().map((record) => (
  <li key={record.id}>{record.title}<span>{record.amount > 0 ? '+' : ''}{record.amount}</span></li>
))}
```

Keep existing growth medals in a separate “成长勋章” section. The profile summary count is `derivedCourseMedals.filter(earned).length + earnedGrowthMedals.length`; remove the literal “8 枚”. Show the finale medal separately and only mark it earned when every course part has both knowledge and test completion.

- [ ] **Step 4: Run profile reward tests**

Run: `npm test -- src/features/profile/rewards.test.tsx src/features/profile/ProfilePage.test.tsx src/app/points.test.ts --run`

Expected: PASS.

- [ ] **Step 5: Commit the rewards presentation**

```bash
git add src/features/profile/medalsData.ts src/features/profile/MedalsPage.tsx src/features/profile/PointsPage.tsx src/features/profile/RewardsSection.tsx src/features/profile/ProfilePage.test.tsx src/features/profile/rewards.test.tsx
git commit -m "feat: derive profile rewards from learning state"
```

---

### Task 9: Remove learning-stage choices from login, registration, settings, profile, and home

**Files:**
- Modify: `src/features/auth/AuthLayout.tsx`
- Modify: `src/features/auth/LoginPage.tsx`
- Modify: `src/features/auth/RegisterPage.tsx`
- Modify: `src/features/auth/AuthFlow.test.tsx`
- Modify: `src/features/auth/RegisterPage.test.tsx`
- Modify: `src/features/settings/settingsData.ts`
- Modify: `src/features/settings/SettingsPage.tsx`
- Modify: `src/features/settings/SettingDetailPage.tsx`
- Modify: `src/features/settings/SettingsPage.test.tsx`
- Modify: `src/features/profile/ProfilePage.tsx`
- Modify: `src/features/profile/ProfileDetailPage.tsx`
- Modify: `src/features/profile/ProfileEditPage.tsx`
- Modify: `src/features/home/homeData.ts`
- Modify: `src/features/home/HomePage.tsx`
- Modify: `src/features/home/HomePage.test.tsx`
- Modify: `src/app/App.integration.test.tsx`

**Interfaces:**
- Consumes: `PrimaryGrade`, `PRIMARY_GRADES`, `GRADE_LABELS`, `getGradeBand`, single companion state, and existing age/guardian helpers.
- Produces: primary-only authentication, grade-only settings/profile copy, and home data without stage branches.

- [ ] **Step 1: Replace stage-switch tests with absence and grade tests**

```tsx
it('presents a single primary learning world without a stage switch or prototype disclaimer', () => {
  renderLogin()
  expect(screen.queryByRole('button', { name: '小学端' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '中学端' })).not.toBeInTheDocument()
  expect(screen.queryByText('页面初版，不会发送或保存真实账号和密码')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '欢迎来到数智学习世界' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
})

it('offers only grades one through six during registration', () => {
  renderRegisterPage()
  const options = within(screen.getByLabelText('选择年级')).getAllByRole('option').map((option) => option.textContent)
  expect(options).toEqual(['请选择年级', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'])
})
```

Update settings assertions to expect headings “账号与年级” and value “五年级 · 5—6 年级”; assert “学段与年级” and “中学端” are absent. Keep existing tests for under-14 guardian routing and the complete consent page.

- [ ] **Step 2: Run auth/settings/home/profile tests and verify stage UI failures**

Run: `npm test -- src/features/auth/AuthFlow.test.tsx src/features/auth/RegisterPage.test.tsx src/features/settings/SettingsPage.test.tsx src/features/home/HomePage.test.tsx src/features/profile/ProfilePage.test.tsx --run`

Expected: FAIL on the old stage buttons, labels, and data maps.

- [ ] **Step 3: Implement the single primary product UI**

```tsx
// AuthLayout.tsx: replace stage-switch with a static identity block
<div className="auth-brand-block" aria-label="数智学习小学成长空间">
  <span className="auth-brand-eyebrow">小学一至六年级</span>
  <strong>每一次好奇，都能长成新本领</strong>
</div>
```

```tsx
// RegisterPage.tsx
<select aria-label="选择年级" value={grade} onChange={(event) => setGrade(event.target.value as PrimaryGrade)}>
  <option value="">请选择年级</option>
  {PRIMARY_GRADES.map((id) => <option key={id} value={id}>{GRADE_LABELS[id]}</option>)}
</select>
```

Delete the login disclaimer node. Store only the selected primary grade. In settings, rename “账号与学段” to “账号与年级” and “学段与年级” to “学习年级”, remove stage confirmation dialogs, and show `GRADE_LABELS[state.grade]` plus `GRADE_BAND_LABELS[getGradeBand(state.grade)]`. Replace home `Record<LearningStage, ...>` collections with one primary array while preserving the approved home hierarchy and interactions.

- [ ] **Step 4: Run the full affected UI test set**

Run: `npm test -- src/features/auth src/features/settings src/features/home src/features/profile src/app/App.integration.test.tsx --run`

Expected: PASS; under-14 registration still calls the guardian consent flow.

- [ ] **Step 5: Commit the stage-free app surfaces**

```bash
git add src/features/auth src/features/settings src/features/profile src/features/home src/app/App.integration.test.tsx
git commit -m "refactor: remove learning-stage controls from app surfaces"
```

---

### Task 10: Make the AI companion and mall primary-only without losing interaction behavior

**Files:**
- Modify: `src/features/ai_companion/companionCatalog.ts`
- Modify: `src/features/ai_companion/PartnerAppearance.tsx`
- Modify: `src/features/ai_companion/AiCompanion.tsx`
- Modify: `src/features/ai_companion/LoginCompanion.tsx`
- Modify: `src/features/ai_companion/AiPanel.tsx`
- Modify: `src/features/ai_companion/companionChat.ts`
- Modify: `src/features/ai_companion/AiCompanion.test.tsx`
- Modify: `src/features/ai_companion/PartnerAppearance.test.tsx`
- Modify: `src/features/auth/LoginCompanion.test.tsx`
- Modify: `src/features/profile/MallPage.tsx`
- Modify: `src/features/profile/MallPage.test.tsx`
- Modify: `server/ai-proxy.mjs`
- Modify: `server/companionPolicy.mjs`
- Modify: `server/companionPolicy.test.mjs`

**Interfaces:**
- Consumes: single `companion`, single `aiPosition`, derived `pointsBalance`, atomic purchase methods, and existing browser speech helpers.
- Produces: primary-only `COMPANION_CATALOG`, `DEFAULT_COMPANION_ID = 'momo'`, stage-free companion chat requests, and unchanged safe voice/drag/handoff interactions.

- [ ] **Step 1: Write failing primary-only catalog and policy tests**

```ts
it('contains only the approved primary items and preserves the 70-80 percent demo ratio', () => {
  expect(COMPANION_CATALOG.map((item) => item.id)).toEqual([
    'momo', 'yunduo', 'cloudbloom', 'cloudbelle',
    'cloud-backpack', 'dawn-cloud-wand',
    'cloud-flower-lamp', 'rainbow-cloud-gate', 'flower-cloud-windchime', 'cloud-flower-chair',
  ])
  const remaining = COMPANION_CATALOG.filter((item) => item.id !== 'momo').reduce((sum, item) => sum + item.price, 0)
  expect(2000 / remaining).toBeGreaterThanOrEqual(0.70)
  expect(2000 / remaining).toBeLessThanOrEqual(0.80)
})
```

```js
// server/companionPolicy.test.mjs
it('uses one child-facing policy for every approved companion', () => {
  for (const id of ['momo', 'yunduo', 'cloudbloom', 'cloudbelle']) {
    const result = prepareStudentQuestion('怎么让植物识别更准确？', id)
    expect(result).toMatchObject({ companionId: id, question: '怎么让植物识别更准确？' })
  }
  expect(buildDeepSeekPayload(prepareStudentQuestion('那个帮我弄一下', 'momo')).messages[0].content).toContain('面向小学生')
})
```

- [ ] **Step 2: Run mall, companion, and server policy tests**

Run: `npm test -- src/features/profile/MallPage.test.tsx src/features/ai_companion src/features/auth/LoginCompanion.test.tsx --run && npm test -- server/companionPolicy.test.mjs --run`

Expected: FAIL because catalogs, payloads, handoff records, and components still require `stage`.

- [ ] **Step 3: Remove stage parameters while preserving interaction contracts**

```ts
export const DEFAULT_COMPANION_ID = 'momo'
export const COMPANION_CATALOG: CompanionCatalogItem[] = [
  { id: 'momo', name: '绒桃 Momo', price: 280, asset: '/pets/momo.png', gradient: 'linear-gradient(145deg, #FFF0E8, #FFD2C6)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'yunduo', name: '云朵 Yunduo', price: 360, asset: '/pets/yunduo.png', gradient: 'linear-gradient(145deg, #FFF8ED, #F8DDEA)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloudbloom', name: '云绽 Cloudbloom', price: 420, asset: '/pets/cloudbloom.png', gradient: 'linear-gradient(145deg, #FFF4E9, #FAD6E5)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloudbelle', name: '云贝儿 Cloudbelle', price: 480, asset: '/pets/cloudbelle.png', gradient: 'linear-gradient(145deg, #FCEFFF, #E4DCF8)', category: 'appearance', description: 'AI 伙伴形象' },
  { id: 'cloud-backpack', name: '云朵小背包', price: 160, asset: '/mall/elementary/cloud-backpack.png', gradient: 'linear-gradient(145deg, #FFF9EE, #FFE4DC)', category: 'outfit', description: '伙伴服饰' },
  { id: 'dawn-cloud-wand', name: '晨光云杖', price: 220, asset: '/mall/elementary/dawn-cloud-wand.png', gradient: 'linear-gradient(145deg, #FFF9EE, #FFE2C4)', category: 'outfit', description: '伙伴服饰' },
  { id: 'cloud-flower-lamp', name: '云光花灯', price: 180, asset: '/mall/elementary/cloud-flower-lamp.png', gradient: 'linear-gradient(145deg, #FFF8E9, #FFE3CF)', category: 'decoration', description: '学习空间装饰' },
  { id: 'rainbow-cloud-gate', name: '彩虹云门', price: 260, asset: '/mall/elementary/rainbow-cloud-gate.png', gradient: 'linear-gradient(145deg, #FFF5EE, #FFE0E0)', category: 'decoration', description: '学习空间装饰' },
  { id: 'flower-cloud-windchime', name: '花云风铃', price: 200, asset: '/mall/elementary/flower-cloud-windchime.png', gradient: 'linear-gradient(145deg, #FFF8F0, #FFE4D7)', category: 'decoration', description: '学习空间装饰' },
  { id: 'cloud-flower-chair', name: '云朵花椅', price: 300, asset: '/mall/elementary/cloud-flower-chair.png', gradient: 'linear-gradient(145deg, #FFF7ED, #FFDCD0)', category: 'decoration', description: '学习空间装饰' },
]
```

Change `PartnerAppearance` to accept only `loadout`, `size`, `motion`, and `interactive`. Change handoff records to `{ version: 2, appearanceId, rect }`; keep invalid-record rejection, reduced-motion bypass, glide transition, frame clamping, edge snapping, click panel, long-press speech, reply bubble, and test-map route motion. Change chat requests to `{ companionId, question }`.

```js
export function prepareStudentQuestion(question, companionId) {
  const text = typeof question === 'string' ? question.trim().replace(/\s+/g, ' ') : ''
  if (!text || text.length > MAX_QUESTION_LENGTH) throw new Error('invalid_question')
  const normalizedCompanionId = COMPANION_NAMES.has(companionId) ? companionId : 'momo'

  if (CRISIS_CONTENT.test(text)) return {
    companionId: normalizedCompanionId,
    question: text,
    directReply: '听起来你现在很难受。请马上告诉身边可信任的成年人、家长或老师；如果有立即危险，请联系当地紧急服务。',
  }
  if (PRIVACY_CONTENT.test(text)) return {
    companionId: normalizedCompanionId,
    question: text,
    directReply: '为了保护你的隐私，请不要在聊天里发送电话、地址、密码或验证码。需要帮助时可以请监护人或老师一起处理。',
  }
  if (SEXUAL_CONTENT.test(text) || VIOLENT_OR_ILLEGAL_CONTENT.test(text)) return {
    companionId: normalizedCompanionId,
    question: text,
    directReply: '这个内容不适合在这里展开。我们可以换成安全的学习、科普或创作问题。',
  }
  if (RUDE_CONTENT.test(text)) return {
    companionId: normalizedCompanionId,
    question: text,
    directReply: '我愿意继续帮你，不过我们换一种尊重彼此的说法，好吗？',
  }
  if (UNCLEAR_REQUEST.test(text) || (/那个|这个|帮我弄|帮我搞/.test(text) && text.length <= 10)) return {
    companionId: normalizedCompanionId,
    question: text,
    directReply: '我还没完全听懂，能换一种说法告诉我吗？',
  }
  return { companionId: normalizedCompanionId, question: text }
}
```

The DeepSeek system instruction keeps the current safety text and replaces the stage sentence with: “面向小学生：用亲切、具体、好理解的中文回答，可以使用一个轻松的比喻；不幼稚化、不说教。” Mall tabs remain 形象、服饰、装饰、我的; purchase/equip/unequip use the single loadout and show the derived ledger balance.

- [ ] **Step 4: Run companion, mall, speech policy, and login tests**

Run: `npm test -- src/features/profile/MallPage.test.tsx src/features/ai_companion src/features/auth/LoginCompanion.test.tsx --run && npm test -- server/companionPolicy.test.mjs --run`

Expected: PASS, including drag, long-press speech, bubble reply, login handoff, map placement, purchase, equip, and unequip behavior.

- [ ] **Step 5: Commit the primary-only companion system**

```bash
git add src/features/ai_companion src/features/auth/LoginCompanion.test.tsx src/features/profile/MallPage.tsx src/features/profile/MallPage.test.tsx server/ai-proxy.mjs server/companionPolicy.mjs server/companionPolicy.test.mjs
git commit -m "refactor: make AI companion and mall primary-only"
```

---

### Task 11: Remove secondary themes, code branches, tests, and public assets

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/features/shell/MainShell.tsx`
- Modify: `src/app/global.css`
- Modify: `src/app/themes.css`
- Modify: `src/features/auth/auth.css`
- Modify: `src/features/home/home.css`
- Modify: `src/features/knowledge/knowledge.css`
- Modify: `src/features/profile/profile.css`
- Modify: `src/features/settings/settings.css`
- Modify: `src/features/test/test.css`
- Modify: `src/features/shell/shell.css`
- Modify: `src/test/setup.ts`
- Delete: `public/games/secondary/`
- Delete: `public/icons/secondary/`
- Delete: `public/mall/secondary/`
- Delete: `public/medals/secondary/`
- Delete: `public/pets/nimbo.png`
- Delete: `public/pets/nimbli.png`
- Delete: `public/pets/aether.png`
- Delete: `public/pets/yunluo.png`

**Interfaces:**
- Consumes: the stage-free UI and state from Tasks 1–10.
- Produces: one warm primary visual system with no secondary runtime branch or asset reference.

- [ ] **Step 1: Add a repository scan test for forbidden product remnants**

```ts
// add to src/app/App.integration.test.tsx
it('does not expose a secondary learning mode anywhere in the rendered app', () => {
  render(<App />)
  expect(screen.queryByText(/中学端|初中|七至九年级|7—9/)).not.toBeInTheDocument()
  expect(document.documentElement).not.toHaveAttribute('data-stage')
})
```

Create a PowerShell verification command for the task and treat any match outside specs/plans/Git metadata as failure:

```powershell
rg -n "secondary|LearningStage|中学端|初中|七至九年级|7—9|nimbo|nimbli|aether|yunluo" src server public --glob "!**/*.map"
```

- [ ] **Step 2: Run the integration test and scan to establish failures**

Run: `npm test -- src/app/App.integration.test.tsx --run`

Expected: FAIL or the scan returns current secondary branches and assets.

- [ ] **Step 3: Collapse styles and shell logic to one primary theme**

Remove every selector such as `[data-stage="secondary"]`, `.test-page--secondary`, `.home-page--secondary`, and stage-dependent class interpolation. Keep the current elementary tokens as the base and introduce only band modifiers where typography/content density actually differs:

```tsx
const band = getGradeBand(state.grade)
return <main className={`main-shell main-shell--${band}`}>
  <Outlet />
  <BottomNavigation />
  <AiCompanion />
</main>
```

```css
.main-shell--grade1-2 { --learning-copy-size: 1rem; --learning-card-gap: 16px; }
.main-shell--grade3-4 { --learning-copy-size: .96rem; --learning-card-gap: 14px; }
.main-shell--grade5-6 { --learning-copy-size: .92rem; --learning-card-gap: 12px; }
```

Delete the listed secondary directories/files with `git rm -r`/`git rm`. Update test setup to remove only `data-font-scale` and other still-used attributes; do not recreate `data-stage`.

- [ ] **Step 4: Run tests, build, and forbidden-remnant scan**

Run: `npm test -- --run && npm run build && rg -n "secondary|LearningStage|中学端|初中|七至九年级|7—9|nimbo|nimbli|aether|yunluo" src server public --glob "!**/*.map"`

Expected: all tests and build PASS; `rg` exits with code 1 and no matches.

- [ ] **Step 5: Commit the deletion**

```bash
git add src server
git rm -r public/games/secondary public/icons/secondary public/mall/secondary public/medals/secondary
git rm public/pets/nimbo.png public/pets/nimbli.png public/pets/aether.png public/pets/yunluo.png
git commit -m "refactor: remove secondary product code and assets"
```

---

### Task 12: Verify responsive layouts and the complete primary-school journey

**Files:**
- Modify: `src/app/App.integration.test.tsx`
- Modify: `src/features/knowledge/KnowledgePage.test.tsx`
- Modify: `src/features/test/TestPage.test.tsx`
- Modify: `src/features/profile/MallPage.test.tsx`
- Modify: `src/app/global.css`
- Modify: `src/features/knowledge/knowledge.css`
- Modify: `src/features/test/test.css`
- Modify: `src/features/profile/profile.css`
- Create: `docs/primary-school-only-acceptance.md`

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: regression coverage for the complete demo journey and a checked visual acceptance record.

- [ ] **Step 1: Add the final end-to-end integration test**

```tsx
it('completes the approved primary-only demonstration journey', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText('学习账号／学习码'), 'chenxi_2026')
  await user.type(screen.getByLabelText('密码'), 'demo-password')
  await user.click(screen.getByRole('button', { name: '进入学习世界' }))

  await user.click(screen.getByRole('button', { name: '知识' }))
  expect(screen.getByRole('heading', { name: 'AI 探索实验室' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /第一次 AI 实验.*当前学习/ })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '测试' }))
  expect(screen.getByRole('button', { name: '算法工具箱 · 当前关卡' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '第一次 AI 实验 · 先学知识' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: '我的' }))
  expect(screen.getByText('2,000')).toBeInTheDocument()
  await user.click(screen.getByText('积分商城'))
  expect(screen.getByText('绒桃 Momo')).toBeInTheDocument()
  expect(screen.queryByText('云宝 Nimbo')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the final integration test and fix only observed regressions**

Run: `npm test -- src/app/App.integration.test.tsx --run`

Expected: PASS. If it fails, make the smallest change in the file owning the failing behavior and rerun this exact command before continuing.

- [ ] **Step 3: Apply responsive containment rules and record manual checks**

```css
.app-frame, .knowledge-page, .test-page, .profile-page { min-width: 0; max-width: 100%; }
.knowledge-page, .test-page, .profile-page { padding-bottom: calc(var(--bottom-nav-height, 76px) + env(safe-area-inset-bottom) + 24px); }
.course-card, .test-route, .mall-grid { min-width: 0; }
img, iframe, video { max-width: 100%; }
```

Create `docs/primary-school-only-acceptance.md` with checked/unchecked rows for 320px and wide phone widths covering: login without stage/disclaimer, qmx full comic, cxd inline video and platform link, ael warm chapter layout, full vertical maps, companion above current node and inside frame, bottom-nav clearance, mall purchase/wardrobe, and ledger consistency. Mark an item checked only after inspecting it in the running app.

- [ ] **Step 4: Run the complete verification suite**

Run:

```powershell
npm test -- --run
npm run build
git diff --check
rg -n "中学端|初中|七至九年级|7—9|secondary|LearningStage" src server public
```

Expected: tests PASS, build PASS, `git diff --check` has no output, and the final `rg` has no product-code matches. The words may remain in the approved design and implementation documents only.

- [ ] **Step 5: Commit the verified primary-only release candidate**

```bash
git add src docs/primary-school-only-acceptance.md
git commit -m "test: verify primary-only learning journey"
```

---

## Final Review Checklist

- [ ] Every design-spec section maps to at least one task above.
- [ ] Every code-writing step contains concrete types, values, function signatures, and verification commands rather than placeholder prose.
- [ ] `PrimaryGrade`, `GradeBand`, `CourseId`, `CoursePartId`, `BandProgress`, `PointTransaction`, and context method signatures match across tasks.
- [ ] All three course packages share stable part IDs across knowledge, test, map, medal, and reward data.
- [ ] The default ledger sums to exactly 2,000 and the remaining mall price ratio stays within 70%–80%.
- [ ] Only project-owned storage keys are migrated; unrelated localStorage entries are preserved.
- [ ] Knowledge gating is enforced in both UI and reducer, so restored/deep-linked state cannot bypass it.
- [ ] The ninth grade 5–6 part has real knowledge, five questions including scenarios, a course medal, and a separate finale medal after all nine parts.
- [ ] Existing comic, video, guardian, companion speech, child safety, drag, handoff, equip, and unequip behavior remains covered.
- [ ] Secondary code and assets are deleted from the working tree, with Git history as the only recovery path.
