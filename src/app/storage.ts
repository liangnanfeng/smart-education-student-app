import { COMPANION_CATALOG } from '../features/ai_companion/companionCatalog'
import { createEmptyLearningProgress, getPartIdsForBand, PRIMARY_GRADES, type CoursePartId, type PrimaryGrade } from './learning'
import { APP_STATE_VERSION, createDefaultState, withLegacyConsumerBridge, type AppState, type CompanionCategory, type CompanionLoadout } from './model'

const STORAGE_KEY = 'student-app-state'
const MIGRATION_KEY = 'student-app-primary-v2-migrated'

type LegacyConsumerKey = 'stage' | 'pointsBalance' | 'aiPositions' | 'companions'
type PersistedAppState = Omit<AppState, LegacyConsumerKey>

const PERSISTED_KEYS: Array<keyof PersistedAppState> = [
  'stateVersion', 'grade', 'isLoggedIn', 'learningProgress', 'transactions', 'processedRewardIds',
  'aiPosition', 'companion', 'fontScale', 'nickname', 'avatar', 'likes', 'favorites', 'notifications',
  'accountId', 'passwordHint', 'lastPasswordChange', 'twoFactorEnabled', 'guardian', 'familyName',
  'devices', 'aiName', 'aiPersonality', 'aiSkin', 'voiceEnabled', 'autoListenEnabled', 'voiceMode',
  'saveHistory', 'aiMemoryEnabled', 'historyCount', 'confirmDangerous', 'guardianApprove', 'safeMode',
  'soundEnabled', 'soundVolume', 'hapticEnabled', 'showLearningStats', 'allowFriendFind', 'dataCollection',
  'cameraPermission', 'micPermission', 'albumPermission', 'contentLevel', 'personalizedRec', 'storageUsed',
  'storageTotal', 'autoCleanDays',
]

export function loadState(): AppState {
  const fresh = createDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fresh

    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.stateVersion !== APP_STATE_VERSION) {
      return migrateToPrimaryState(fresh)
    }

    return normalizePrimaryState(parsed, fresh)
  } catch {
    return migrateToPrimaryState(fresh)
  }
}

function migrateToPrimaryState(fresh: AppState) {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.setItem(MIGRATION_KEY, '1')
  saveState(fresh)
  return fresh
}

function normalizePrimaryState(parsed: Partial<AppState>, fresh: AppState): AppState {
  const fallback = toPersistedState(fresh)
  const allowed = Object.fromEntries(
    PERSISTED_KEYS.map((key) => [key, parsed[key] ?? fallback[key]]),
  ) as PersistedAppState
  const primaryGrade = PRIMARY_GRADES.includes(allowed.grade as PrimaryGrade)
    ? allowed.grade as PrimaryGrade
    : fresh.grade
  const learningProgress = createEmptyLearningProgress()

  for (const band of ['grade1-2', 'grade3-4', 'grade5-6'] as const) {
    const validIds = new Set(getPartIdsForBand(band))
    const stored = allowed.learningProgress?.[band]
    learningProgress[band] = {
      knowledgeCompleted: filterCoursePartIds(stored?.knowledgeCompleted, validIds),
      testsPassed: filterCoursePartIds(stored?.testsPassed, validIds),
    }
  }

  return withLegacyConsumerBridge({
    ...allowed,
    stateVersion: APP_STATE_VERSION,
    grade: primaryGrade,
    learningProgress,
    transactions: Array.isArray(allowed.transactions) ? allowed.transactions : fresh.transactions,
    processedRewardIds: Array.isArray(allowed.processedRewardIds)
      ? allowed.processedRewardIds.filter((id): id is string => typeof id === 'string')
      : fresh.processedRewardIds,
    companion: normalizePrimaryLoadout(allowed.companion, fresh.companion),
  })
}

function filterCoursePartIds(value: unknown, validIds: Set<CoursePartId>): CoursePartId[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is CoursePartId => typeof id === 'string' && validIds.has(id as CoursePartId))
}

const COMPANION_CATEGORIES: CompanionCategory[] = ['appearance', 'outfit', 'decoration']

function normalizePrimaryLoadout(value: CompanionLoadout | undefined, fallback: CompanionLoadout): CompanionLoadout {
  if (!value || typeof value !== 'object') return fallback

  const primaryIds = Object.fromEntries(COMPANION_CATEGORIES.map((category) => [
    category,
    new Set(COMPANION_CATALOG
      .filter((item) => item.stage === 'elementary' && item.category === category)
      .map((item) => item.id)),
  ])) as Record<CompanionCategory, Set<string>>

  const owned = Object.fromEntries(COMPANION_CATEGORIES.map((category) => {
    const stored = Array.isArray(value.owned?.[category]) ? value.owned[category] : []
    const valid = stored.filter((id): id is string => typeof id === 'string' && primaryIds[category].has(id))
    return [category, category === 'appearance' ? ['momo', ...valid.filter((id) => id !== 'momo')] : valid]
  })) as CompanionLoadout['owned']

  const equipped = Object.fromEntries(COMPANION_CATEGORIES.map((category) => {
    const id = value.equipped?.[category]
    if (typeof id === 'string' && owned[category].includes(id)) return [category, id]
    return [category, category === 'appearance' ? 'momo' : null]
  })) as CompanionLoadout['equipped']

  return { owned, equipped, version: 1 }
}

function toPersistedState(state: AppState): PersistedAppState {
  const persisted = Object.fromEntries(PERSISTED_KEYS.map((key) => [key, state[key]])) as PersistedAppState
  persisted.grade = PRIMARY_GRADES.includes(state.grade as PrimaryGrade) ? state.grade : 'grade5'
  return persisted
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedState(state)))
}
