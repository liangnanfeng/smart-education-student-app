import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider, useAppState } from './AppState'

function CompanionStateHarness() {
  const context = useAppState()
  const loadout = context.state.companion
  const purchases = context.state.transactions.filter((transaction) => transaction.eventId === 'purchase:yunduo')
  return (
    <div>
      <output aria-label="balance">{context.pointsBalance}</output>
      <output aria-label="purchase records">{purchases.length}</output>
      <output aria-label="equipped appearance">{loadout.equipped.appearance}</output>
      <output aria-label="owned appearances">{loadout.owned.appearance.join(',')}</output>
      <button type="button" onClick={() => context.purchaseCompanionItem('appearance', 'yunduo', 360, '云朵')}>购买云朵</button>
      <button type="button" onClick={() => context.equipCompanionItem('appearance', 'yunduo')}>装备云朵</button>
    </div>
  )
}

describe('companion loadout actions', () => {
  beforeEach(() => localStorage.clear())

  it('purchases without equipping, then equips an owned item', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><CompanionStateHarness /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '购买云朵' }))
    await user.click(screen.getByRole('button', { name: '购买云朵' }))
    expect(screen.getByLabelText('owned appearances')).toHaveTextContent('momo,yunduo')
    expect(screen.getByLabelText('equipped appearance')).toHaveTextContent('momo')
    expect(screen.getByLabelText('purchase records')).toHaveTextContent('1')
    expect(screen.getByLabelText('balance')).toHaveTextContent('1640')

    await user.click(screen.getByRole('button', { name: '装备云朵' }))
    expect(screen.getByLabelText('equipped appearance')).toHaveTextContent('yunduo')
  })
})
