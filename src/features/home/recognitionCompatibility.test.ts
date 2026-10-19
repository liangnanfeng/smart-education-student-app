import { describe, expect, it, vi, afterEach } from 'vitest'
import { BarcodeFormat, QRCodeWriter } from '@zxing/library'
import { decodePixels, decodeColoredQR } from './barcodeDecoder'
import { scanImage } from './recognitionTools'
import { readResult } from './readResult'
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
function qrPixels() {
  const matrix = new QRCodeWriter().encode('https://example.com/learn', BarcodeFormat.QR_CODE, 240, 240, new Map())
  const pixels = new Uint8ClampedArray(240 * 240 * 4)
  for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) { const i = (y * 240 + x) * 4; pixels.fill(matrix.get(x, y) ? 0 : 255, i, i + 3); pixels[i + 3] = 255 }
  return pixels
}
describe('compatible barcode decoder', () => {
  it('decodes a real QR image without BarcodeDetector', async () => {
    vi.stubGlobal('BarcodeDetector', undefined)
    const close = vi.fn()
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 240, height: 240, close }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: async () => new Blob() }))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage: vi.fn(), getImageData: () => ({ data: qrPixels() }) } as unknown as CanvasRenderingContext2D)
    const result = await scanImage('data:image/png;base64,test')
    expect(result.output).toBe('https://example.com/learn')
    expect(close).toHaveBeenCalled()
  })
  it('decodes blue codes against a warm screen background', () => {
    const pixels = qrPixels()
    for (let i = 0; i < pixels.length; i += 4) {
      const color = pixels[i] === 0 ? [36, 119, 150] : [177, 158, 140]
      pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2]
    }
    expect(decodeColoredQR(pixels, 240, 240)?.rawValue).toBe('https://example.com/learn')
  })
  it('decodes an EAN-13 product barcode', () => {
    const left = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
    const even = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
    const right = left.map(s => [...s].map(c => c === '0' ? '1' : '0').join(''))
    const digits = '4006381333931'; const parity = 'LGLLGG'
    const bits = '000000000000' + '101' + [...digits.slice(1,7)].map((d,i) => (parity[i] === 'L' ? left : even)[Number(d)]).join('') + '01010' + [...digits.slice(7)].map(d => right[Number(d)]).join('') + '101' + '000000000000'
    const width = bits.length * 3, height = 100
    const pixels = new Uint8ClampedArray(width * height * 4).fill(255)
    for (let y = 5; y < 95; y++) for (let x = 0; x < width; x++) if (bits[Math.floor(x/3)] === '1') pixels.fill(0, (y*width+x)*4, (y*width+x)*4+3)
    expect(decodePixels(pixels,width,height)?.rawValue).toBe(digits)
  })
  it('returns no result for a blank photo', () => { expect(decodePixels(new Uint8ClampedArray(100*100*4).fill(255),100,100)).toBeNull() })
})
describe('reading results', () => {
  it('reads Chinese in chunks and stops the queue when cancelled', () => {
    class Utterance { text: string; onend?: () => void; onerror?: () => void; constructor(text: string) { this.text = text } }
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    const speak = vi.fn(), cancel = vi.fn(), done = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak, cancel, getVoices: () => [] })
    const stop = readResult('这是叶片。叶脉运输水分。',done,vi.fn())
    expect(speak.mock.calls[0][0].lang).toBe('zh-CN')
    speak.mock.calls[0][0].onend()
    expect(speak).toHaveBeenCalledTimes(2)
    stop()
    expect(cancel).toHaveBeenCalledTimes(2)
    expect(speak.mock.calls[1][0].onend).toBeNull()
    expect(done).not.toHaveBeenCalled()
  })
  it('reports unsupported speech without crashing the panel', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => readResult('测试',vi.fn(),vi.fn())).toThrow('不支持朗读')
  })
})

