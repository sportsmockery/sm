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

/**
 * Aspect-ratio variants required by Top Stories — Google needs all 3 in NewsArticle.image[].
 * Each uses fit:cover so the subject is preserved at the requested aspect.
 */
export interface AspectVariant {
  key: '16x9' | '4x3' | '1x1'
  width: number
  height: number
  quality: number
}

export const ASPECT_VARIANTS: AspectVariant[] = [
  { key: '16x9', width: 1200, height: 675, quality: 80 },
  { key: '4x3', width: 1200, height: 900, quality: 80 },
  { key: '1x1', width: 1200, height: 1200, quality: 80 },
]

export interface OptimizedImageResult {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

export interface AspectVariantResult {
  buffer: Buffer
  width: number
  height: number
  format: 'webp'
  size: number
}

export interface BlurPlaceholderResult {
  base64: string
  width: number
  height: number
}

export interface FullOptimizationResult {
  variants: Record<string, OptimizedImageResult>
  aspects: Record<AspectVariant['key'], AspectVariantResult>
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
 * Produces a single aspect-ratio variant (cover-fit) as WebP.
 */
export async function optimizeAspectVariant(
  inputBuffer: Buffer,
  width: number,
  height: number,
  quality = 80
): Promise<AspectVariantResult> {
  const buffer = await sharp(inputBuffer)
    .rotate()
    .withMetadata({ orientation: undefined })
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .webp({ quality })
    .toBuffer()

  return {
    buffer,
    width,
    height,
    format: 'webp',
    size: buffer.byteLength,
  }
}

/**
 * Runs the full optimization pipeline: size variants, aspect-ratio variants, and blur placeholder.
 */
export async function processImage(inputBuffer: Buffer): Promise<FullOptimizationResult> {
  const originalMeta = await sharp(inputBuffer).metadata()
  const originalWidth = originalMeta.width || 0
  const originalHeight = originalMeta.height || 0

  const [variantEntries, aspectEntries, blur] = await Promise.all([
    Promise.all(
      SIZE_VARIANTS.map(async (v) => {
        const result = await optimizeImage(inputBuffer, v.maxWidth, v.quality)
        return [v.name, result] as [string, OptimizedImageResult]
      })
    ),
    Promise.all(
      ASPECT_VARIANTS.map(async (a) => {
        const result = await optimizeAspectVariant(inputBuffer, a.width, a.height, a.quality)
        return [a.key, result] as [AspectVariant['key'], AspectVariantResult]
      })
    ),
    generateBlurPlaceholder(inputBuffer),
  ])

  const variants = Object.fromEntries(variantEntries)
  const aspects = Object.fromEntries(aspectEntries) as Record<AspectVariant['key'], AspectVariantResult>

  return { variants, aspects, blur, originalWidth, originalHeight }
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
