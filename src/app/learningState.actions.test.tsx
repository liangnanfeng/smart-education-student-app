import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider, useAppState } from './AppState'
import { getGradeBand, type PrimaryGrade } from './learning'
import { getPointsBalance } from './points'

function Harness() {
  const app = useAppState()
  const band = getGradeBand(app.state.grade as PrimaryGrade)
  return (
    <>
      <output aria-label="balance">{getPointsBalance(app.state.transactions)}</output>
      <output aria-label="knowledge">{app.state.learningProgress[band].knowledgeCompleted.join(',')}</output>
      <output aria-label="tests">{app.state.learningProgress[band].testsPassed.join(',')}</output>
      <button type="button" onClick={() => app.completeKnowledge('ael-4', '第一次 AI 实验')}>完成知识</button>
      <button type="button" onClick={() => app.passTest('ael-4', '第一次 AI 实验')}>通过测试</button>
      <button type="button" onClick={() => app.passTest('ael-5', '给 AI 当评委')}>越过知识直接测试</button>
    </>
  )
}

function GradeSwitchHarness() {
  const app = useAppState()
  const band = getGradeBand(app.state.grade as PrimaryGrade)
  return (
    <>
      <output aria-label="active progress">{app.state.learningProgress[band].knowledgeCompleted.join(',')}</output>
      <button type="button" onClick={() => app.setGrade('grade6')}>切到六年级</button>
      <button type="button" onClick={() => app.setGrade('grade3')}>切到三年级</button>
      <button type="button" onClick={() => app.setGrade('grade5')}>切回五年级</button>
    </>
  )
}

describe('learning progress actions', () => {
  beforeEach(() => localStorage.clear())

  it('awards knowledge, test and medal only on first completion', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><Harness /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '完成知识' }))
    await user.click(screen.getByRole('button', { name: '完成知识' }))
    await user.click(screen.getByRole('button', { name: '通过测试' }))
    await user.click(screen.getByRole('button', { name: '通过测试' }))

    expect(screen.getByLabelText('balance')).toHaveTextContent('2100')
    expect(screen.getByLabelText('knowledge')).toHaveTextContent('ael-4')
    expect(screen.getByLabelText('tests')).toHaveTextContent('ael-4')
  })

  it('keeps each grade band progress when the concrete grade changes', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><GradeSwitchHarness /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '切到六年级' }))
    expect(screen.getByLabelText('active progress')).toHaveTextContent('ael-1,ael-2,ael-3')
    await user.click(screen.getByRole('button', { name: '切到三年级' }))
    expect(screen.getByLabelText('active progress')).toBeEmptyDOMElement()
    await user.click(screen.getByRole('button', { name: '切回五年级' }))
    expect(screen.getByLabelText('active progress')).toHaveTextContent('ael-1,ael-2,ael-3')
  })

  it('does not pass a test or award points before its knowledge is complete', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><Harness /></AppStateProvider>)

    await user.click(screen.getByRole('button', { name: '越过知识直接测试' }))

    expect(screen.getByLabelText('tests')).not.toHaveTextContent('ael-5')
    expect(screen.getByLabelText('balance')).toHaveTextContent('2000')
  })
})
