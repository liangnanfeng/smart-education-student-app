import type { PropsWithChildren, ReactNode } from 'react'
import './auth.css'

type AuthLayoutProps = PropsWithChildren<{
  title: string
  subtitle: string
  backAction?: ReactNode
  companion?: ReactNode
}>

export function AuthLayout({ title, subtitle, backAction, companion, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />
      <section className={`auth-shell ${companion ? 'auth-shell--with-companion' : ''}`}>
        <div className="auth-brand-block" aria-label="数智学习小学成长空间">
          <span className="auth-brand-eyebrow">小学一至六年级</span>
          <strong>每一次好奇，都能长成新本领</strong>
        </div>
        {backAction}
        {companion}
        <header className="auth-heading">
          <p className="brand-kicker">智趣数智学堂</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {children}
      </section>
    </main>
  )
}
