// 纯 SVG 五维雷达图，不依赖 recharts，避免 lazy import 时第三方库加载失败。
// 数据由父组件基于真实学习进度（知识完成 + 测试通过）计算传入。
export type GrowthDatum = { dimension: string; value: number }

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 95

function pointAt(i: number, r: number) {
  // 五边形顶点，顶部为第一个（顺时针）
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const
}

function polygonPoints(r: number) {
  return Array.from({ length: 5 }, (_, i) => pointAt(i, r).join(',')).join(' ')
}

export function GrowthRadar({ data }: { data: GrowthDatum[] }) {
  const safeData = data.length === 5 ? data : [
    { dimension: '好奇探索', value: 0 },
    { dimension: '知识理解', value: 0 },
    { dimension: '问题解决', value: 0 },
    { dimension: '实践创造', value: 0 },
    { dimension: '自主规划', value: 0 },
  ]
  const dataPoints = safeData.map((d, i) => {
    const [x, y] = pointAt(i, (d.value / 100) * RADIUS)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="radar-wrap">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label="近期成长足迹五维雷达图" role="img">
        {/* 五层五边形网格 */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <polygon key={ratio} points={polygonPoints(RADIUS * ratio)} fill="none" stroke="var(--line)" strokeWidth={1} />
        ))}
        {/* 轴线 */}
        {safeData.map((_, i) => {
          const [x, y] = pointAt(i, RADIUS)
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--line)" strokeWidth={1} />
        })}
        {/* 数据区域 */}
        <polygon points={dataPoints} fill="var(--primary)" fillOpacity={0.22} stroke="var(--primary-deep)" strokeWidth={2} />
        {/* 数据顶点 */}
        {safeData.map((d, i) => {
          const [x, y] = pointAt(i, (d.value / 100) * RADIUS)
          return <circle key={d.dimension} cx={x} cy={y} r={3.5} fill="var(--primary-deep)" />
        })}
        {/* 维度标签 */}
        {safeData.map((d, i) => {
          const [x, y] = pointAt(i, RADIUS + 18)
          const anchor = i === 1 || i === 2 ? 'start' : i === 3 || i === 4 ? 'end' : 'middle'
          return (
            <text key={d.dimension} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fill="var(--muted)" fontSize={11} fontWeight={700}>
              {d.dimension}
            </text>
          )
        })}
      </svg>
      <p className="radar-caption">
        {safeData.map((d) => `${d.dimension} ${d.value}`).join(' · ')}
      </p>
      <p className="sr-only">近期在好奇探索、知识理解、问题解决、实践创造和自主规划方面都有新的学习足迹，不代表固定能力评价。</p>
    </div>
  )
}
