import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { RegisterPage } from './RegisterPage'

function renderRegisterPage() {
  const onBack = vi.fn()
  const onGuardianRequired = vi.fn()
  render(
    <AppStateProvider>
      <RegisterPage onBack={onBack} onGuardianRequired={onGuardianRequired} />
    </AppStateProvider>,
  )
  return { onGuardianRequired }
}

describe('registration birth date', () => {
  it('groups the year, month, and day fields into one readable date card', () => {
    renderRegisterPage()

    expect(screen.getByRole('group', { name: '出生日期输入' })).toBeInTheDocument()
  })

  it('uses a manually entered birth date for the existing guardian check', async () => {
    const user = userEvent.setup()
    const { onGuardianRequired } = renderRegisterPage()

    await user.type(screen.getByLabelText('出生年'), '2015')
    await user.type(screen.getByLabelText('出生月'), '8')
    await user.type(screen.getByLabelText('出生日'), '25')
    await user.selectOptions(screen.getByLabelText('选择年级'), '一年级')
    await user.type(screen.getByLabelText('学习账号／学习码'), 'learning-demo')
    await user.type(screen.getByLabelText('手机号／邮箱'), 'demo@example.com')
    await user.type(screen.getByRole('textbox', { name: /验证码/ }), '123456')
    await user.type(screen.getByLabelText('设置密码'), 'demo-password')
    await user.click(screen.getByRole('button', { name: '检查并继续' }))

    expect(onGuardianRequired).toHaveBeenCalledOnce()
  })

  it('synchronizes a date picked in the calendar into the numeric fields', async () => {
    const user = userEvent.setup()
    renderRegisterPage()
    const today = new Date()

    await user.click(screen.getByRole('button', { name: '打开日期选择器' }))
    expect(screen.getByRole('dialog', { name: '选择出生日期' })).toBeInTheDocument()
    expect(screen.getByLabelText('选择年份')).toHaveValue(String(today.getFullYear()))

    await user.click(screen.getByRole('button', { name: `${today.getFullYear()}年${today.getMonth() + 1}月1日` }))

    expect(screen.getByLabelText('出生年')).toHaveValue(today.getFullYear())
    expect(screen.getByLabelText('出生月')).toHaveValue(today.getMonth() + 1)
    expect(screen.getByLabelText('出生日')).toHaveValue(1)
  })

  it('opens the calendar as an inline panel so it does not cover later form fields', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.click(screen.getByRole('button', { name: '打开日期选择器' }))

    expect(screen.getByRole('dialog', { name: '选择出生日期' })).toHaveClass('birth-calendar-inline')
  })
})
