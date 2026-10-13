import { makeCoursePartId } from '../../app/learning'
import type { CourseId, CoursePartId } from '../../app/learning'
import { GRADE56_QUIZZES } from './grade56QuizData'

// 三年级段闯关练习题数据
// 兼容现有答题界面的三套小学练习题数据。

export type QuizQuestion =
  | { kind: 'sel'; q: string; opts: string[]; ans: number }   // 选择题
  | { kind: 'jud'; q: string; ans: boolean }                  // 判断题
  | { kind: 'sit'; q: string; line: string; ans: string }     // 情境/简答题

export type QuizChapter = {
  partId: CoursePartId
  title: string
  pill?: string
  questions: QuizQuestion[]
}

export type QuizData = QuizChapter[]

/* ========== 1~2年级：启明星大冒险 · 8 集练习题 ========== */
export const quizQmx: QuizData = withPartIds('qmx', [
  {
    title: '启明星岛 · 认识 AI',
    pill: '好奇宝石',
    questions: [
      { kind: 'sel', q: 'AI 是什么呀？', opts: ['天上一颗会发光的星星', '会看、会听、会帮忙的聪明工具', '一种会飞的飞船', '一种好吃的糖果'], ans: 1 },
      { kind: 'jud', q: 'AI 只会做一件事，别的都不会。', ans: false },
      { kind: 'sel', q: '下面哪个是 AI 在帮忙？', opts: ['门锁认出你的脸开门', '妈妈手工扫地', '爸爸用钥匙开门', '姐姐擦桌子'], ans: 0 },
      { kind: 'jud', q: 'AI 又聪明又能帮上忙，所以它是我们的好帮手。', ans: true },
      { kind: 'sit', q: '小贝问："AI 是天上的星星吗？"请你告诉小贝 AI 到底是什么。', line: '想一想：AI 是一种工具，它会做什么呢？', ans: 'AI 不是天上的星星，它是一种会看、会听、会帮忙的聪明工具。' },
    ],
  },
  {
    title: '家居岛 · 身边的 AI',
    pill: '发现宝石',
    questions: [
      { kind: 'sel', q: '小音箱为什么会播放儿歌？', opts: ['它在睡觉', '它听懂了你的话', '它被按了开关', '它会魔法'], ans: 1 },
      { kind: 'jud', q: '门锁靠认脸开门，这是 AI 在帮忙。', ans: true },
      { kind: 'sel', q: '扫地机器人怎么知道哪里脏？', opts: ['随便乱转', '靠人推它', '它会看哪里脏，然后扫干净', '它只会一直转圈'], ans: 2 },
      { kind: 'jud', q: '家里的音箱、门锁、扫地机器人，都可能是 AI 帮手。', ans: true },
      { kind: 'sit', q: '在家里找一找，说出一个会听、会看或会帮忙的 AI 帮手。', line: '回想家居岛上看到的小帮手们。', ans: '比如智能音箱（会听）、人脸门锁（会看）、扫地机器人（会看会帮忙），答对一个即可。' },
    ],
  },
  {
    title: '眼睛岛 · AI 会看',
    pill: '眼睛宝石',
    questions: [
      { kind: 'sel', q: 'AI 怎么学会认出小猫？', opts: ['看很多很多猫的照片', '生下来就会', '背下一本字典', '问老师'], ans: 0 },
      { kind: 'jud', q: 'AI 只看一张照片就能认得所有猫。', ans: false },
      { kind: 'sel', q: 'AI 认猫的时候，会记住猫的什么特点？', opts: ['尖耳朵、长胡须', '会不会游泳', '毛的颜色', '住在哪'], ans: 0 },
      { kind: 'jud', q: 'AI 看的例子越多，认得就越准。', ans: true },
      { kind: 'sit', q: '如果你要教 AI 认狗，你会给它看什么样的照片？', line: '想想眼睛岛上博士星怎么教 AI 认猫的。', ans: '看很多不同角度、不同种类、不同颜色的狗的照片，让 AI 记住狗的特点。' },
    ],
  },
  {
    title: '耳朵岛 · AI 会听',
    pill: '耳朵宝石',
    questions: [
      { kind: 'sel', q: '小多把"开灯"听岔了，怎样说 AI 才能听懂？', opts: ['小声嘟囔', '一个字一个字慢慢说、大声说', '不说', '说很快'], ans: 1 },
      { kind: 'jud', q: '说口令时含含糊糊，AI 也能听得懂。', ans: false },
      { kind: 'sel', q: '想让 AI 听清楚，下面哪个做法对？', opts: ['对着噪音大喊', '说清楚、说大声', '躲到被子底下说', '闭着眼说'], ans: 1 },
      { kind: 'jud', q: '把口令说清楚，AI 的耳朵才能听懂。', ans: true },
      { kind: 'sit', q: '小多想让 AI 关窗帘，他该怎么下口令？', line: '一个字一个字慢慢说、大声说。', ans: '慢慢说、大声说："关——窗——帘！"这样 AI 才能听清楚。' },
    ],
  },
  {
    title: '智慧岛 · AI 会学',
    pill: '智慧宝石',
    questions: [
      { kind: 'sel', q: 'AI 怎么学会分清苹果和香蕉？', opts: ['看很多苹果的样子', '猜一猜', '随便指', '只看一次'], ans: 0 },
      { kind: 'jud', q: 'AI 看的例子越多，学得越牢。', ans: true },
      { kind: 'sel', q: 'AI 学认东西像谁？', opts: ['像小鸟飞', '像小朋友看很多例子慢慢学', '像石头不会动', '像水流'], ans: 1 },
      { kind: 'jud', q: '只看一张苹果照片，AI 就能分清所有苹果。', ans: false },
      { kind: 'sit', q: '为什么多看多学，AI 才能认得更准？', line: '想想智慧岛的果园里发生了什么。', ans: '因为 AI 要看很多例子才能记住东西的特点，例子越多，认得越准、越牢。' },
    ],
  },
  {
    title: '时光岛 · AI 的成长',
    pill: '时光宝石',
    questions: [
      { kind: 'sel', q: 'AI 是一下子变厉害的，还是慢慢长大的？', opts: ['一下子变厉害', '一步步慢慢长大的', '生下来就最厉害', '永远不厉害'], ans: 1 },
      { kind: 'jud', q: '很久以前的 AI 只会做一点点小事。', ans: true },
      { kind: 'sel', q: 'AI 长大的顺序是？', opts: ['大帮手 → 小零件', '小零件 → 学走路 → 大帮手', '大帮手 → 学走路', '学走路 → 小零件 → 大帮手'], ans: 1 },
      { kind: 'jud', q: '每一点进步都很珍贵。', ans: true },
      { kind: 'sit', q: '小贝在时光岛看到了 AI 的过去和现在，你觉得 AI 是怎么长大的？', line: '回想时光机里看到的小零件到现在的变化。', ans: 'AI 是从很小很简单的零件开始，一步一步学会做事、长大成现在的大帮手，每一步进步都很珍贵。' },
    ],
  },
  {
    title: '迷雾岛 · AI 也会错',
    pill: '思考宝石',
    questions: [
      { kind: 'sel', q: '雾太大，小多把蝴蝶错看成了什么？', opts: ['小鸟', '飞机', '风筝', '云朵'], ans: 0 },
      { kind: 'jud', q: 'AI 永远不会犯错。', ans: false },
      { kind: 'sel', q: '当 AI 答错了，我们该怎么办？', opts: ['直接相信', '当小侦探仔细看、想一想再下结论', '骂它', '再也不用 AI'], ans: 1 },
      { kind: 'jud', q: '多检查、多思考，就不会被大雾骗啦。', ans: true },
      { kind: 'sit', q: 'AI 把蝴蝶认成了小鸟，你能帮它想个办法不再认错吗？', line: 'AI 需要看更多例子，还要多检查。', ans: '让 AI 看更多蝴蝶和小鸟的照片，记住它们的不同；下次遇到看不清的情况，多检查、多思考再下结论。' },
    ],
  },
  {
    title: '城堡岛 · 守护秘密',
    pill: '守护宝石',
    questions: [
      { kind: 'sel', q: '城堡门口的黑影打听什么不能说？', opts: ['今天天气', '住址、生日、爸妈电话', '玩的玩具', '看的动画'], ans: 1 },
      { kind: 'jud', q: '家庭住址可以随便告诉陌生人。', ans: false },
      { kind: 'sel', q: '陌生人问爸妈电话，你应该？', opts: ['告诉他', '不说，这是小秘密', '写下来给他', '发短信给他'], ans: 1 },
      { kind: 'jud', q: '住址、生日、爸妈电话都是不能乱说的小秘密。', ans: true },
      { kind: 'sit', q: '集齐 8 颗宝石后启明星亮了，你觉得"守护秘密"为什么是最后一颗宝石？', line: '想一想：保护自己是不是探险里最重要的事？', ans: '因为保护自己的小秘密就是保护自己，这是探险里最重要的事。勇敢赶跑黑影、护好秘密，才算真正完成冒险。' },
    ],
  },
])

/* ========== 3~4年级：AI 创想大陆 · 6 章练习题 ========== */
export const quizCxd: QuizData = withPartIds('cxd', [
  {
    title: 'AI 超能力图鉴',
    pill: '全景徽章',
    questions: [
      { kind: 'sel', q: 'AI 的超能力不包括下面哪一项？', opts: ['会写文章', '会画画', '会推荐', '永远不说错'], ans: 3 },
      { kind: 'jud', q: 'AI 会"幻觉"，就是把不存在的事说得像真的。', ans: true },
      { kind: 'sel', q: '下面哪条是 AI 的边界？', opts: ['知识有截止日期', '会写所有文章', '从不会错', '有真实经历'], ans: 0 },
      { kind: 'jud', q: 'AI 给的答案再自信，也可能不是真的。', ans: true },
      { kind: 'sit', q: '让 AI 写一段"我家猫咪会飞"的介绍，它写得很认真。这说明 AI 真的见过会飞的猫吗？', line: '回想"幻觉"和 AI 的四条边界。', ans: '不能。AI 会在没有真实经历的情况下，根据训练数据里"像不像"来编造内容，写得越像越要认真核验。' },
    ],
  },
  {
    title: '把话说清楚',
    pill: '沟通徽章',
    questions: [
      { kind: 'sel', q: '让 AI 听懂你的话，五要素是？', opts: ['目标、对象、场合、格式、限制', '时间、地点、人物、事件、原因', '颜色、声音、味道、形状、大小', '谁、什么、哪里、何时、为什么'], ans: 0 },
      { kind: 'jud', q: '和 AI 对话是一次性的，不用来回修改。', ans: false },
      { kind: 'sel', q: 'AI 生成的不满意，应该？', opts: ['直接放弃', '追问、修改、补充描述', '换一台电脑', '骂 AI'], ans: 1 },
      { kind: 'jud', q: '把需求说清楚，AI 才能给你想要的东西。', ans: true },
      { kind: 'sit', q: '你想让 AI 画一张"生日贺卡"，但只说"画张贺卡"AI 画得很普通。补全哪几个要素能帮 AI 画得更好？', line: '用五要素来补。', ans: '补目标（生日贺卡）、对象（送给谁）、场合（生日）、格式（横版/竖版）、限制（颜色/风格/不要什么），AI 就能画得更贴合。' },
    ],
  },
  {
    title: '创意放大器',
    pill: '创意徽章',
    questions: [
      { kind: 'sel', q: '创作四步法的正确顺序是？', opts: ['生成→构思→定稿→修改', '构思→生成→修改→定稿', '定稿→构思→生成→修改', '修改→生成→构思→定稿'], ans: 1 },
      { kind: 'jud', q: '先用 AI 生成再想构思，效率最高。', ans: false },
      { kind: 'sel', q: 'AI 参与创作的部分应该？', opts: ['不说', '如实标注', '夸大宣传', '只告诉好朋友'], ans: 1 },
      { kind: 'jud', q: 'AI 是乐器，你才是作曲家。', ans: true },
      { kind: 'sit', q: '做一本自己的绘本，你打算怎么安排四步？', line: '严格按"构思→生成→修改→定稿"。', ans: '先手写手绘构思故事和画面，再用 AI 生成文字/插图，然后手动修改不合适的地方，最后定稿并标注 AI 参与了哪些部分。' },
    ],
  },
  {
    title: '真相侦探社',
    pill: '侦探徽章',
    questions: [
      { kind: 'sel', q: '"幻觉"指的是？', opts: ['AI 卡顿了', 'AI 一本正经地说错的或不存在的事', '画面变模糊', '声音变小'], ans: 1 },
      { kind: 'jud', q: 'AI 追求"像"而不是"真"。', ans: true },
      { kind: 'sel', q: '核验三步法是？', opts: ['找源头、交叉查、问常识', '看一遍、转出去、删掉', '问老师、问家长、问同学', '截图、保存、转发'], ans: 0 },
      { kind: 'jud', q: '查过了才算，不能 AI 说什么就信什么。', ans: true },
      { kind: 'sit', q: 'AI 告诉你"某位科学家 1820 年发明了电话"，你该怎么办？', line: '用核验三步法。', ans: '先找源头（看是不是权威来源）、再交叉查（其他来源是否一致）、最后问常识（电话是谁、什么时候发明的）；查证后再决定是否采信。' },
    ],
  },
  {
    title: '教 AI 认世界',
    pill: '训练师徽章',
    questions: [
      { kind: 'sel', q: '训练 AI 认东西的流程是？', opts: ['收集样本→打标签→训练→测试', '训练→收集→打标签→测试', '测试→训练→收集→打标签', '随便拍几张直接识别'], ans: 0 },
      { kind: 'jud', q: '喂 AI 什么数据，它就学会什么。', ans: true },
      { kind: 'sel', q: '为什么训练集和测试集要分开？', opts: ['让数据显得多', '避免偷看答案，看模型真本事', '省时间', '电脑放不下'], ans: 1 },
      { kind: 'jud', q: '样本越多、越均衡，AI 学得越好。', ans: true },
      { kind: 'sit', q: '你要教 AI 认"月季和玫瑰"，怎么准备样本才合理？', line: '考虑多样性和均衡。', ans: '收集两类各足够多的照片（不同角度、光线、花期），统一标准打标签，按 80/20 分训练/测试集，保证两类数量相称。' },
    ],
  },
  {
    title: '负责任的创想家',
    pill: '责任徽章',
    questions: [
      { kind: 'sel', q: '数字安全三条红线是？', opts: ['不传人脸照片、不输入真实姓名、不透露学校住址', '不用电脑、不用手机、不上网', '不说话、不写字、不画画', '不收邮件、不加好友、不聊天'], ans: 0 },
      { kind: 'jud', q: '用 AI 做的作业可以当作自己做的交上去。', ans: false },
      { kind: 'sel', q: '使用他人作品前应该？', opts: ['直接用', '先获得允许并标注', '说是自己做的', '不告诉任何人'], ans: 1 },
      { kind: 'jud', q: '从真实问题出发的创想才更有意义。', ans: true },
      { kind: 'sit', q: '你发现同学总忘带作业本，想用 AI 做个"提醒小程序"。从真实问题到发布，你会走哪几步？', line: '规划→创作→发布，"问题真、构思清、查证实、复盘诚"。', ans: '先确认真实问题（忘带作业），再规划方案（提醒时机/方式），用 AI 辅助创作，发布前查证内容、做隐私评估，发布后复盘哪些地方还能改。' },
    ],
  },
])

/* ========== 5~6年级：AI 探索实验室 · 9 个探究部分 ========== */
export const quizLab: QuizData = GRADE56_QUIZZES.map((chapter) => ({
  partId: chapter.partId,
  title: chapter.title,
  pill: '课程徽章',
  questions: chapter.questions.map((question) => ({
    kind: 'sel' as const,
    q: question.prompt,
    opts: question.options,
    ans: question.answerIndex,
  })),
}))

/* 根据课程 ID 取对应练习题 */
export function getQuiz(courseId: 'qmx' | 'cxd' | 'ael' | 'lab'): QuizData {
  if (courseId === 'qmx') return quizQmx
  if (courseId === 'cxd') return quizCxd
  return quizLab
}

function withPartIds(courseId: CourseId, chapters: Omit<QuizChapter, 'partId'>[]): QuizData {
  return chapters.map((chapter, index) => ({
    ...chapter,
    partId: makeCoursePartId(courseId, index + 1),
  }))
}
