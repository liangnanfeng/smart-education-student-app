import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateRecognition, validateResult, parseRecognitionResult, recognize } from './recognition.mjs'
test('rejects unsupported tools, empty or oversized materials and invalid images', () => {
  for (const body of [{ tool: 'unknown', text: 'x' }, { tool: 'solve' }, { tool: 'ocr', text: 'x' }, { tool: 'check', text: 'a'.repeat(4001) }, { tool: 'object', image: 'https://example.com/x' }]) assert.throws(() => validateRecognition(body))
  assert.equal(validateRecognition({ tool: 'translate', text: ' Hello ', target: '英语' }).text, 'Hello')
})
test('requires evidence and method summary in provider result', () => {
  assert.throws(() => validateResult({ title: 'x', output: 'x' }))
  assert.throws(() => validateResult({ title: 'x', output: 'x', uncertainty: 'x', evidence: [], steps: [] }))
  assert.equal(validateResult({ title: 'x', output: 'x', uncertainty: 'x', evidence: ['x'], steps: [{ title: 'x', detail: 'x' }] }).title, 'x')
})
test('requires learning extensions for all five educational tools', () => {
  const base = { sourceText: 'leaf', title: '叶片', output: '一片叶子', uncertainty: '品种不确定', evidence: ['叶脉'], steps: [{ title: '观察', detail: '看到叶脉' }] }
  assert.throws(() => validateResult(base, 'object'))
  const introduction = { overview: '叶片是植物的一部分。', funFact: '叶脉可以输送水和养分。', question: '叶脉像什么形状？' }
  assert.deepEqual(validateResult({ ...base, introduction }, 'object').introduction, introduction)
  for (const tool of ['ocr', 'solve', 'translate', 'check']) {
    assert.throws(() => validateResult(base, tool))
    assert.deepEqual(validateResult({ ...base, introduction }, tool).introduction, introduction)
  }
  assert.equal(validateResult(base, 'scan').introduction, undefined)
})

test('accepts decoded scan text for AI explanation', () => {
  assert.equal(validateRecognition({ tool: 'scan', text: 'https://example.com/learn' }).tool, 'scan')
  assert.throws(() => validateRecognition({ tool: 'scan', text: '' }))
})

test('accepts fenced JSON and text line arrays without losing text', () => {
  const data = { title: '文字', output: ['第一行', '第二行'], evidence: ['原图'], steps: [{ title: '读取', detail: '按行读取' }], introduction: { overview: '说明', funFact: '知识', question: '问题' } }
  const result = parseRecognitionResult('```json\n' + JSON.stringify(data) + '\n```', 'ocr')
  assert.equal(result.output, '第一行\n第二行')
  assert.ok(result.uncertainty)
})
test('retries truncated provider response and includes extensions', async (t) => {
  const original = process.env.VISION_API_KEY
  process.env.VISION_API_KEY = 'test-only'
  const base = process.env.VISION_BASE_URL, model = process.env.VISION_MODEL
  process.env.VISION_BASE_URL = 'https://example.test/v1'; process.env.VISION_MODEL = 'test'
  t.after(() => { for (const [key, value] of Object.entries({ VISION_API_KEY: original, VISION_BASE_URL: base, VISION_MODEL: model })) { if (value === undefined) delete process.env[key]; else process.env[key] = value } })
  let calls = 0
  const result = { title: '题目', output: '20', evidence: ['12和8'], steps: [{ title: '相加', detail: '12+8=20' }], introduction: { overview: '加法', funFact: '求和', question: '如何检查？' } }
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls++
    assert.equal(JSON.parse(options.body).max_tokens, calls === 1 ? 6000 : 10000)
    return { ok: true, json: async () => ({ choices: [{ finish_reason: calls === 1 ? 'length' : 'stop', message: { content: calls === 1 ? '{' : JSON.stringify(result) } }] }) }
  })
  assert.ok((await recognize({ tool: 'solve', text: '12+8' })).introduction)
  assert.equal(calls, 2)
})

