'use client'

import { useState } from 'react'
import { format } from 'date-fns'

interface Note {
  id: string
  author: string
  content: string
  createdAt: string
  resolved?: boolean
}

interface CollaborationNotesProps {
  postId?: string
  notes: Note[]
  onAddNote: (content: string) => void
  onResolveNote: (noteId: string) => void
  currentUser?: string
}

export default function CollaborationNotes({
  notes = [],
  onAddNote,
  onResolveNote,
  currentUser = 'Editor',
}: CollaborationNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote('')
    }
  }

  const activeNotes = notes.filter((n) => !n.resolved)
  const resolvedNotes = notes.filter((n) => n.resolved)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Collaboration Notes</span>
          {activeNotes.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
              {activeNotes.length}
            </span>
          )}
        </div>
        {resolvedNotes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowResolved(!showResolved)}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            {showResolved ? 'Hide' : 'Show'} resolved ({resolvedNotes.length})
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Add new note */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {currentUser.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Leave a note for other editors..."
              rows={2}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            {newNote.trim() && (
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Note
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Active notes */}
        {activeNotes.length > 0 && (
          <div className="space-y-3">
            {activeNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        {note.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {note.author}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResolveNote(note.id)}
                    className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as resolved"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{note.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Resolved notes */}
        {showResolved && resolvedNotes.length > 0 && (
          <div className="space-y-3 opacity-60">
            <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Resolved
            </p>
            {resolvedNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {note.author}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {format(new Date(note.createdAt), 'MMM d')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 line-through dark:text-zinc-400">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {notes.length === 0 && (
          <div className="text-center py-6">
            <svg
              className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No notes yet. Start a conversation with other editors.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
