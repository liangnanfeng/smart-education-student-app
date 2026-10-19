import { BarcodeFormat, BinaryBitmap, DecodeHintType, HybridBinarizer, MultiFormatReader, RGBLuminanceSource } from '@zxing/library'
import jsQR from 'jsqr'

export function decodeColoredQR(pixels: Uint8ClampedArray, width: number, height: number) {
  // Colored codes on a photographed screen can have low luminance contrast.
  // Individual color channels preserve contrast lost by ordinary grayscale.
  for (const channel of [-1, 0, 1, 2]) {
    const enhanced = pixels.slice()
    if (channel >= 0) {
      for (let i = 0; i < enhanced.length; i += 4) {
        enhanced[i] = enhanced[i + 1] = enhanced[i + 2] = pixels[i + channel]
      }
    }
    const result = jsQR(enhanced, width, height, { inversionAttempts: 'attemptBoth' })
    if (result?.data) return { rawValue: result.data, format: 'QR_CODE' }
  }
  return null
}

export function decodePixels(pixels: Uint8ClampedArray, width: number, height: number) {
  const gray = new Uint8ClampedArray(width * height)
  for (let i = 0; i < gray.length; i++) gray[i] = (pixels[i * 4] + 2 * pixels[i * 4 + 1] + pixels[i * 4 + 2]) / 4
  const source = new RGBLuminanceSource(gray, width, height)
  const reader = new MultiFormatReader()
  const hints = new Map([[DecodeHintType.TRY_HARDER, true]])
  try {
    for (const candidate of [source, source.invert()]) {
      try {
        const result = reader.decode(new BinaryBitmap(new HybridBinarizer(candidate)), hints)
        return { rawValue: result.getText(), format: BarcodeFormat[result.getBarcodeFormat()] }
      } catch { /* Try the inverted image before reporting no match. */ }
    }
    return decodeColoredQR(pixels, width, height)
  } finally { reader.reset() }
}

export function decodeBitmap(bitmap: ImageBitmap) {
  const canvas = document.createElement('canvas')
  // Try multiple sampling scales: screen pixels and dense QR modules can alias at one size.
  const longest = Math.max(bitmap.width, bitmap.height)
  const scales = [...new Set([Math.min(1, 2400 / longest), Math.min(1, 1200 / longest), Math.min(2, 1800 / longest)])]
  for (const scale of scales) for (const rotated of [false, true]) {
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.width = rotated ? height : width
    canvas.height = rotated ? width : height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('图片读取失败，请重新上传。')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (rotated) { ctx.translate(canvas.width, 0); ctx.rotate(Math.PI / 2) }
    ctx.drawImage(bitmap, 0, 0, width, height)
    const result = decodePixels(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
    if (result) return result
  }
  return null
}
