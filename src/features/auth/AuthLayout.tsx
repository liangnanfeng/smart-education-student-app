import type { PropsWithChildren, ReactNode } from 'react'
import './auth.css'

type AuthLayoutProps = PropsWithChildren<{
  title: string
  subtitle: string
  backAction?: ReactNode
  companion?: ReactNode
  showBrand?: boolean
}>

export function AuthLayout({ title, subtitle, backAction, companion, showBrand = true, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />
      <section className={`auth-shell ${companion ? 'auth-shell--with-companion' : ''}`}>
        {showBrand && (
          <div className="auth-brand-block" aria-label="智芽学习成长空间">
            <span className="auth-brand-mark">
              <img src="/brand/zhinya-mark.png" alt="智芽品牌标志" />
            </span>
            <span className="auth-brand-copy">
              <strong>智芽</strong>
              <span>小学生的 AI 学习成长伙伴</span>
            </span>
          </div>
        )}
        {backAction}
        {companion}
        <header className="auth-heading">
          <p className="brand-kicker">从好奇出发，学会思考与创造</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
