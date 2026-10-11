import { beforeEach, describe, expect, it } from 'vitest'
import { defaultState } from './model'
import { loadState } from './storage'

describe('companion loadout defaults and persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts each stage with only its default appearance equipped', () => {
    expect(defaultState.companions.elementary.equipped).toEqual({
      appearance: 'momo',
      outfit: null,
      decoration: null,
    })
    expect(defaultState.companions.secondary.equipped).toEqual({
      appearance: 'nimbo',
      outfit: null,
      decoration: null,
    })
    expect(defaultState.companions.elementary.owned.appearance).toEqual(['momo'])
    expect(defaultState.companions.secondary.owned.appearance).toEqual(['nimbo'])
  })

  it('migrates stored state without companion loadouts to stage defaults', () => {
    const { companions: _companions, ...legacyState } = defaultState
    localStorage.setItem('student-app-state', JSON.stringify({ ...legacyState, aiSkin: 2 }))

    expect(loadState().companions).toEqual(defaultState.companions)
  })
})
