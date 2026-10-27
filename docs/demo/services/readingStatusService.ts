import type { BookDetails } from '../../../src/types/BookDetails'
import { demoState } from './state'

export type ReadingStatus = 'to_read' | 'reading' | 'completed'

const listeners = new Map<string, Set<(status: ReadingStatus | null) => void>>()

export async function getReadingStatus(_userId: string, bookId: string) {
  return demoState.reading[bookId] ?? null
}

export function subscribeToReadingStatus(
  _userId: string,
  bookId: string,
  callback: (status: ReadingStatus | null) => void
) {
  const bookListeners = listeners.get(bookId) ?? new Set()
  bookListeners.add(callback)
  listeners.set(bookId, bookListeners)
  callback(demoState.reading[bookId] ?? null)
  return () => bookListeners.delete(callback)
}

export async function setReadingStatus(
  _userId: string,
  book: BookDetails,
  status: ReadingStatus
) {
  demoState.reading[book.id] = status
  listeners.get(book.id)?.forEach((listener) => listener(status))
}
