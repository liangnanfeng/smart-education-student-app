import { ArrowLeft, BookOpen, Lightbulb, Target } from 'lucide-react'
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

// 1-3年级绘本分镜图片映射 (day → [panel images...], miniLessonImage)
const qmxImages: Record<number, { panels: string[]; lesson: string }> = {
  1: { panels: ['05_第1集格1_星空.png', '06_第1集格2_飞船内.png', '07_第1集格3_小贝疑惑.png', '08_第1集格4_博士星讲解.png', '09_第1集格5_登岛.png', '10_第1集格6_宝石到手.png', '11_第1集格7_飞船起飞.png'], lesson: '12_第1集小课堂_认识AI.png' },
  2: { panels: ['14_第2集格1_家居岛.png', '15_第2集格2_智能音箱.png', '16_第2集格3_人脸门锁.png', '17_第2集格4_扫地机器人.png', '18_第二集格5.png', '19_第2集格6_发现宝石.png', '20_第2集格7_飞向眼睛岛.png'], lesson: '21_第2集小课堂_AI在身边.png' },
  3: { panels: ['22_第3集格1_眼睛岛.png', '23_第3集格2_认不出.png', '24_第3集格3_厚相册.png', '25_第3集格4_学认猫.png', '26_第3集格5_认出来啦.png', '27_第3集格6_眼睛宝石.png', '28_第3集格7_飞向耳朵岛.png'], lesson: '29_第3集小课堂_AI会看.png' },
  4: { panels: ['30_第4集格1_耳朵岛.png', '31_第4集格2_听错了.png', '32_第4集格3_说清楚.png', '33_第4集格4_灯亮啦.png', '34_第4集格5_声音太小.png', '35_第4集格6_大声说.png', '36_第4集格7_耳朵宝石.png', '37_第4集格8_飞向智慧岛.png'], lesson: '38_第4集小课堂_AI会听.png' },
  5: { panels: ['39_第5集格1_智慧岛果园.png', '40_第5集格2_分不清.png', '41_第5集格3_水果相册.png', '42_第5集格4_学习中.png', '43_第5集格5_认出来啦.png', '44_第5集格6_吃水果.png', '45_第5集格7_智慧宝石.png', '46_第5集格8_飞向时光岛.png'], lesson: '47_第5集小课堂_机器学习.png' },
  6: { panels: ['48_第6集格1_时光岛时光机.png', '49_第6集格2_过去小零件.png', '50_第6集格3_学走路.png', '51_第6集格4_现在大帮手.png', '52_第6集格5_时光机内感动.png', '53_第6集格6_小蓝自信.png', '54_第6集格7_时光宝石.png', '55_第6集格8_飞向迷雾岛.png'], lesson: '56_第6集小课堂_AI的成长.png' },
  7: { panels: ['57_第7集格1_迷雾岛.png', '58_第7集格2_小多指方向.png', '59_第7集格3_蝴蝶.png', '60_第7集格4_大家安慰.png', '61_第7集格5_大家一起看.png', '62_第7集格6_雾散了.png', '63_第7集格7_思考宝石.png', '64_第7集格8_飞向城堡岛.png'], lesson: '65_第7集小课堂_AI会犯错.png' },
  8: { panels: ['66_第8集格1_城堡岛.png', '67_第8集格2_黑影.png', '68_第8集格3_小贝勇敢.png', '69_第8集格4_肩并肩.png', '70_第8集格5_黑影逃跑.png', '71_第8集格6_宝石汇聚.png', '72_第8集格7_启明星亮起.png', '73_第8集格8_大合影.png'], lesson: '74_第8集小课堂_守护秘密.png' },
}

const qmxImgBase = '/courses/qmx/'

function getPanelImage(day: number, panelIndex: number): string | undefined {
  const imgSet = qmxImages[day]
  if (!imgSet || panelIndex >= imgSet.panels.length) return undefined
  return qmxImgBase + imgSet.panels[panelIndex]
}

function getLessonImage(day: number): string | undefined {
  const imgSet = qmxImages[day]
  if (!imgSet) return undefined
  return qmxImgBase + imgSet.lesson
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
  return (
    <div className="story-content">
      <div className="story-goal">
        <Target size={16} />
        <span>{story.goal}</span>
      </div>

      <div className="story-panels">
        {story.panels.map((panel, i) => {
          const img = getPanelImage(story.day, i)
          return (
            <div key={i} className="story-panel">
              {img && <img className="panel-image" src={img} alt={panel.scene} loading="lazy" />}
              <span className="panel-scene">{panel.scene}</span>
              {panel.narration && <p className="panel-narration">{panel.narration}</p>}
              {panel.dialog.map((d, di) => (
                <div key={di} className="panel-dialog">
                  <span className="dialog-speaker">{d.speaker}</span>
                  <span className="dialog-line">{d.line}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="mini-lesson">
        {(() => {
          const img = getLessonImage(story.day)
          return img ? <img className="lesson-image" src={img} alt="博士星小课堂" loading="lazy" /> : null
        })()}
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
