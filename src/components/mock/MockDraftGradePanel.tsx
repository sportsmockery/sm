'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { toPng } from 'html-to-image'

interface PickGrade {
  pick_number: number
  prospect_name: string
  grade: number
  analysis: string
}

interface DraftGrade {
  overall_grade: number
  letter_grade: string
  analysis: string
  pick_grades: PickGrade[]
  strengths: string[]
  weaknesses: string[]
}

interface MockDraftGradePanelProps {
  grade: DraftGrade
  teamColor: string
  teamName?: string
  draftYear?: number
  mockId?: string
  onViewDetails?: () => void
}

export default function MockDraftGradePanel({ grade, teamColor, teamName, draftYear, mockId, onViewDetails }: MockDraftGradePanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Share state
  const [copied, setCopied] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const gradeCardRef = useRef<HTMLDivElement>(null)

  // Get grade color based on grade value
  const getGradeColor = (gradeValue: number) => {
    if (gradeValue >= 90) return '#10b981' // Green - A
    if (gradeValue >= 80) return '#22c55e' // Light green - B+
    if (gradeValue >= 70) return '#84cc16' // Yellow-green - B
    if (gradeValue >= 60) return '#f59e0b' // Orange - C
    if (gradeValue >= 50) return '#f97316' // Dark orange - D
    return '#ef4444' // Red - F
  }

  const gradeColor = getGradeColor(grade.overall_grade)

  // Share functions
  const shareUrl = mockId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mock-draft/share/${mockId}` : ''

  const handleCopyLink = async () => {
    if (!mockId) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowShareOptions(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCreateImage = async () => {
    if (!gradeCardRef.current) return
    setGeneratingImage(true)
    try {
      const dataUrl = await toPng(gradeCardRef.current, {
        quality: 0.95,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        pixelRatio: 2,
      })
      setGeneratedImageUrl(dataUrl)
      setShowShareOptions(true)
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
    setGeneratingImage(false)
  }

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return
    const link = document.createElement('a')
    link.download = `mock-draft-grade-${grade.letter_grade}.png`
    link.href = generatedImageUrl
    link.click()
  }

  const socialShareUrl = encodeURIComponent(shareUrl)
  const socialShareText = encodeURIComponent(`I got a ${grade.letter_grade} (${grade.overall_grade}) on my ${teamName || ''} Mock Draft! Think you can do better? Try the Mock Draft Simulator on Sports Mockery!`)

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`} style={{ marginTop: 16 }}>
      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Shareable content area */}
      <div ref={gradeCardRef} style={{ padding: 4 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: '18px', color: isDark ? '#fff' : '#1a1a1a' }}>
            Draft Grade {teamName && draftYear ? `- ${teamName} ${draftYear}` : ''}
          </h3>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${teamColor}`,
                backgroundColor: 'transparent',
                color: teamColor,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          )}
        </div>

        {/* Grade Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          {/* Large Grade Circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: gradeColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>
              {grade.letter_grade}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 600 }}>
              {grade.overall_grade}
            </span>
          </div>

          {/* Summary Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', color: isDark ? '#e5e7eb' : '#374151', lineHeight: 1.5 }}>
              {grade.analysis}
            </p>
          </div>
        </div>

        {/* Pick Grades Grid */}
        {grade.pick_grades && grade.pick_grades.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontWeight: 600, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a', marginBottom: 10 }}>
              Pick Grades
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {grade.pick_grades.map((pick) => (
                <div
                  key={pick.pick_number}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: getGradeColor(pick.grade),
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {pick.grade}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: isDark ? '#fff' : '#1a1a1a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      #{pick.pick_number} {pick.prospect_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Strengths */}
          {grade.strengths && grade.strengths.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '13px', color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {grade.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {grade.weaknesses && grade.weaknesses.length > 0 && (
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '13px', color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Areas to Improve
              </h4>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {grade.weaknesses.map((w, i) => (
                  <li key={i} style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Branding footer for image */}
        <div style={{
          borderTop: `1px solid ${borderColor}`,
          paddingTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#bc0000' }}>SPORTS MOCKERY</span>
            <span style={{ fontSize: '12px', color: subText }}>Mock Draft Simulator</span>
          </div>
          <span style={{ fontSize: '11px', color: subText }}>sportsmockery.com/mock-draft</span>
        </div>
      </div>

      {/* Share Actions */}
      <div style={{
        marginTop: 20,
        paddingTop: 20,
        borderTop: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {/* Copy Link */}
          {mockId && (
            <button
              onClick={handleCopyLink}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `2px solid ${copied ? '#22c55e' : borderColor}`,
                backgroundColor: copied ? '#22c55e10' : 'transparent',
                color: copied ? '#22c55e' : isDark ? '#fff' : '#1a1a1a',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          )}

          {/* Create Image */}
          <button
            onClick={handleCreateImage}
            disabled={generatingImage}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: `2px solid ${borderColor}`,
              backgroundColor: generatingImage ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
              color: isDark ? '#fff' : '#1a1a1a',
              fontWeight: 600,
              fontSize: 13,
              cursor: generatingImage ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: generatingImage ? 0.7 : 1,
            }}
          >
            {generatingImage ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Create Image
              </>
            )}
          </button>
        </div>

        {/* Share Options Panel */}
        {showShareOptions && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
            border: `1px solid ${borderColor}`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 4 }}>
                Share your draft grade
              </div>
              <div style={{ fontSize: 11, color: subText }}>
                Show off your GM skills on social media
              </div>
            </div>

            {/* Generated Image Preview */}
            {generatedImageUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${borderColor}`,
                  marginBottom: 12,
                }}>
                  <img
                    src={generatedImageUrl}
                    alt="Draft Grade"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
                <button
                  onClick={handleDownloadImage}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download Image
                </button>
              </div>
            )}

            {/* Social Icons */}
            {mockId && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${socialShareText}&url=${socialShareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${socialShareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#1877f2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Reddit */}
                <a
                  href={`https://reddit.com/submit?url=${socialShareUrl}&title=${socialShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    backgroundColor: '#ff4500',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Marketing CTA */}
        <div style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          backgroundColor: isDark ? 'rgba(188, 0, 0, 0.15)' : 'rgba(188, 0, 0, 0.08)',
          border: '1px solid rgba(188, 0, 0, 0.3)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#bc0000', marginBottom: 6 }}>
            Think you can draft better?
          </div>
          <div style={{ fontSize: 12, color: subText, marginBottom: 12, lineHeight: 1.5 }}>
            Challenge your friends to beat your grade! The Mock Draft Simulator and Trade Simulator
            are free tools on Sports Mockery that let you test your GM skills with AI-powered analysis.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/mock-draft"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 600,
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              Try Mock Draft
            </a>
            <a
              href="/gm"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: 'transparent',
                border: '2px solid #bc0000',
                color: '#bc0000',
                fontWeight: 600,
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              Try Trade Simulator
            </a>
          </div>
          <div style={{ fontSize: 11, color: subText, marginTop: 10 }}>
            Join Sports Mockery free at <span style={{ color: '#bc0000', fontWeight: 600 }}>sportsmockery.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
