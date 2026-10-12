import { ArrowLeft, BookOpen, ExternalLink, Lightbulb, PlayCircle, Target } from 'lucide-react'
import { useMemo } from 'react'
import { useAppState } from '../../app/AppState'
import { getCourseData } from './knowledgeData'
import { stories } from './content/storyContent'
import './course-content.css'

// 4-6年级 markdown 文件通过 Vite ?raw 导入
import ch1 from './content/cxd/01_AI超能力图鉴.md?raw'
import ch2 from './content/cxd/02_把话说清楚.md?raw'
import ch3 from './content/cxd/03_创意放大器.md?raw'
import ch4 from './content/cxd/04_真相侦探社.md?raw'
import ch5 from './content/cxd/05_教AI认世界.md?raw'
import ch6 from './content/cxd/06_负责任的创想家.md?raw'

// 7-9年级 HTML 文件
import labHtml from './content/lab/course.html?raw'

const cxdChapters = [ch1, ch2, ch3, ch4, ch5, ch6]

const bilibiliVideoPattern = /https:\/\/www\.bilibili\.com\/video\/(BV[0-9A-Za-z]+)/

// 文件夹内《启明星大冒险》完整版已包含对话框与旁白。
// 每一页直接使用带文字绘本，避免无字底图与对话文本分离。
const qmxTextPages: Record<number, number[]> = {
  1: [4, 5, 6, 7, 8, 9, 10, 11],
  2: [13, 14, 15, 16, 17, 18, 19, 20],
  3: [22, 23, 24, 25, 26, 27, 28, 29],
  4: [31, 32, 33, 34, 35, 36, 37, 38, 39],
  5: [41, 42, 43, 44, 45, 46, 47],
  6: [49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
  7: [60, 61, 62, 63, 64, 65, 66, 67],
  8: [69, 70, 71, 72, 73, 74, 75, 76, 77],
}

function getTextComicPage(page: number) {
  return `/courses/qmx/with-text/page-${String(page).padStart(2, '0')}.png`
}

// 极简 markdown → React 渲染
function renderMarkdown(md: string) {
  const lines = md.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // 空行
    if (!line.trim()) { i++; continue }

    // 水平线
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="md-hr" />)
      i++; continue
    }

    // 标题
    const hMatch = line.match(/^(#{1,3})\s+(.*)/)
    if (hMatch) {
      const level = hMatch[1].length
      const text = renderInline(hMatch[2])
      blocks.push(
        level === 1
          ? <h2 key={key++} className="md-h1">{text}</h2>
          : level === 2
            ? <h3 key={key++} className="md-h2">{text}</h3>
            : <h4 key={key++} className="md-h3">{text}</h4>
      )
      i++; continue
    }

    // 引用块
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const videoUrl = quoteLines.join('\n').match(bilibiliVideoPattern)?.[0]
      const videoTitle = quoteLines[0]?.match(/🎬\s*\*\*(.+?)\*\*/)?.[1]
      if (videoUrl && videoTitle) {
        const bvid = videoUrl.match(bilibiliVideoPattern)?.[1]
        blocks.push(
          <LessonVideoCard
            key={key++}
            title={videoTitle}
            videoUrl={videoUrl}
            bvid={bvid ?? ''}
            notes={quoteLines.slice(1).filter((q) => q.trim() && !bilibiliVideoPattern.test(q))}
          />,
        )
        continue
      }
      blocks.push(
        <blockquote key={key++} className="md-quote">
          {quoteLines.map((q, qi) => <p key={qi}>{renderInline(q)}</p>)}
        </blockquote>
      )
      continue
    }

    // 图片
    const imgMatch = line.match(/!\[.*\]\((.*)\)/)
    if (imgMatch) { i++; continue }

    // 列表
    if (line.startsWith('- ') || line.startsWith('  ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('  '))) {
        if (lines[i].startsWith('- ')) items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items.map((item, ii) => <li key={ii}>{renderInline(item)}</li>)}
        </ul>
      )
      continue
    }

    // 普通段落
    blocks.push(<p key={key++} className="md-p">{renderInline(line)}</p>)
    i++
  }

  return blocks
}

function LessonVideoCard({
  title,
  videoUrl,
  bvid,
  notes,
}: {
  title: string
  videoUrl: string
  bvid: string
  notes: string[]
}) {
  const playerUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=0`

  return (
    <section className="lesson-video-card" aria-label={title}>
      <div className="lesson-video-card__heading">
        <span className="lesson-video-card__icon" aria-hidden="true"><PlayCircle size={20} /></span>
        <div>
          <span>本章视频</span>
          <h4>{title}</h4>
        </div>
      </div>
      <div className="lesson-video-card__player">
        <iframe
          src={playerUrl}
          title={title}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a
        className="lesson-video-card__link"
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`在原平台打开${title}`}
      >
        前往 B 站观看<ExternalLink size={15} aria-hidden="true" />
      </a>
      {notes.length > 0 && (
        <div className="lesson-video-card__notes">
          {notes.map((note, index) => <p key={`${title}-${index}`}>{renderInline(note)}</p>)}
        </div>
      )}
    </section>
  )
}

// 行内格式：**bold** 和 链接
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

    if (boldMatch && (!linkMatch || boldMatch.index! < linkMatch.index!)) {
      if (boldMatch.index! > 0) parts.push(remaining.slice(0, boldMatch.index!))
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length)
    } else if (linkMatch) {
      if (linkMatch.index! > 0) parts.push(remaining.slice(0, linkMatch.index!))
      parts.push(<a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">{linkMatch[1]}</a>)
      remaining = remaining.slice(linkMatch.index! + linkMatch[0].length)
    } else {
      parts.push(remaining)
      break
    }
  }

  return <>{parts}</>
}

// 从7-9年级 HTML 中提取 body 内容
function extractHtmlBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)
  if (!bodyMatch) return html
  let body = bodyMatch[1]
  // 移除 script 标签
  body = body.replace(/<script[\s\S]*?<\/script>/g, '')
  // 移除 backtop 按钮
  body = body.replace(/<a[^>]*class="backtop"[\s\S]*?<\/a>/g, '')
  // 修正图片路径（去掉 images/ 前缀，使用外部链接或 placeholder）
  body = body.replace(/src="images\//g, 'src="https://via.placeholder.com/800x400?text=')
  return body
}

// 从7-9年级 HTML 中提取某一章的内容（含其 hero/导言可选）
function extractLabChapter(html: string, chapterNum: number): string | null {
  const body = extractHtmlBody(html)
  if (chapterNum === 0) {
    // 导言部分：hero + 写在前面 + 学习路线图（第一个 div.chapter 之前）
    const firstChapter = body.indexOf('<div class="chapter"')
    if (firstChapter === -1) return body
    return body.slice(0, firstChapter)
  }
  // 找到第 N 个 <div class="chapter" ...> ... 到下一个 <div class="chapter" 或末尾
  const chapters: string[] = []
  const re = /<div\s+class="chapter"[^>]*>/g
  let m: RegExpExecArray | null
  const starts: number[] = []
  while ((m = re.exec(body)) !== null) starts.push(m.index)
  for (let i = 0; i < starts.length; i++) {
    const end = i + 1 < starts.length ? starts[i + 1] : body.length
    chapters.push(body.slice(starts[i], end))
  }
  return chapters[chapterNum - 1] ?? null
}

type Props = {
  courseId: string
  chapterNum: number
  onBack: () => void
}

export function CourseContentPage({ courseId, chapterNum, onBack }: Props) {
  const { state } = useAppState()
  const course = getCourseData(state.stage, state.grade)

  const content = useMemo(() => {
    if (courseId === 'qmx') {
      return stories.find((s) => s.day === chapterNum) ?? null
    }
    if (courseId === 'cxd') {
      return cxdChapters[chapterNum - 1] ?? null
    }
    if (courseId === 'lab') {
      // 按章节 div 分割，正确取第 N 章内容
      return extractLabChapter(labHtml, chapterNum)
    }
    return null
  }, [courseId, chapterNum])

  return (
    <div className="course-content-page">
      <header className="content-header">
        <button type="button" className="content-back" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="content-course-name">{course.courseName}</p>
          <h1 className="content-title">
            {courseId === 'qmx' && `第${chapterNum}天 · ${(content as any)?.title ?? ''}`}
            {courseId === 'cxd' && `第${chapterNum}章 · ${course.chapters?.[chapterNum - 1]?.title ?? ''}`}
            {courseId === 'lab' && `第${chapterNum}章 · ${course.chapters?.[chapterNum - 1]?.title ?? ''}`}
          </h1>
        </div>
      </header>

      {courseId === 'qmx' && (content as any) && (
        <QmxContent story={content as any} />
      )}

      {courseId === 'cxd' && typeof content === 'string' && (
        <div className="markdown-body">{renderMarkdown(content)}</div>
      )}

      {courseId === 'lab' && typeof content === 'string' && (
        <div className="html-body" dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  )
}

// 1-3年级 故事内容渲染
function QmxContent({ story }: { story: NonNullable<typeof stories[0]> }) {
  const illustratedPages = qmxTextPages[story.day] ?? []

  return (
    <div className="story-content">
      <div className="story-goal">
        <Target size={16} />
        <span>{story.goal}</span>
      </div>

      <div className="story-panels">
        {illustratedPages.map((page, i) => {
          const panel = story.panels[i]
          return (
            <figure key={page} className="story-panel story-panel--illustrated">
              <img
                className="panel-image"
                src={getTextComicPage(page)}
                alt={panel?.scene ?? `第${story.day}天绘本第${i + 1}页`}
                loading={i > 1 ? 'lazy' : 'eager'}
                width={1280}
                height={720}
                style={{ aspectRatio: '16 / 9', objectFit: 'contain' }}
              />
              <figcaption>绘本 {i + 1} / {illustratedPages.length}</figcaption>
            </figure>
          )
        })}
      </div>

      <div className="mini-lesson">
        <div className="lesson-head">
          <Lightbulb size={18} />
          <span>博士星小课堂</span>
        </div>
        <p className="lesson-text">{story.miniLesson.text}</p>
      </div>

      <div className="story-challenge">
        <div className="challenge-head">
          <BookOpen size={18} />
          <span>闯关小挑战</span>
        </div>
        <p className="challenge-question">{story.challenge.question}</p>
        <div className="challenge-answer">
          <span className="answer-label">小提示</span>
          <p>{story.challenge.answer}</p>
        </div>
      </div>
    </div>
  )
}
