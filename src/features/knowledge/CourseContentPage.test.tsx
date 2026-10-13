import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AppStateProvider } from '../../app/AppState'
import { CourseContentPage } from './CourseContentPage'

describe('CourseContentPage', () => {
  it('embeds the 4-6 grade Bilibili lesson video inside the reading page', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="cxd" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    expect(screen.getByTitle('视频 1-1《AI 在身边：无处不在的智能应用》')).toHaveAttribute(
      'src',
      'https://player.bilibili.com/player.html?bvid=BV12dwVzuEmF&page=1&high_quality=1&danmaku=0&autoplay=0',
    )
  })

  it('keeps an accessible original-platform link beside each embedded lesson video', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="cxd" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    expect(screen.getByRole('link', { name: '在原平台打开视频 1-1《AI 在身边：无处不在的智能应用》' })).toHaveAttribute(
      'href',
      'https://www.bilibili.com/video/BV12dwVzuEmF',
    )
  })

  it('shows only one original-platform action for each embedded video', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="cxd" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    const firstVideoLinks = screen.getAllByRole('link').filter(
      (link) => link.getAttribute('href') === 'https://www.bilibili.com/video/BV12dwVzuEmF',
    )
    expect(firstVideoLinks).toHaveLength(1)
  })

  it('shows a clear fallback when an embedded lesson video cannot load', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="cxd" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    fireEvent.error(screen.getByTitle('视频 1-1《AI 在身边：无处不在的智能应用》'))

    expect(screen.getByRole('status')).toHaveTextContent('视频暂时无法在页内播放')
    expect(screen.getByRole('link', { name: '在原平台打开视频 1-1《AI 在身边：无处不在的智能应用》' })).toBeInTheDocument()
  })

  it('uses the illustrated page with dialogue for the primary comic', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="qmx" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    expect(screen.getByRole('img', { name: '飞船内' })).toHaveAttribute(
      'src',
      '/courses/qmx/with-text/page-05.png',
    )
  })

  it('preserves the full widescreen comic page instead of cropping it', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="qmx" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    const comicPage = screen.getByRole('img', { name: '飞船内' })
    expect(comicPage).toHaveAttribute('width', '1280')
    expect(comicPage).toHaveAttribute('height', '720')
    expect(comicPage).toHaveStyle({ aspectRatio: '16 / 9', objectFit: 'contain' })
  })

  it('renders the grade 5-6 primary chapter structure without the legacy lab HTML', () => {
    render(
      <AppStateProvider>
        <CourseContentPage courseId="ael" chapterNum={1} onBack={() => undefined} />
      </AppStateProvider>,
    )

    expect(screen.getByRole('heading', { name: '第1章 · AI 系统拆解站' })).toBeInTheDocument()
    expect(screen.getByText('AI 系统像一支合作队，每个部分都有自己的任务。')).toBeInTheDocument()
    expect(screen.getByText('AI 只是工具，重要决定要让人来负责。')).toBeInTheDocument()
  })

  it('marks a reading complete once and adds thirty points', async () => {
    const user = userEvent.setup()
    render(
      <AppStateProvider>
        <CourseContentPage courseId="ael" chapterNum={4} onBack={() => undefined} />
      </AppStateProvider>,
    )

    await user.click(screen.getByRole('button', { name: '完成本部分知识' }))
    expect(screen.getByRole('status')).toHaveTextContent('获得 30 积分')

    await user.click(screen.getByRole('button', { name: '已完成本部分知识' }))
    expect(screen.getAllByText(/获得 30 积分/)).toHaveLength(1)
  })
})
