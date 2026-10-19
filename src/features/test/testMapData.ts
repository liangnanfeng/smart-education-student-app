import { makeCoursePartId, type BandProgress, type CourseId, type CoursePartId } from '../../app/learning'
import type { CoursePackage } from '../knowledge/courseCatalog'

export type MapNode = {
  id: CoursePartId
  x: number
  y: number
  landmark: string
  detail: string
}

type NodeLayout = Omit<MapNode, 'id'>

const layouts: Record<CourseId, NodeLayout[]> = {
  qmx: [
    { x: 50, y: 12, landmark: '✨', detail: '从认识 AI 开始，点亮第一颗启明星。' },
    { x: 24, y: 23, landmark: '🏠', detail: '发现藏在家里的 AI 小帮手。' },
    { x: 72, y: 34, landmark: '👀', detail: '看看 AI 怎样认出图片里的秘密。' },
    { x: 30, y: 45, landmark: '🎧', detail: '听一听 AI 怎样理解声音。' },
    { x: 76, y: 56, landmark: '🧠', detail: '用好多例子帮助 AI 学会新本领。' },
    { x: 28, y: 67, landmark: '⏳', detail: '沿着时间线认识 AI 的成长。' },
    { x: 70, y: 78, landmark: '🌫️', detail: '穿过迷雾，记住 AI 也会犯错。' },
    { x: 46, y: 89, landmark: '🏰', detail: '守护自己的秘密，完成启明星旅程。' },
  ],
  cxd: [
    { x: 50, y: 14, landmark: '🔭', detail: '认识 AI 的能力，也看见它的边界。' },
    { x: 24, y: 28, landmark: '💬', detail: '把目标和要求说清楚。' },
    { x: 72, y: 42, landmark: '🎨', detail: '先构思，再和 AI 一起完善创意。' },
    { x: 28, y: 56, landmark: '🔎', detail: '查来源、做比较，当真相侦探。' },
    { x: 76, y: 70, landmark: '🧪', detail: '用安全样本教 AI 认识世界。' },
    { x: 48, y: 86, landmark: '🛡️', detail: '负责任地使用 AI，完成创想旅程。' },
  ],
  ael: [
    { x: 50, y: 10, landmark: '🧩', detail: '拆开一个 AI 系统，认识输入、模型和输出。' },
    { x: 24, y: 20, landmark: '🔎', detail: '检查数据来源、标签和代表性。' },
    { x: 74, y: 30, landmark: '🧰', detail: '为分类、聚类和预测任务选择工具。' },
    { x: 28, y: 40, landmark: '🧪', detail: '动手完成采集、训练、测试和改进。' },
    { x: 76, y: 50, landmark: '📋', detail: '用准确率和错误案例给 AI 打分。' },
    { x: 26, y: 60, landmark: '✨', detail: '写清提示、核验事实并尊重原创。' },
    { x: 72, y: 70, landmark: '🛠️', detail: '从真实需求出发制作产品原型。' },
    { x: 30, y: 80, landmark: '🛡️', detail: '识别风险，练习安全三步法。' },
    { x: 52, y: 90, landmark: '🏁', detail: '完成一个安全、可测试的 AI 小项目。' },
  ],
}

export function getMapNodes(courseId: CourseId): MapNode[] {
  return layouts[courseId].map((node, index) => ({
    ...node,
    id: makeCoursePartId(courseId, index + 1),
  }))
}

export function getCurrentPartId(course: CoursePackage, progress: BandProgress) {
  return course.parts.find((part) => !progress.testsPassed.includes(part.id) && progress.knowledgeCompleted.includes(part.id))?.id
    ?? course.parts.find((part) => !progress.knowledgeCompleted.includes(part.id))?.id
    ?? course.parts.at(-1)!.id
}
