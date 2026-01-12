'use client'

import { useState, useEffect } from 'react'

interface VoiceSearchProps {
  onResult?: (transcript: string) => void
  className?: string
}

export default function VoiceSearch({ onResult, className = '' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
    }
  }, [])

  const handleClick = () => {
    if (!isSupported) {
      alert('Voice search is not supported in your browser. Please try Chrome or Edge.')
      return
    }

    setShowModal(true)
    // In a real implementation, this would start the speech recognition
    setIsListening(true)

    // Simulate listening for demo purposes
    setTimeout(() => {
      setTranscript('Bears quarterback news...')
      setTimeout(() => {
        setIsListening(false)
        if (onResult) {
          onResult('Bears quarterback news')
        }
        setTimeout(() => {
          setShowModal(false)
          setTranscript('')
        }, 1000)
      }, 2000)
    }, 1000)
  }

  const handleClose = () => {
    setIsListening(false)
    setShowModal(false)
    setTranscript('')
  }

  return (
    <>
      {/* Voice Search Button */}
      <button
        onClick={handleClick}
        className={`group relative flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all hover:bg-white/20 ${className}`}
        aria-label="Voice search"
      >
        {/* Microphone icon */}
        <svg
          className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>

        {/* Pulse ring on hover */}
        <span className="absolute inset-0 rounded-full ring-2 ring-white/0 transition-all group-hover:ring-white/20" />
      </button>

      {/* Voice Search Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-3xl bg-zinc-900 p-8 text-center shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Microphone animation */}
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="relative">
                {/* Outer rings */}
                {isListening && (
                  <>
                    <div className="absolute -inset-4 animate-ping rounded-full bg-[#8B0000]/20" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-8 animate-ping rounded-full bg-[#8B0000]/10" style={{ animationDuration: '2s' }} />
                  </>
                )}

                {/* Microphone button */}
                <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                  isListening
                    ? 'bg-gradient-to-br from-[#8B0000] to-[#FF0000]'
                    : 'bg-zinc-800'
                } shadow-lg transition-all`}>
                  <svg
                    className={`h-8 w-8 ${isListening ? 'text-white' : 'text-zinc-500'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status text */}
            <h3 className="mb-2 text-xl font-bold text-white">
              {isListening ? 'Listening...' : 'Processing...'}
            </h3>
            <p className="mb-6 text-sm text-zinc-400">
              {isListening
                ? 'Speak now to search Sports Mockery'
                : 'Understanding your request'}
            </p>

            {/* Transcript */}
            {transcript && (
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-zinc-500">You said:</p>
                <p className="text-lg font-semibold text-white">&quot;{transcript}&quot;</p>
              </div>
            )}

            {/* Sound wave visualization */}
            {isListening && (
              <div className="mt-6 flex items-center justify-center gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-1 rounded-full bg-gradient-to-t from-[#8B0000] to-[#FF0000]"
                    style={{
                      animation: 'soundWave 0.5s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 rounded-lg bg-zinc-800/50 p-3">
              <p className="text-xs text-zinc-500">
                Try: &quot;Latest Bears news&quot; or &quot;Bulls game scores&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sound wave animation keyframes */}
      <style jsx>{`
        @keyframes soundWave {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </>
  )
}
