import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultState } from './model'
import { loadState, saveState } from './storage'

describe('primary companion loadout defaults and persistence', () => {
  beforeEach(() => localStorage.clear())

  it('starts with only Momo equipped and no outfit or decoration', () => {
    const state = createDefaultState()

    expect(state.companion.owned).toEqual({ appearance: ['momo'], outfit: [], decoration: [] })
    expect(state.companion.equipped).toEqual({ appearance: 'momo', outfit: null, decoration: null })
  })

  it('removes retired or mismatched items from a current-version loadout', () => {
    const state = createDefaultState()
    saveState(state)
    const persisted = JSON.parse(localStorage.getItem('student-app-state') ?? '{}')
    localStorage.setItem('student-app-state', JSON.stringify({
      ...persisted,
      companion: {
        owned: {
          appearance: ['momo', 'nimbo', 'yunduo'],
          outfit: ['cloud-backpack', 'moon-bell'],
          decoration: ['cloud-flower-lamp', 'sky-cloud-throne'],
        },
        equipped: {
          appearance: 'nimbo',
          outfit: 'moon-bell',
          decoration: 'sky-cloud-throne',
        },
        version: 1,
      },
    }))

    expect(loadState().companion).toEqual({
      owned: {
        appearance: ['momo', 'yunduo'],
        outfit: ['cloud-backpack'],
        decoration: ['cloud-flower-lamp'],
      },
      equipped: { appearance: 'momo', outfit: null, decoration: null },
      version: 1,
    })
  })

  it('restores Momo when a current-version loadout omitted it', () => {
    const state = createDefaultState()
    saveState(state)
    const persisted = JSON.parse(localStorage.getItem('student-app-state') ?? '{}')
    localStorage.setItem('student-app-state', JSON.stringify({
      ...persisted,
      companion: {
        owned: { appearance: ['yunduo'], outfit: [], decoration: [] },
        equipped: { appearance: 'yunduo', outfit: null, decoration: null },
        version: 1,
      },
    }))

    const loaded = loadState()
    expect(loaded.companion.owned.appearance).toEqual(['momo', 'yunduo'])
    expect(loaded.companion.equipped.appearance).toBe('yunduo')
  })
})
