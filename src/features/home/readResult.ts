export function readResult(text: string, onEnd: () => void, onError: () => void): () => void {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) throw new Error('当前浏览器不支持朗读，请使用系统浏览器打开。')
  const synth = window.speechSynthesis
  synth.cancel()
  const chunks = text.match(/[^。！？；\n]{1,100}[。！？；\n]?/g) ?? []
  let stopped = false
  let current: SpeechSynthesisUtterance | null = null
  function next() {
    if (stopped) return
    const chunk = chunks.shift()
    if (!chunk) { stopped = true; onEnd(); return }
    current = new SpeechSynthesisUtterance(chunk)
    current.lang = 'zh-CN'; current.rate = .92
    const voice = synth.getVoices().find(v => /^zh(-|_)CN$/i.test(v.lang)) ?? synth.getVoices().find(v => /^zh/i.test(v.lang))
    if (voice) current.voice = voice
    current.onend = next
    current.onerror = () => { if (!stopped) { stopped = true; onError() } }
    try { synth.speak(current) } catch { stopped = true; onError() }
  }
  next()
  return () => {
    stopped = true
    if (current) { current.onend = null; current.onerror = null }
    synth.cancel()
  }
}
