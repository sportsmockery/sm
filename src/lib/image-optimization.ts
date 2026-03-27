import sharp from 'sharp'

/** Size variants produced by the optimization pipeline */
export interface ImageSizeVariant {
  name: string
  maxWidth: number
  quality: number
}

export const SIZE_VARIANTS: ImageSizeVariant[] = [
  { name: 'hero', maxWidth: 1920, quality: 80 },
  { name: 'medium', maxWidth: 800, quality: 80 },
  { name: 'thumbnail', maxWidth: 400, quality: 75 },
]

export interface OptimizedImageResult {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

export interface BlurPlaceholderResult {
  base64: string
  width: number
  height: number
}

export interface FullOptimizationResult {
  variants: Record<string, OptimizedImageResult>
  blur: BlurPlaceholderResult
  originalWidth: number
  originalHeight: number
}

/**
 * Optimizes an image buffer through the sharp pipeline:
 * - Strips EXIF metadata
 * - Resizes to max dimensions
 * - Converts to WebP at specified quality
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  maxWidth: number,
  quality: number = 80
): Promise<OptimizedImageResult> {
  const pipeline = sharp(inputBuffer)
    .rotate() // auto-rotate based on EXIF before stripping
    .withMetadata({ orientation: undefined }) // strip EXIF
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality })

  const outputBuffer = await pipeline.toBuffer()
  const metadata = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: 'webp',
    size: outputBuffer.byteLength,
  }
}

/**
 * Generates a tiny (16px wide) blur placeholder as base64.
 * Used for blurDataURL in Next.js Image.
 */
export async function generateBlurPlaceholder(
  inputBuffer: Buffer
): Promise<BlurPlaceholderResult> {
  const placeholderBuffer = await sharp(inputBuffer)
    .resize({ width: 16, withoutEnlargement: true })
    .webp({ quality: 20 })
    .toBuffer()

  const metadata = await sharp(placeholderBuffer).metadata()

  return {
    base64: `data:image/webp;base64,${placeholderBuffer.toString('base64')}`,
    width: metadata.width || 16,
    height: metadata.height || 9,
  }
}

/**
 * Runs the full optimization pipeline: produces all size variants + blur placeholder.
 */
export async function processImage(inputBuffer: Buffer): Promise<FullOptimizationResult> {
  const originalMeta = await sharp(inputBuffer).metadata()
  const originalWidth = originalMeta.width || 0
  const originalHeight = originalMeta.height || 0

  // Generate all size variants in parallel
  const variantEntries = await Promise.all(
    SIZE_VARIANTS.map(async (v) => {
      const result = await optimizeImage(inputBuffer, v.maxWidth, v.quality)
      return [v.name, result] as [string, OptimizedImageResult]
    })
  )

  const variants = Object.fromEntries(variantEntries)
  const blur = await generateBlurPlaceholder(inputBuffer)

  return { variants, blur, originalWidth, originalHeight }
}

/**
 * Downloads an image from a URL and returns the buffer.
 */
export async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SportsMockery-ImageOptimizer/1.0' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
