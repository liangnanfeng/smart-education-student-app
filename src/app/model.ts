import type { LearningProgress, PrimaryGrade } from './learning'
import type { PointTransaction } from './points'
import { getPointsBalance } from './points'

export const APP_STATE_VERSION = 2 as const

/** @deprecated Temporary consumer bridge; remove with the stage UI in Task 11. */
export type LearningStage = 'elementary' | 'secondary'
export type FontScale = 'standard' | 'large' | 'xlarge'

export type AiPosition = {
  x: number
  y: number
}

/** @deprecated Temporary consumer bridge; persisted state only accepts PrimaryGrade. */
export type Grade = {
  elementary: PrimaryGrade
  secondary: 'grade7' | 'grade8' | 'grade9' | 'grade10' | 'grade11' | 'grade12'
}

export const ELEMENTARY_GRADE_IDS = ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'] as const
/** @deprecated Remove with the remaining stage UI in Task 11. */
export const SECONDARY_GRADE_IDS = ['grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12'] as const

/** @deprecated Primary labels live in learning.ts; retained for existing consumers until Task 11. */
export const GRADE_LABELS: Record<Grade[LearningStage], string> = {
  grade1: '一年级', grade2: '二年级', grade3: '三年级',
  grade4: '四年级', grade5: '五年级', grade6: '六年级',
  grade7: '初一', grade8: '初二', grade9: '初三',
  grade10: '高一', grade11: '高二', grade12: '高三',
}

export type GuardianInfo = {
  name: string
  relationship: 'father' | 'mother' | 'grandparent' | 'other'
  phone: string
  authorised: boolean
}

export type DeviceInfo = {
  name: string
  lastActive: string
  current: boolean
}

export type AiPersonality = 'gentle' | 'playful' | 'serious' | 'encouraging'
export type VoiceMode = 'warm' | 'bright' | 'calm'
export type SafeMode = 'strict' | 'standard' | 'relaxed'
export type ContentLevel = 'general' | 'teen' | 'child'
export type PermissionStatus = 'granted' | 'denied' | 'prompt'

export type CompanionCategory = 'appearance' | 'outfit' | 'decoration'

export type CompanionLoadout = {
  owned: Record<CompanionCategory, string[]>
  equipped: Record<CompanionCategory, string | null>
  version: number
}

export type LegacyConsumerBridge = {
  /** @deprecated Read-only compatibility value. Never persisted. */
  stage: LearningStage
  /** @deprecated Derived from transactions. Never persisted. */
  pointsBalance: number
  /** @deprecated Mirrors aiPosition. Never persisted. */
  aiPositions: Record<LearningStage, AiPosition>
  /** @deprecated Mirrors companion. Never persisted. */
  companions: Record<LearningStage, CompanionLoadout>
}

export type AppState = {
  stateVersion: typeof APP_STATE_VERSION
  /** @deprecated Runtime compatibility is broader until stage consumers are removed in Task 11; storage normalizes to PrimaryGrade. */
  grade: Grade[LearningStage]
  isLoggedIn: boolean
  learningProgress: LearningProgress
  transactions: PointTransaction[]
  processedRewardIds: string[]
  aiPosition: AiPosition
  companion: CompanionLoadout
  fontScale: FontScale
  nickname: string
  avatar: number
  likes: string[]
  favorites: string[]
  notifications: 'important' | 'all' | 'off'
  accountId: string
  passwordHint: string
  lastPasswordChange: string
  twoFactorEnabled: boolean
  guardian: GuardianInfo
  familyName: string
  devices: DeviceInfo[]
  aiName: string
  aiPersonality: AiPersonality
  aiSkin: number
  voiceEnabled: boolean
  autoListenEnabled: boolean
  voiceMode: VoiceMode
  saveHistory: boolean
  aiMemoryEnabled: boolean
  historyCount: number
  confirmDangerous: boolean
  guardianApprove: boolean
  safeMode: SafeMode
  soundEnabled: boolean
  soundVolume: number
  hapticEnabled: boolean
  showLearningStats: boolean
  allowFriendFind: boolean
  dataCollection: boolean
  cameraPermission: PermissionStatus
  micPermission: PermissionStatus
  albumPermission: PermissionStatus
  contentLevel: ContentLevel
  personalizedRec: boolean
  storageUsed: number
  storageTotal: number
  autoCleanDays: number
} & LegacyConsumerBridge

const DEMO_TRANSACTIONS: PointTransaction[] = [
  { id: 'demo-knowledge', eventId: 'demo:knowledge', kind: 'knowledge', title: '已完成 3 个知识部分', amount: 90, occurredAt: '2026-10-12' },
  { id: 'demo-tests', eventId: 'demo:tests', kind: 'test', title: '已通过 2 个测试关卡', amount: 100, occurredAt: '2026-10-12' },
  { id: 'demo-medals', eventId: 'demo:medals', kind: 'medal', title: '已点亮 2 枚课程徽章', amount: 40, occurredAt: '2026-10-12' },
  { id: 'demo-starter', eventId: 'demo:starter', kind: 'starter', title: '成长体验账号启航积分', amount: 1770, occurredAt: '2026-10-12' },
]

export function createDefaultState(): AppState {
  return withLegacyConsumerBridge({
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
    transactions: DEMO_TRANSACTIONS.map((transaction) => ({ ...transaction })),
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
  })
}

type PrimaryState = Omit<AppState, keyof LegacyConsumerBridge>

export function withLegacyConsumerBridge(
  state: PrimaryState,
  compatibility: Partial<LegacyConsumerBridge> = {},
): AppState {
  const position = state.aiPosition
  const companion = state.companion
  const legacySecondaryCompanion: CompanionLoadout = {
    owned: { appearance: ['nimbo'], outfit: [], decoration: [] },
    equipped: { appearance: 'nimbo', outfit: null, decoration: null },
    version: 1,
  }
  return {
    ...state,
    stage: compatibility.stage ?? 'elementary',
    pointsBalance: compatibility.pointsBalance ?? getPointsBalance(state.transactions),
    aiPositions: compatibility.aiPositions ?? { elementary: position, secondary: position },
    companions: compatibility.companions ?? { elementary: companion, secondary: legacySecondaryCompanion },
  }
}

export const defaultState = createDefaultState()
