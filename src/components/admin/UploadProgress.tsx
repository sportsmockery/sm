'use client'

interface UploadProgressProps {
  filename: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
  onCancel?: () => void
}

export default function UploadProgress({
  filename,
  progress,
  status,
  error,
  onCancel
}: UploadProgressProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Status icon */}
          {status === 'uploading' && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          )}
          {status === 'complete' && (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          {/* Filename */}
          <span className="text-sm text-white truncate" title={filename}>
            {filename}
          </span>
        </div>

        {/* Progress percentage or cancel */}
        <div className="flex items-center gap-2">
          {status === 'uploading' && (
            <>
              <span className="text-sm text-gray-400">{progress}%</span>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-white p-1"
                  title="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
          {status === 'complete' && (
            <span className="text-sm text-green-500">Complete</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-500">Failed</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            status === 'error'
              ? 'bg-red-500'
              : status === 'complete'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Error message */}
      {status === 'error' && error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}
