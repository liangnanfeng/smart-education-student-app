import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ForgotPasswordPage } from './ForgotPasswordPage'

describe('forgot password page', () => {
  it('keeps the login-only brand block out of password recovery', () => {
    render(<ForgotPasswordPage onBack={vi.fn()} />)

    expect(screen.queryByLabelText('智芽学习成长空间')).not.toBeInTheDocument()
  })
})
