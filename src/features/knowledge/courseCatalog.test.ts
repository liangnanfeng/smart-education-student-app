import { describe, expect, it } from 'vitest'
import { COURSE_PACKAGES, getCourseForBand, getQuizForPart } from './courseCatalog'
import { getCourseData } from './knowledgeData'
import { getQuiz } from '../test/quizData'

describe('primary course packages', () => {
  it.each([
    ['grade1-2', 'qmx', 8],
    ['grade3-4', 'cxd', 6],
    ['grade5-6', 'ael', 9],
  ] as const)('maps %s to %s with aligned parts, quizzes and medals', (band, id, count) => {
    const course = getCourseForBand(band)
    expect(course.id).toBe(id)
    expect(course.parts).toHaveLength(count)
    expect(course.quizzes).toHaveLength(count)
    expect(course.medals).toHaveLength(count)
    expect(course.parts.map((part) => part.id)).toEqual(course.quizzes.map((quiz) => quiz.partId))
    expect(course.parts.map((part) => part.id)).toEqual(course.medals.map((medal) => medal.partId))
  })

  it('gives every grade 5-6 quiz five answerable questions and a ninth project challenge', () => {
    const course = COURSE_PACKAGES['grade5-6']
    expect(course.parts.map((part) => part.title)).toEqual([
      'AI 系统拆解站', '数据侦探营', '算法工具箱', '第一次 AI 实验', '给 AI 当评委',
      '生成式 AI 解密', '从点子到产品', '与 AI 安全相处', '我的 AI 小项目',
    ])
    expect(course.quizzes.every((quiz) => quiz.questions.length === 5)).toBe(true)
    expect(course.quizzes[8].questions.some((question) => question.type === 'scenario')).toBe(true)
    expect(JSON.stringify(course)).not.toMatch(/初中|中学生|七至九年级|7—9/)
  })

  it('models the project privacy response as a three-action scenario', () => {
    const privacyQuestion = COURSE_PACKAGES['grade5-6'].quizzes[8].questions.find(
      (question) => question.id === 'ael-9-q4',
    )

    expect(privacyQuestion).toMatchObject({
      type: 'scenario',
      options: ['停止收集并改用不敏感的方案', '继续收集', '悄悄保存'],
    })
  })

  it('finds each quiz by the same stable part id', () => {
    expect(getQuizForPart('qmx-1')?.title).toBe('启明星岛 · 认识 AI')
    expect(getQuizForPart('cxd-6')?.title).toBe('负责任的创想家')
    expect(getQuizForPart('ael-9')?.title).toBe('我的 AI 小项目')
    expect(getQuizForPart('ael-10')).toBeUndefined()
  })

  it('keeps every answer index inside an explicit option list', () => {
    const questions = Object.values(COURSE_PACKAGES).flatMap((course) =>
      course.quizzes.flatMap((quiz) => quiz.questions),
    )
    expect(questions.every((question) =>
      question.options.length >= 2
      && question.options.length <= 4
      && question.answerIndex >= 0
      && question.answerIndex < question.options.length,
    )).toBe(true)
  })

  it('uses the approved deterministic prompts for the grade 5-6 algorithm and project chapters', () => {
    expect(COURSE_PACKAGES['grade5-6'].quizzes[2].questions.map((question) => question.prompt)).toEqual([
      '把照片分成猫和狗，最适合哪种工具？',
      '没有现成标签，想把相似图书放在一起，应选择什么？',
      '根据过去气温估计明天的温度，更像哪类任务？',
      '推荐系统给出的第一名一定是唯一正确选择。',
      '为同学推荐课外书，怎样做更合适？',
    ])
    expect(COURSE_PACKAGES['grade5-6'].quizzes[8].questions.map((question) => question.prompt)).toEqual([
      '哪个问题最适合做成第一个 AI 小项目？',
      '项目需要哪些最少输入？',
      '怎样测试方案是否真的有用？',
      '发现会收集同学人脸时应该怎么办？',
      '第一次测试效果一般，下一步最好的做法是什么？',
    ])
  })

  it('replaces legacy lab compatibility data with the nine-part primary package', () => {
    const legacyCourse = getCourseData('secondary', 'grade7')
    const legacyQuiz = getQuiz('lab')
    expect(legacyCourse.chapters?.map((chapter) => chapter.title)).toEqual(
      COURSE_PACKAGES['grade5-6'].parts.map((part) => part.title),
    )
    expect(legacyQuiz).toHaveLength(9)
    expect(JSON.stringify({ legacyCourse, legacyQuiz })).not.toMatch(/初中|中学生|七至九年级|7—9/)
  })

  it.each([
    ['grade1', 'qmx'], ['grade2', 'qmx'],
    ['grade3', 'cxd'], ['grade4', 'cxd'],
    ['grade5', 'ael'], ['grade6', 'ael'],
  ] as const)('keeps the legacy grade selector aligned for %s', (grade, courseId) => {
    expect(getCourseData('elementary', grade).id).toBe(courseId)
  })
})
