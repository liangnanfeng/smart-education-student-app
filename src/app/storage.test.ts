import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultState } from './model'
import { getPointsBalance } from './points'
import { loadState, saveState } from './storage'

describe('primary-only state migration', () => {
  beforeEach(() => localStorage.clear())

  it('creates the approved guardian-authorized grade-5 account', () => {
    const state = createDefaultState()

    expect(state.stateVersion).toBe(2)
    expect(state.grade).toBe('grade5')
    expect(state.guardian.authorised).toBe(true)
    expect(state.learningProgress['grade5-6']).toEqual({
      knowledgeCompleted: ['ael-1', 'ael-2', 'ael-3'],
      testsPassed: ['ael-1', 'ael-2'],
    })
    expect(state.companion.equipped).toEqual({ appearance: 'momo', outfit: null, decoration: null })
    expect(state.transactions.map(({ amount }) => amount)).toEqual([90, 100, 40, 1770])
    expect(getPointsBalance(state.transactions)).toBe(2000)
  })

  it('replaces an old prototype state once without clearing unrelated keys', () => {
    localStorage.setItem('student-app-state', JSON.stringify({ stateVersion: 1, grade: 'grade8' }))
    localStorage.setItem('unrelated-preference', 'keep-me')

    const migrated = loadState()

    expect(migrated.stateVersion).toBe(2)
    expect(migrated.grade).toBe('grade5')
    expect(localStorage.getItem('unrelated-preference')).toBe('keep-me')
    expect(localStorage.getItem('student-app-primary-v2-migrated')).toBe('1')
    const persisted = JSON.parse(localStorage.getItem('student-app-state') ?? '{}')
    saveState({ ...migrated, nickname: '新名字' })
    expect(loadState().nickname).toBe('新名字')
  })

  it('falls back safely when stored JSON is broken', () => {
    localStorage.setItem('student-app-state', '{broken')

    expect(loadState()).toEqual(createDefaultState())
  })

  it('drops unknown keys and invalid course progress when loading v2 state', () => {
    const state = createDefaultState()
    saveState(state)
    const persisted = JSON.parse(localStorage.getItem('student-app-state') ?? '{}')
    localStorage.setItem('student-app-state', JSON.stringify({
      ...persisted,
      unexpected: 'remove-me',
      grade: 'grade8',
      learningProgress: {
        ...state.learningProgress,
        'grade5-6': {
          knowledgeCompleted: ['ael-1', 'ael-99', 'retired-1'],
          testsPassed: ['ael-2', 'ael-20'],
        },
      },
    }))

    const loaded = loadState()

    expect(loaded.grade).toBe('grade5')
    expect(loaded.learningProgress['grade5-6']).toEqual({
      knowledgeCompleted: ['ael-1'],
      testsPassed: ['ael-2'],
    })
    saveState(loaded)
    expect(JSON.parse(localStorage.getItem('student-app-state') ?? '{}')).not.toHaveProperty('unexpected')
  })

  it('normalizes every hostile v2 field independently into a render-safe state', () => {
    localStorage.setItem('unrelated-preference', 'keep-me')
    localStorage.setItem('student-app-state', JSON.stringify({
      stateVersion: 2,
      grade: 'grade8',
      isLoggedIn: true,
      learningProgress: {
        'grade1-2': { knowledgeCompleted: [null], testsPassed: 'bad' },
        'grade3-4': null,
        'grade5-6': { knowledgeCompleted: ['ael-1', 2], testsPassed: ['ael-2', {}] },
      },
      transactions: [null],
      processedRewardIds: [null],
      aiPosition: { x: 'far', y: [] },
      companion: { owned: [], equipped: 'bad', version: 'latest' },
      fontScale: 'huge',
      nickname: '保留昵称',
      avatar: 'zero',
      likes: [null],
      favorites: {},
      notifications: 'sometimes',
      accountId: 123,
      passwordHint: false,
      lastPasswordChange: [],
      twoFactorEnabled: 'yes',
      guardian: { name: null, relationship: 'friend', phone: 123, authorised: 'yes' },
      familyName: null,
      devices: [{ name: '设备', lastActive: null, current: 'yes' }],
      aiName: {},
      aiPersonality: 'chaotic',
      aiSkin: null,
      voiceEnabled: 'yes',
      autoListenEnabled: 1,
      voiceMode: 'loud',
      saveHistory: 'yes',
      aiMemoryEnabled: null,
      historyCount: 'many',
      confirmDangerous: 1,
      guardianApprove: 'no',
      safeMode: 'unsafe',
      soundEnabled: 'yes',
      soundVolume: 'max',
      hapticEnabled: 1,
      showLearningStats: null,
      allowFriendFind: 'yes',
      dataCollection: [],
      cameraPermission: 'always',
      micPermission: false,
      albumPermission: 1,
      contentLevel: 'adult',
      personalizedRec: 'yes',
      storageUsed: 'full',
      storageTotal: null,
      autoCleanDays: 'never',
    }))

    const loaded = loadState()

    expect(loaded).toEqual({
      ...createDefaultState(),
      isLoggedIn: true,
      nickname: '保留昵称',
    })
    expect(() => getPointsBalance(loaded.transactions)).not.toThrow()
    expect(getPointsBalance(loaded.transactions)).toBe(2000)
    expect(localStorage.getItem('unrelated-preference')).toBe('keep-me')
    expect(localStorage.getItem('student-app-primary-v2-migrated')).toBeNull()
  })
})
