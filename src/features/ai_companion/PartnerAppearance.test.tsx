import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CompanionLoadout } from '../../app/model'
import { PartnerAppearance } from './PartnerAppearance'

const layeredLoadout: CompanionLoadout = {
  owned: {
    appearance: ['momo'],
    outfit: ['cloud-backpack'],
    decoration: ['cloud-flower-lamp'],
  },
  equipped: {
    appearance: 'momo',
    outfit: 'cloud-backpack',
    decoration: 'cloud-flower-lamp',
  },
  version: 1,
}

describe('PartnerAppearance', () => {
  it('renders the equipped appearance and optional layers in one safe frame', () => {
    render(<PartnerAppearance stage="elementary" loadout={layeredLoadout} size="login" />)

    expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toBeInTheDocument()
    expect(screen.getByTestId('companion-outfit')).toHaveAttribute('src', '/mall/elementary/cloud-backpack.png')
    expect(screen.getByTestId('companion-decoration')).toHaveAttribute('src', '/mall/elementary/cloud-flower-lamp.png')
    expect(screen.getByTestId('partner-appearance')).toHaveAttribute('data-size', 'login')
  })

  it('uses the stage default when the saved appearance no longer exists', () => {
    const invalidLoadout: CompanionLoadout = {
      ...layeredLoadout,
      equipped: { appearance: 'missing-pet', outfit: null, decoration: null },
    }

    render(<PartnerAppearance stage="secondary" loadout={invalidLoadout} size="floating" />)

    expect(screen.getByRole('img', { name: '云宝 Nimbo AI 伙伴形象' })).toBeInTheDocument()
  })

  it('switches the 3D sprite sheet to its running motion without dropping equipped layers', () => {
    render(<PartnerAppearance stage="elementary" loadout={layeredLoadout} size="floating" motion="run" />)

    expect(screen.getByTestId('partner-appearance')).toHaveAttribute('data-motion', 'run')
    expect(screen.getByRole('img', { name: '绒桃 Momo AI 伙伴形象' })).toHaveClass('partner-appearance__sprite--run')
    expect(screen.getByTestId('companion-outfit')).toBeInTheDocument()
    expect(screen.getByTestId('companion-decoration')).toBeInTheDocument()
  })
})
