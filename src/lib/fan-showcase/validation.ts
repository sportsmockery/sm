import {
  TEAMS,
  CONTENT_TYPES,
  SOURCE_PLATFORMS,
  type Team,
  type ContentType,
  type SourcePlatform,
  type SubmitFormData,
} from '@/types/fan-showcase'

export interface ValidationError {
  field: string
  message: string
}

const URL_REGEX = /^https?:\/\/.+\..+/

const MAX_TITLE_LENGTH = 150
const MAX_DESCRIPTION_LENGTH = 1000
const MAX_TAKE_LENGTH = 5000
const MAX_BRAG_LENGTH = 300
const MAX_BIO_LENGTH = 500
const MAX_LEAGUE_NAME_LENGTH = 100

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export function validateSubmission(data: Partial<SubmitFormData>): ValidationError[] {
  const errors: ValidationError[] = []

  // Required fields
  if (!data.creator_name?.trim()) {
    errors.push({ field: 'creator_name', message: 'Creator name is required.' })
  }
  if (!data.creator_handle?.trim()) {
    errors.push({ field: 'creator_handle', message: 'Creator handle is required.' })
  }
  if (!data.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' })
  }
  if (!data.type || !CONTENT_TYPES.includes(data.type as ContentType)) {
    errors.push({ field: 'type', message: 'Please select a content type.' })
  }
  if (!data.team || !TEAMS.includes(data.team as Team)) {
    errors.push({ field: 'team', message: 'Please select a team.' })
  }
  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required.' })
  } else if (data.title.length > MAX_TITLE_LENGTH) {
    errors.push({ field: 'title', message: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` })
  }
  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required.' })
  } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({ field: 'description', message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` })
  }

  // Checkboxes
  if (!data.rights_agreed) {
    errors.push({ field: 'rights_agreed', message: 'You must agree to the license terms.' })
  }
  if (!data.moderation_acknowledged) {
    errors.push({ field: 'moderation_acknowledged', message: 'You must acknowledge the moderation policy.' })
  }
  if (!data.ownership_confirmed) {
    errors.push({ field: 'ownership_confirmed', message: 'You must confirm content ownership.' })
  }
  if (!data.non_infringement_confirmed) {
    errors.push({ field: 'non_infringement_confirmed', message: 'You must confirm non-infringement.' })
  }

  // Conditional by type
  if (data.type === 'edit') {
    if (data.source_platform && !SOURCE_PLATFORMS.includes(data.source_platform as SourcePlatform)) {
      errors.push({ field: 'source_platform', message: 'Please select a valid platform.' })
    }
    if (!data.source_url?.trim()) {
      errors.push({ field: 'source_url', message: 'Source URL is required for edits.' })
    } else if (!URL_REGEX.test(data.source_url)) {
      errors.push({ field: 'source_url', message: 'Please enter a valid URL.' })
    }
  }

  if (data.type === 'take') {
    if (!data.written_take?.trim()) {
      errors.push({ field: 'written_take', message: 'Written take is required.' })
    } else if (data.written_take.length > MAX_TAKE_LENGTH) {
      errors.push({ field: 'written_take', message: `Take must be ${MAX_TAKE_LENGTH} characters or fewer.` })
    }
  }

  if (data.type === 'fantasy_win') {
    if (!data.league_name?.trim()) {
      errors.push({ field: 'league_name', message: 'League name is required for fantasy wins.' })
    } else if (data.league_name.length > MAX_LEAGUE_NAME_LENGTH) {
      errors.push({ field: 'league_name', message: `League name must be ${MAX_LEAGUE_NAME_LENGTH} characters or fewer.` })
    }
    if (data.brag_line && data.brag_line.length > MAX_BRAG_LENGTH) {
      errors.push({ field: 'brag_line', message: `Brag line must be ${MAX_BRAG_LENGTH} characters or fewer.` })
    }
  }

  // Optional fields with validation
  if (data.profile_url && !URL_REGEX.test(data.profile_url)) {
    errors.push({ field: 'profile_url', message: 'Please enter a valid URL.' })
  }
  if (data.creator_bio && data.creator_bio.length > MAX_BIO_LENGTH) {
    errors.push({ field: 'creator_bio', message: `Bio must be ${MAX_BIO_LENGTH} characters or fewer.` })
  }
  if (data.source_url && data.type !== 'edit' && data.source_url.trim() && !URL_REGEX.test(data.source_url)) {
    errors.push({ field: 'source_url', message: 'Please enter a valid URL.' })
  }

  return errors
}

export function validateFile(
  file: File,
  expectedType: 'image' | 'video'
): ValidationError | null {
  const allowed = expectedType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
  const maxSize = expectedType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE

  if (!allowed.includes(file.type)) {
    return {
      field: 'file',
      message: `Unsupported file type. Allowed: ${allowed.map(t => t.split('/')[1]).join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024)
    return {
      field: 'file',
      message: `File too large. Maximum size is ${maxMB}MB.`,
    }
  }

  return null
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  const suffix = Date.now().toString(36)
  return `${base}-${suffix}`
}

export { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_TAKE_LENGTH, MAX_BRAG_LENGTH, MAX_BIO_LENGTH, MAX_LEAGUE_NAME_LENGTH }
