import { defaultState, type AppState, type CompanionCategory, type CompanionLoadout, type LearningStage } from './model'

const STORAGE_KEY = 'student-app-state'

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultState
    const parsed = JSON.parse(stored) as Partial<AppState>
    return {
      ...defaultState,
      ...parsed,
      companions: {
        elementary: normalizeLoadout(parsed.companions?.elementary, 'elementary'),
        secondary: normalizeLoadout(parsed.companions?.secondary, 'secondary'),
      },
    } as AppState
  } catch {
    return defaultState
  }
}

const COMPANION_CATEGORIES: CompanionCategory[] = ['appearance', 'outfit', 'decoration']

function normalizeLoadout(value: CompanionLoadout | undefined, stage: LearningStage): CompanionLoadout {
  const fallback = defaultState.companions[stage]
  if (!value || typeof value !== 'object') return fallback

  const owned = Object.fromEntries(COMPANION_CATEGORIES.map((category) => [
    category,
    Array.isArray(value.owned?.[category])
      ? value.owned[category].filter((id): id is string => typeof id === 'string')
      : fallback.owned[category],
  ])) as CompanionLoadout['owned']

  const equipped = Object.fromEntries(COMPANION_CATEGORIES.map((category) => {
    const id = value.equipped?.[category]
    if (typeof id === 'string' && owned[category].includes(id)) return [category, id]
    return [category, category === 'appearance' ? fallback.equipped.appearance : null]
  })) as CompanionLoadout['equipped']

  return { owned, equipped, version: 1 }
}

export function saveState(state: AppState) {
  const safeState: AppState = {
    stage: state.stage,
    grade: state.grade,
    isLoggedIn: state.isLoggedIn,
    fontScale: state.fontScale,
    nickname: state.nickname,
    avatar: state.avatar,
    likes: state.likes,
    favorites: state.favorites,
    pointsBalance: state.pointsBalance,
    notifications: state.notifications,
    aiPositions: state.aiPositions,
    accountId: state.accountId,
    passwordHint: state.passwordHint,
    lastPasswordChange: state.lastPasswordChange,
    twoFactorEnabled: state.twoFactorEnabled,
    guardian: state.guardian,
    familyName: state.familyName,
    devices: state.devices,
    aiName: state.aiName,
    aiPersonality: state.aiPersonality,
    aiSkin: state.aiSkin,
    companions: state.companions,
    voiceEnabled: state.voiceEnabled,
    autoListenEnabled: state.autoListenEnabled,
    voiceMode: state.voiceMode,
    saveHistory: state.saveHistory,
    aiMemoryEnabled: state.aiMemoryEnabled,
    historyCount: state.historyCount,
    confirmDangerous: state.confirmDangerous,
    guardianApprove: state.guardianApprove,
    safeMode: state.safeMode,
    soundEnabled: state.soundEnabled,
    soundVolume: state.soundVolume,
    hapticEnabled: state.hapticEnabled,
    showLearningStats: state.showLearningStats,
    allowFriendFind: state.allowFriendFind,
    dataCollection: state.dataCollection,
    cameraPermission: state.cameraPermission,
    micPermission: state.micPermission,
    albumPermission: state.albumPermission,
    contentLevel: state.contentLevel,
    personalizedRec: state.personalizedRec,
    storageUsed: state.storageUsed,
    storageTotal: state.storageTotal,
    autoCleanDays: state.autoCleanDays,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState))
}
