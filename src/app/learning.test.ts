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
