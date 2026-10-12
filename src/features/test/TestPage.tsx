import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FlaskConical,
  Flame,
  Gem,
  Gift,
  Lock,
  Power,
  Rocket,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useAppState } from '../../app/AppState'
import { AiCompanion } from '../ai_companion/AiCompanion'
import { getQuiz } from './quizData'
import { QuizModal } from './QuizModal'
import './test.css'

/* ===== AI 学习关卡数据 ===== */
type LevelStatus = 'completed' | 'current' | 'locked' | 'chest' | 'trophy'
type IslandTheme = 'star' | 'home' | 'vision' | 'sound' | 'wisdom' | 'time' | 'mist' | 'castle' | 'idea' | 'detective' | 'learning' | 'ethics'

type Level = {
  id: string
  status: LevelStatus
  title: string
  x: number // 0..100, 相对宽度百分比
  y: number // 0..100, 相对高度百分比（从下往上！底部是0，顶部是100）
  quizIndex?: number // 对应 quizData 章节序号（1-based）；宝箱/奖杯无
  island?: IslandTheme
}

// 1~3 年级：启明星大冒险 · 8 座岛（对应 8 集连环画）
const levelsQmx: Level[] = [
  { id: 'l1', status: 'completed', title: '启明星岛', x: 50, y: 3, quizIndex: 1, island: 'star' },
  { id: 'l2', status: 'completed', title: '家居岛', x: 28, y: 13, quizIndex: 2, island: 'home' },
  { id: 'l3', status: 'current', title: '眼睛岛', x: 72, y: 23, quizIndex: 3, island: 'vision' },
  { id: 'l4', status: 'locked', title: '耳朵岛', x: 22, y: 34, quizIndex: 4, island: 'sound' },
  { id: 'c1', status: 'chest', title: '宝石宝箱', x: 50, y: 44 },
  { id: 'l5', status: 'locked', title: '智慧岛', x: 78, y: 54, quizIndex: 5, island: 'wisdom' },
  { id: 'l6', status: 'locked', title: '时光岛', x: 22, y: 64, quizIndex: 6, island: 'time' },
  { id: 'l7', status: 'locked', title: '迷雾岛', x: 72, y: 74, quizIndex: 7, island: 'mist' },
  { id: 'l8', status: 'locked', title: '城堡岛', x: 28, y: 84, quizIndex: 8, island: 'castle' },
  { id: 't1', status: 'trophy', title: '启明星徽章', x: 50, y: 95 },
]

// 4~6 年级：AI 创想大陆 · 6 章读本
const levelsCxd: Level[] = [
  { id: 'l1', status: 'completed', title: 'AI超能力图鉴', x: 50, y: 5, quizIndex: 1, island: 'star' },
  { id: 'l2', status: 'completed', title: '把话说清楚', x: 28, y: 18, quizIndex: 2, island: 'sound' },
  { id: 'l3', status: 'current', title: '创意放大器', x: 72, y: 32, quizIndex: 3, island: 'idea' },
  { id: 'l4', status: 'locked', title: '真相侦探社', x: 22, y: 48, quizIndex: 4, island: 'detective' },
  { id: 'l5', status: 'locked', title: '教AI认世界', x: 78, y: 62, quizIndex: 5, island: 'learning' },
  { id: 'c1', status: 'chest', title: '创想宝箱', x: 50, y: 75 },
  { id: 'l6', status: 'locked', title: '负责任的创想家', x: 28, y: 86, quizIndex: 6, island: 'ethics' },
  { id: 't1', status: 'trophy', title: '创想家徽章', x: 50, y: 97 },
]

// 7~9 年级：AI 原理实验室 · 8 章（第 9 章项目=奖杯）
const levelsLab: Level[] = [
  { id: 'l1', status: 'completed', title: 'AI系统解剖室', x: 50, y: 3, quizIndex: 1 },
  { id: 'l2', status: 'completed', title: '数据侦探营', x: 28, y: 13, quizIndex: 2 },
  { id: 'l3', status: 'current', title: '算法的工具箱', x: 72, y: 23, quizIndex: 3 },
  { id: 'l4', status: 'locked', title: '第一次AI实验', x: 22, y: 34, quizIndex: 4 },
  { id: 'l5', status: 'locked', title: '给AI打分', x: 78, y: 44, quizIndex: 5 },
  { id: 'c1', status: 'chest', title: '实验宝箱', x: 50, y: 54 },
  { id: 'l6', status: 'locked', title: '生成式AI的真相', x: 22, y: 64, quizIndex: 6 },
  { id: 'l7', status: 'locked', title: '从模型到产品', x: 72, y: 74, quizIndex: 7 },
  { id: 'l8', status: 'locked', title: '与AI共处', x: 28, y: 84, quizIndex: 8 },
  { id: 't1', status: 'trophy', title: '我的AI项目', x: 50, y: 95 },
]

/* 资源数据 */
const resources = [
  { icon: 'flame' as const, value: 6, label: '连续' },
  { icon: 'gem' as const, value: 710, label: '宝石' },
  { icon: 'bolt' as const, value: 25, label: '能量' },
]

/* ===== 云朵小羊吉祥物 SVG =====
   遮挡顺序（从后到前）：
   腿 → 身体主块 → 头顶云朵凸起 → 头部脸盘 → 小角 → 眼睛 → 腮红 → 鼻子/嘴 → 胳膊（最前）
*/
function CloudLambMascot({
  variant,
  action = 'wave',
}: {
  variant: 'elementary' | 'secondary'
  action?: 'wave' | 'cheer'
}) {
  const isElem = variant === 'elementary'
  const bodyMain = isElem ? '#FFF5E8' : '#F0F4FF'
  const bodyMid = isElem ? '#FFE8D0' : '#DCE6F8'
  const bodyBottom = isElem ? '#FFD4B8' : '#C8D6F4'
  const cheek = isElem ? '#FFB8C8' : '#B8C8F0'
  const nose = isElem ? '#F0A070' : '#8AA0D8'
  const leg = isElem ? '#E8C89C' : '#B8C4E0'
  const tuft = isElem ? '#FFE4B8' : '#D8E0F8'
  const horn = isElem ? '#FFC89C' : '#C0CCE8'

  return (
    <div className="mascot-wrap">
      <div className="mascot-bubble" aria-hidden="true">嗨！一起学AI吧～</div>

      {/* viewBox 留足空间做动作 */}
      <svg viewBox="0 0 180 200" width="150" height="168" aria-hidden="true" className={`mascot-svg mascot-action-${action}`}>
        {/* ==== 地面投影 ==== */}
        <ellipse cx="90" cy="192" rx="44" ry="6" fill="rgba(0,0,0,0.08)" />

        {/* ================ 第 1 层：腿（最后面） ================ */}
        <g className="legs-group">
          <rect x="58" y="150" width="16" height="30" rx="8" fill={leg} className="leg leg-l" />
          <rect x="106" y="150" width="16" height="30" rx="8" fill={leg} className="leg leg-r" />
          <ellipse cx="66" cy="182" rx="12" ry="5" fill={leg} />
          <ellipse cx="114" cy="182" rx="12" ry="5" fill={leg} />
        </g>

        {/* ================ 第 2 层：身体主云朵 ================ */}
        <g className="body-group">
          <ellipse cx="90" cy="130" rx="56" ry="44" fill={bodyMid} />
          <circle cx="40" cy="118" r="22" fill={bodyMain} />
          <circle cx="52" cy="92" r="24" fill={bodyMain} />
          <circle cx="90" cy="78" r="26" fill={bodyMain} />
          <circle cx="128" cy="92" r="24" fill={bodyMain} />
          <circle cx="140" cy="118" r="22" fill={bodyMain} />
          <circle cx="144" cy="140" r="20" fill={bodyMid} />
          <circle cx="36" cy="140" r="20" fill={bodyMid} />
          <ellipse cx="90" cy="158" rx="48" ry="16" fill={bodyBottom} opacity="0.9" />
        </g>

        {/* ================ 第 3 层：头顶呆毛 / 云朵漩涡 ================ */}
        {isElem ? (
          <g className="tuft">
            <path d="M90 78 Q 94 50 86 28 Q 82 52 82 78 Z" fill={tuft} />
            <ellipse cx="86" cy="24" rx="10" ry="12" fill={tuft} />
          </g>
        ) : (
          <g className="tuft">
            <circle cx="90" cy="52" r="18" fill={tuft} />
            <circle cx="76" cy="46" r="14" fill={tuft} />
            <circle cx="104" cy="46" r="14" fill={tuft} />
            <circle cx="90" cy="38" r="12" fill={tuft} />
          </g>
        )}

        {/* ================ 第 4 层：小羊角 ================ */}
        <ellipse cx="68" cy="78" rx="6" ry="14" fill={horn} transform="rotate(-18 68 78)" />
        <ellipse cx="112" cy="78" rx="6" ry="14" fill={horn} transform="rotate(18 112 78)" />

        {/* ================ 第 5 层：大眼睛 ================ */}
        <g className="eyes-group">
          <g className="eye eye-l">
            <ellipse cx="72" cy="108" rx="14" ry="17" fill="#2D2438" />
            <ellipse cx="76" cy="102" rx="5" ry="6" fill="#FFFFFF" />
            <circle cx="71" cy="113" r="3" fill="#FFFFFF" />
          </g>
          <g className="eye eye-r">
            <ellipse cx="108" cy="108" rx="14" ry="17" fill="#2D2438" />
            <ellipse cx="112" cy="102" rx="5" ry="6" fill="#FFFFFF" />
            <circle cx="107" cy="113" r="3" fill="#FFFFFF" />
          </g>
        </g>

        {/* ================ 第 6 层：腮红 ================ */}
        <circle cx="56" cy="128" r="11" fill={cheek} opacity="0.7" />
        <circle cx="124" cy="128" r="11" fill={cheek} opacity="0.7" />

        {/* ================ 第 7 层：鼻子 + 嘴 ================ */}
        <ellipse cx="90" cy="128" rx="6" ry="4" fill={nose} />
        <path d="M 82 134 Q 90 142 98 134" stroke={nose} strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* ================ 第 8 层：胳膊（最前方） ================ */}
        <g className="arm arm-l">
          <ellipse cx="26" cy="128" rx="10" ry="18" fill={bodyMid} transform="rotate(30 26 128)" />
          <circle cx="20" cy="140" r="8" fill={bodyMain} />
        </g>
        <g className="arm arm-r">
          <ellipse cx="154" cy="128" rx="10" ry="18" fill={bodyMid} transform="rotate(-30 154 128)" />
          <circle cx="160" cy="140" r="8" fill={bodyMain} />
        </g>
      </svg>
    </div>
  )
}

/* ===== 卡通 3D 圆柱币（薄版 SVG） =====
   结构（从下到上）：
   地面投影 → 底面椭圆 → 侧面厚度带 → 顶面椭圆 → 高光 → 图标
*/
function Coin3D({ status, title, onClick }: { status: 'completed' | 'current' | 'locked'; title?: string; onClick?: () => void }) {
  const isCurrent = status === 'current'
  const label = `${title ?? ''} · ${status === 'current' ? '当前关卡' : status === 'completed' ? '已完成' : '未解锁'}`

  return (
    <button type="button" className={`level-coin level-coin-svg level-${status}`} aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 100 56" className="coin-svg" role="img" aria-hidden="true">
        {/* 1. 地面投影 */}
        <ellipse className="c-ground" cx="50" cy="52" rx="38" ry="4" />

        {/* 2. 底面椭圆（贴近，薄！） */}
        <ellipse className="c-bottom" cx="50" cy="44" rx="36" ry="8" />

        {/* 3. 侧面厚度带（薄！只有 14px 高） */}
        <rect className="c-side-mid" x="14" y="30" width="72" height="14" />
        {/* 侧面衔接圆角（让顶底过渡自然，不是硬切） */}
        <path className="c-side-l" d="M14 30 Q 10 37 14 44 L14 30 Z" />
        <path className="c-side-r" d="M86 30 Q 90 37 86 44 L86 30 Z" />
        <rect className="c-side-bottom-stripe" x="14" y="40" width="72" height="4" />

        {/* 4. 顶面椭圆（主视觉） */}
        <ellipse className="c-face" cx="50" cy="30" rx="36" ry="8" />

        {/* 5. 顶面高光 */}
        <ellipse className="c-shine" cx="42" cy="27" rx="18" ry="3.5" />

        {/* 6. 图标 */}
        {status === 'completed' && (
          <path className="c-icon c-icon-check" d="M34 30 L44 37 L66 19" />
        )}
        {status === 'current' && (
          <g className="c-icon c-icon-book" transform="translate(50 30)">
            <path d="M-13 -9 L-13 11 L13 11 L13 -9 Z" />
            <path d="M-9 -7 L0 -5 L9 -7" />
            <path d="M0 -5 L0 11" />
          </g>
        )}
        {status === 'locked' && (
          <g className="c-icon c-icon-lock" transform="translate(50 30)">
            <rect x="-8" y="-1" width="16" height="11" rx="2.2" />
            <path d="M-6 -1 Q-6 -11 0 -11 Q6 -11 6 -1" />
            <circle cx="0" cy="4" r="1.3" />
          </g>
        )}
      </svg>

      {isCurrent && <div className="current-ring" />}
      {isCurrent && <div className="current-glow" />}
    </button>
  )
}

/* 小岛地貌只承担氛围与辨识度，关卡按钮仍保持在视觉最前方。 */
function IslandLandscape({ theme, title }: { theme: IslandTheme; title: string }) {
  const landmark = (() => {
    switch (theme) {
      case 'star':
        return <g className="island-landmark island-landmark--star"><path d="M66 8l3.5 8 8.5.7-6.5 5.7 2 8.3-7.5-4.4-7.5 4.4 2-8.3-6.5-5.7 8.5-.7z" /><circle cx="91" cy="19" r="3" /><circle cx="43" cy="22" r="2.5" /></g>
      case 'home':
        return <g className="island-landmark island-landmark--home"><rect x="53" y="19" width="25" height="19" rx="3" /><path d="M49 21l17-13 17 13z" /><rect x="62" y="27" width="7" height="11" rx="2" /><path d="M88 37V22" /><circle cx="88" cy="18" r="8" /></g>
      case 'vision':
        return <g className="island-landmark island-landmark--vision"><path d="M45 25q21-18 42 0-21 18-42 0z" /><circle cx="66" cy="25" r="8" /><circle cx="68" cy="22" r="2.5" /><path d="M88 35l9 8" /></g>
      case 'sound':
        return <g className="island-landmark island-landmark--sound"><rect x="61" y="15" width="10" height="24" rx="5" /><path d="M51 21q-8 5 0 10M81 21q8 5 0 10M44 16q-15 10 0 20M88 16q15 10 0 20" /></g>
      case 'wisdom':
        return <g className="island-landmark island-landmark--wisdom"><path d="M47 39V24M66 39V18M86 39V26" /><circle cx="47" cy="20" r="9" /><circle cx="66" cy="14" r="11" /><circle cx="86" cy="22" r="8" /><circle cx="72" cy="14" r="2.5" /></g>
      case 'time':
        return <g className="island-landmark island-landmark--time"><circle cx="66" cy="24" r="15" /><circle cx="66" cy="24" r="9" /><path d="M66 24V16M66 24l7 4M43 32l-8 4M89 13l8-5" /></g>
      case 'mist':
        return <g className="island-landmark island-landmark--mist"><path d="M36 22h26M49 30h46M29 38h55" /><circle cx="78" cy="18" r="8" /><circle cx="87" cy="20" r="6" /></g>
      case 'castle':
        return <g className="island-landmark island-landmark--castle"><path d="M47 39V16h12v8h14v-8h12v23z" /><path d="M47 16V9h5v4h3V9h4v7M73 16V9h4v4h4V9h4v7" /><rect x="62" y="29" width="8" height="10" rx="4" /></g>
      case 'idea':
        return <g className="island-landmark island-landmark--idea"><path d="M55 22a11 11 0 1 1 19 8c-3 3-4 5-4 8h-9c0-3-1-5-4-8a11 11 0 0 1-2-8z" /><path d="M61 42h9M43 17l-8-4M89 17l8-4M66 5V0" /></g>
      case 'detective':
        return <g className="island-landmark island-landmark--detective"><circle cx="61" cy="23" r="13" /><path d="M70 33l13 12M47 11l9-5 14 3 7 8H43z" /></g>
      case 'learning':
        return <g className="island-landmark island-landmark--learning"><path d="M43 16q12-5 23 3v22q-11-8-23-3zM89 16q-12-5-23 3v22q11-8 23-3z" /><path d="M66 19v22" /></g>
      case 'ethics':
        return <g className="island-landmark island-landmark--ethics"><path d="M66 8l19 8v12c0 10-8 16-19 21-11-5-19-11-19-21V16z" /><path d="M56 28l7 7 14-15" /></g>
    }
  })()

  return (
    <svg className={`island-landscape island-landscape--${theme}`} viewBox="0 0 132 70" role="img" aria-label={`${title}地貌`}>
      <ellipse className="island-landscape__shadow" cx="66" cy="59" rx="49" ry="7" />
      <path className="island-landscape__cliff" d="M16 37c6-15 23-22 50-22s44 7 50 22l-13 21c-18 8-56 8-74 0z" />
      <ellipse className="island-landscape__grass" cx="66" cy="36" rx="50" ry="22" />
      <path className="island-landscape__shore" d="M20 38c10 9 23 11 46 11s37-2 46-11" />
      {landmark}
    </svg>
  )
}

/* ===== 关卡节点渲染 ===== */
function LevelNode({ level, index, onQuiz }: { level: Level; index: number; onQuiz?: (lv: Level) => void }) {
  // 计算路径方向（左右交错）
  const offsetSide = index % 2 === 0 ? 'left' : 'right'
  const canQuiz = (level.status === 'completed' || level.status === 'current') && level.quizIndex !== undefined

  if (level.status === 'chest') {
    return (
      <div
        className={`level-node chest-node ${offsetSide}`}
        style={{ left: `${level.x}%`, bottom: `${level.y}%` }}
      >
        <div className="level-shadow-chest" />
        <div className="level-chest" aria-label={`${level.title} 节点`}>
          <svg viewBox="0 0 64 64" width="56" height="56">
            <rect x="8" y="26" width="48" height="30" rx="4" className="chest-body" />
            <rect x="8" y="14" width="48" height="20" rx="10" className="chest-lid" />
            <rect x="28" y="26" width="8" height="14" rx="2" className="chest-lock" />
            <circle cx="32" cy="32" r="2" className="chest-lock-hole" />
            <rect x="8" y="24" width="48" height="4" rx="2" className="chest-band" />
          </svg>
        </div>
      </div>
    )
  }

  if (level.status === 'trophy') {
    return (
      <div
        className={`level-node trophy-node ${offsetSide}`}
        style={{ left: `${level.x}%`, bottom: `${level.y}%` }}
      >
        <div className="level-shadow-trophy" />
        <div className="level-trophy" aria-label={`${level.title} 节点`}>
          <svg viewBox="0 0 64 64" width="58" height="62">
            <path d="M 14 14 Q 14 36 32 40 Q 50 36 50 14 Z" className="trophy-cup" />
            <path d="M 14 20 Q 4 22 6 32 Q 8 38 18 36" className="trophy-handle" />
            <path d="M 50 20 Q 60 22 58 32 Q 56 38 46 36" className="trophy-handle" />
            <rect x="20" y="42" width="24" height="6" rx="2" className="trophy-base" />
            <rect x="16" y="48" width="32" height="6" rx="2" className="trophy-foot" />
            <ellipse cx="24" cy="22" rx="4" ry="10" className="trophy-shine" />
          </svg>
        </div>
      </div>
    )
  }

  // 普通关卡节点（完成 / 当前 / 锁定）
  return (
    <div
      className={`level-node circle-node ${offsetSide} level-${level.status}`}
      style={{ left: `${level.x}%`, bottom: `${level.y}%` }}
    >
      {level.island && <IslandLandscape theme={level.island} title={level.title} />}
      <div className="level-shadow-circle" />
      <Coin3D
        status={level.status}
        title={level.title}
        onClick={canQuiz ? () => onQuiz?.(level) : undefined}
      />
      <span className="level-label">{level.title}</span>
    </div>
  )
}

function getActionableLevel(levels: Level[]) {
  return levels.find((level) => level.status === 'current' && level.quizIndex !== undefined)
    ?? levels.find((level) => level.quizIndex !== undefined)
    ?? null
}

function ElementaryAdventureMap({
  levels,
  onQuiz,
  variant,
}: {
  levels: Level[]
  onQuiz: (level: Level) => void
  variant: 'qmx' | 'cxd'
}) {
  const routeRef = useRef<HTMLDivElement>(null)
  const nextLevel = getActionableLevel(levels)
  const companionTarget = nextLevel ? {
    id: nextLevel.id,
    x: nextLevel.x,
    y: Math.max(5, Math.min(94, nextLevel.y + 2)),
  } : undefined
  const completedCount = levels.filter((level) => level.status === 'completed' && level.quizIndex !== undefined).length
  const challengeCount = levels.filter((level) => level.quizIndex !== undefined).length
  const pathD = levels.map((level, index) => {
    const cx = level.x
    const cy = 100 - level.y
    if (index === 0) return `M ${cx} ${cy}`
    const previous = levels[index - 1]
    const previousY = 100 - previous.y
    return ` Q ${previous.x} ${(cy + previousY) / 2}, ${cx} ${cy}`
  }).join(' ')

  useEffect(() => {
    const route = routeRef.current
    const canvas = route?.querySelector<HTMLElement>('.elementary-route__canvas')
    if (!route || !canvas || !nextLevel) return

    const canvasHeight = canvas.clientHeight || (variant === 'cxd' ? 780 : 970)
    const currentCenterFromTop = ((100 - nextLevel.y) / 100) * canvasHeight
    const centeredScrollTop = currentCenterFromTop - route.clientHeight / 2
    const maxScrollTop = Math.max(0, route.scrollHeight - route.clientHeight)
    route.scrollTop = Math.max(0, Math.min(centeredScrollTop, maxScrollTop))
  }, [levels.length, nextLevel?.id, nextLevel?.y, variant])

  const routeLabel = variant === 'cxd'
    ? '可上下滑动的4至6年级岛屿路线'
    : '可上下滑动的岛屿路线'

  return (
    <section className="level-map level-map--elementary" aria-label="闯关地图">
      <div className="adventure-brief">
        <div className="adventure-brief__copy">
          <span className="adventure-brief__eyebrow"><Sparkles size={14} />冒险进度 {completedCount} / {challengeCount}</span>
          <h3>下一站：{nextLevel?.title ?? '新的小岛'}</h3>
          <p>每完成一关，就点亮一颗启明星宝石。</p>
        </div>
        {nextLevel && (
          <button type="button" className="map-action map-action--elementary" onClick={() => onQuiz(nextLevel)}>
            出发挑战：{nextLevel.title}<ArrowRight size={17} />
          </button>
        )}
      </div>

      <div className="route-scroll-hint" id="elementary-route-hint"><span aria-hidden="true">↕</span>上下滑动，探索完整岛屿路线</div>
      <div className="elementary-route-shell">
        <div
          ref={routeRef}
          className={`elementary-route elementary-route--${variant}`}
          role="region"
          aria-label={routeLabel}
          aria-describedby="elementary-route-hint"
          tabIndex={0}
          style={{ overflowY: 'auto', touchAction: 'pan-y' }}
        >
          <div className={`elementary-route__canvas elementary-route__canvas--${variant}`}>
            <div className="map-bg-glow map-glow-1" aria-hidden="true" />
            <div className="map-bg-glow map-glow-2" aria-hidden="true" />
            <svg className="map-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="pathStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--path-c1)" />
                  <stop offset="100%" stopColor="var(--path-c2)" />
                </linearGradient>
              </defs>
              <path d={pathD} fill="none" stroke="url(#pathStroke)" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="1.5 1" className="map-path-line" />
            </svg>
            {levels.map((level, index) => <LevelNode key={level.id} level={level} index={index} onQuiz={onQuiz} />)}
            {companionTarget && <AiCompanion placement="test-map" mapTarget={companionTarget} />}
          </div>
        </div>
      </div>
    </section>
  )
}

function SecondaryResearchMap({
  levels,
  onQuiz,
}: {
  levels: Level[]
  onQuiz: (level: Level) => void
}) {
  const currentLevel = getActionableLevel(levels)
  const completedCount = levels.filter((level) => level.status === 'completed' && level.quizIndex !== undefined).length
  const challengeCount = levels.filter((level) => level.quizIndex !== undefined).length

  return (
    <section className="level-map level-map--secondary" aria-label="闯关地图">
      <div className="research-brief">
        <div className="research-brief__signal" aria-hidden="true"><FlaskConical size={21} /></div>
        <div className="research-brief__copy">
          <span>当前研究任务</span>
          <h3>{currentLevel?.title ?? '等待新的研究任务'}</h3>
          <p>已完成 {completedCount} / {challengeCount} 个学习实验</p>
        </div>
        {currentLevel && (
          <button type="button" className="map-action map-action--secondary" onClick={() => onQuiz(currentLevel)}>
            开始任务<ArrowRight size={17} />
          </button>
        )}
      </div>

      <ol className="research-route" aria-label="科研任务路线">
        {levels.map((level, index) => {
          const isLesson = level.quizIndex !== undefined
          const canQuiz = isLesson && (level.status === 'completed' || level.status === 'current')
          const statusText = level.status === 'completed' ? '已完成' : level.status === 'current' ? '进行中' : '待解锁'

          if (level.status === 'chest') {
            return (
              <li key={level.id} className="research-route__milestone research-route__milestone--data">
                <span className="research-route__marker"><Gift size={18} /></span>
                <div><strong>实验数据包</strong><small>{level.title}将在路线推进后开启</small></div>
              </li>
            )
          }

          if (level.status === 'trophy') {
            return (
              <li key={level.id} className="research-route__milestone research-route__milestone--trophy">
                <span className="research-route__marker"><Trophy size={18} /></span>
                <div><strong>项目里程碑</strong><small>{level.title}</small></div>
              </li>
            )
          }

          return (
            <li key={level.id} className={`research-route__item research-route__item--${level.status}`}>
              <span className="research-route__line" aria-hidden="true" />
              <button
                type="button"
                className="research-task"
                disabled={!canQuiz}
                onClick={canQuiz ? () => onQuiz(level) : undefined}
                aria-label={`${level.title}，${statusText}`}
              >
                <span className="research-task__number">
                  {level.status === 'completed' ? <Check size={17} /> : level.status === 'locked' ? <Lock size={15} /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className="research-task__copy">
                  <strong>{level.title}</strong>
                  <small>{level.status === 'current' ? '正在进行 · 完成答题解锁下一项' : statusText}</small>
                </span>
                {level.status === 'current' && <Rocket size={18} className="research-task__go" aria-hidden="true" />}
                {level.status === 'completed' && <CheckCircle2 size={18} className="research-task__done" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ===== 主组件 ===== */
export function TestPage() {
  const { state } = useAppState()

  // 根据学段+年级选择关卡：1-3年级(qmx) / 4-6年级(cxd) / 中学(lab)
  const baseLevels: Level[] =
    state.stage === 'secondary'
      ? levelsLab
      : ['grade1', 'grade2', 'grade3'].includes(state.grade)
        ? levelsQmx
        : levelsCxd

  // 课程 ID（取练习题用）
  const courseId = state.stage === 'secondary'
    ? 'lab'
    : ['grade1', 'grade2', 'grade3'].includes(state.grade) ? 'qmx' : 'cxd'
  const quiz = getQuiz(courseId)

  // 已通关的关卡 id（本地状态：默认完成/当前关卡；通关 quiz 后加入）
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(baseLevels.filter((l) => l.status === 'completed').map((l) => l.id))
  )
  // 当前打开的答题关卡
  const [activeQuiz, setActiveQuiz] = useState<Level | null>(null)

  // 实时状态：基础 status + 通关进度
  const liveStatus = (lv: Level): LevelStatus => {
    if (lv.status === 'chest' || lv.status === 'trophy') return lv.status
    if (completed.has(lv.id)) return 'completed'
    // 只以前一节真实课程为解锁依据；宝箱是奖励节点，不能跳过尚未完成的课程。
    const idx = baseLevels.findIndex((l) => l.id === lv.id)
    const previousLesson = baseLevels.slice(0, idx).reverse().find((level) => level.quizIndex !== undefined)
    if (previousLesson && completed.has(previousLesson.id)) return 'current'
    return lv.status === 'current' ? 'current' : 'locked'
  }

  const levels: Level[] = baseLevels.map((lv) => ({ ...lv, status: liveStatus(lv) }))

  // 点击关卡 → 开启答题
  const handleQuiz = (lv: Level) => {
    if (lv.quizIndex === undefined) return
    setActiveQuiz(lv)
  }

  // 答题完成：通关则解锁下一关
  const handleComplete = (score: number, total: number) => {
    if (!activeQuiz || activeQuiz.quizIndex === undefined) return
    const passed = total > 0 && score / total >= 0.6
    if (passed) {
      setCompleted((prev) => {
        const next = new Set(prev)
        next.add(activeQuiz.id)
        return next
      })
    }
  }

  const unitTitle =
    courseId === 'qmx' ? '启明星大冒险'
      : courseId === 'cxd' ? 'AI 创想大陆'
        : 'AI 原理实验室'
  const unitNum =
    courseId === 'qmx' ? '闯关 · 8 颗宝石'
      : courseId === 'cxd' ? '闯关 · 6 枚徽章'
        : '闯关 · 8 章实验'

  return (
    <div className={`test-page test-page--${state.stage}`}>
      {/* 顶部区：章节标题 + 资源 */}
      <header className="test-header">
        <div className="test-unit">
          <span className="unit-num">{unitNum}</span>
          <h2>{unitTitle}</h2>
        </div>
        <div className="resource-row">
          {resources.map((r) => (
            <div key={r.icon} className="chip">
              <span className={`chip-icon chip-${r.icon}`}>
                {r.icon === 'flame' && <Flame aria-hidden="true" size={16} />}
                {r.icon === 'gem' && <Gem aria-hidden="true" size={16} />}
                {r.icon === 'bolt' && <Power aria-hidden="true" size={16} />}
              </span>
              <span className="chip-val">{r.value}</span>
            </div>
          ))}
        </div>
      </header>

      {state.stage === 'elementary'
        ? <ElementaryAdventureMap levels={levels} onQuiz={handleQuiz} variant={courseId === 'cxd' ? 'cxd' : 'qmx'} />
        : <SecondaryResearchMap levels={levels} onQuiz={handleQuiz} />}

      {/* 答题弹层 */}
      {activeQuiz && activeQuiz.quizIndex !== undefined && (
        <QuizModal
          levelTitle={activeQuiz.title}
          chapter={quiz[activeQuiz.quizIndex - 1]}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
