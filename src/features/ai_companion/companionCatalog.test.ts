import { describe, expect, it } from 'vitest'
import { COMPANION_CATALOG } from './companionCatalog'

describe('primary companion catalog', () => {
  it('contains only approved primary items and preserves the 70–80 percent demo ratio', () => {
    expect(COMPANION_CATALOG.map((item) => item.id)).toEqual([
      'momo', 'yunduo', 'cloudbloom', 'cloudbelle',
      'cloud-backpack', 'dawn-cloud-wand',
      'cloud-flower-lamp', 'rainbow-cloud-gate', 'flower-cloud-windchime', 'cloud-flower-chair',
    ])
    const remaining = COMPANION_CATALOG.filter((item) => item.id !== 'momo').reduce((sum, item) => sum + item.price, 0)
    expect(2000 / remaining).toBeGreaterThanOrEqual(.70)
    expect(2000 / remaining).toBeLessThanOrEqual(.80)
  })
})
