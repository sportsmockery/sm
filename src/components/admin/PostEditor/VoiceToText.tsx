'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Web Speech API type declarations
interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface VoiceToTextProps {
  onTranscript: (text: string) => void
  onPolishedTranscript?: (text: string) => void
}

export default function VoiceToText({
  onTranscript,
  onPolishedTranscript,
}: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isPolishing, setIsPolishing] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        setTranscript((prev) => prev + final)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (isListening) {
        // Restart if we want to continue listening
        recognition.start()
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setInterimTranscript('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const insertTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim())
      setTranscript('')
      setInterimTranscript('')
    }
  }

  const polishAndInsert = async () => {
    if (!transcript.trim() || !onPolishedTranscript) return

    setIsPolishing(true)
    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'polish', content: transcript.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        onPolishedTranscript(data.content)
      } else {
        // Fallback to raw transcript
        onTranscript(transcript.trim())
      }
    } catch (error) {
      console.error('Error polishing transcript:', error)
      onTranscript(transcript.trim())
    } finally {
      setIsPolishing(false)
      setTranscript('')
      setInterimTranscript('')
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
        Voice-to-text is not supported in this browser. Try Chrome or Edge.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Voice to Text</span>
        {isListening && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Recording
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Recording button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {isListening ? (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isListening ? 'Click to stop recording' : 'Click to start dictating'}
        </p>

        {/* Transcript display */}
        {(transcript || interimTranscript) && (
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {transcript}
              {interimTranscript && (
                <span className="text-zinc-400 dark:text-zinc-500">{interimTranscript}</span>
              )}
            </p>
          </div>
        )}

        {/* Action buttons */}
        {transcript && !isListening && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insertTranscript}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Insert Raw
            </button>
            {onPolishedTranscript && (
              <button
                type="button"
                onClick={polishAndInsert}
                disabled={isPolishing}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {isPolishing ? 'Polishing...' : '✨ Mockery Polish'}
              </button>
            )}
            <button
              type="button"
              onClick={clearTranscript}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
