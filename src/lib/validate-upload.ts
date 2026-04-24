/**
 * File upload validation with extension and magic byte checks.
 *
 * Prevents MIME spoofing by verifying:
 * 1. File extension is in allowlist
 * 2. MIME type is in allowlist
 * 3. File magic bytes match claimed type
 */

/** Allowed file types with their extensions and magic bytes */
const FILE_SIGNATURES: Record<string, { extensions: string[]; magicBytes: number[][] }> = {
  'image/jpeg': {
    extensions: ['jpg', 'jpeg'],
    magicBytes: [[0xFF, 0xD8, 0xFF]],
  },
  'image/png': {
    extensions: ['png'],
    magicBytes: [[0x89, 0x50, 0x4E, 0x47]],
  },
  'image/gif': {
    extensions: ['gif'],
    magicBytes: [
      [0x47, 0x49, 0x46, 0x38, 0x37], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39], // GIF89a
    ],
  },
  'image/webp': {
    extensions: ['webp'],
    magicBytes: [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF)
  },
  'video/mp4': {
    extensions: ['mp4'],
    magicBytes: [], // MP4 magic bytes vary, skip for video
  },
  'application/pdf': {
    extensions: ['pdf'],
    magicBytes: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
}

/** Image-only subset for avatar uploads */
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export interface UploadValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate a file upload for the media library.
 * Checks MIME type, extension, size, and magic bytes.
 */
export async function validateMediaUpload(file: File, maxSizeMB = 10): Promise<UploadValidationResult> {
  return validateFile(file, Object.keys(FILE_SIGNATURES), maxSizeMB)
}

/**
 * Validate an image upload (avatars, etc).
 * More restrictive — images only.
 */
export async function validateImageUpload(file: File, maxSizeMB = 5): Promise<UploadValidationResult> {
  return validateFile(file, IMAGE_TYPES, maxSizeMB)
}

async function validateFile(file: File, allowedTypes: string[], maxSizeMB: number): Promise<UploadValidationResult> {
  // 1. Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed` }
  }

  // 2. Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }

  // 3. Check extension
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const sig = FILE_SIGNATURES[file.type]
  if (sig && !sig.extensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension ".${ext}" does not match type "${file.type}". Expected: .${sig.extensions.join(', .')}`,
    }
  }

  // 4. Check magic bytes (skip for types with no defined signatures, e.g. video)
  if (sig && sig.magicBytes.length > 0) {
    const buffer = await file.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    const matches = sig.magicBytes.some(magic =>
      magic.every((byte, i) => bytes[i] === byte)
    )

    if (!matches) {
      return {
        valid: false,
        error: `File content does not match claimed type "${file.type}". Possible MIME spoofing.`,
      }
    }
  }

  // 5. Block dangerous extensions regardless of MIME
  const dangerousExtensions = ['html', 'htm', 'svg', 'xml', 'js', 'mjs', 'ts', 'php', 'py', 'sh', 'bat', 'cmd', 'exe', 'dll', 'so']
  if (dangerousExtensions.includes(ext)) {
    return { valid: false, error: `Extension ".${ext}" is not allowed for security reasons` }
  }

  return { valid: true }
}
