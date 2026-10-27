import {
  Timestamp,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore'

import { db } from './firebase'

import type { BookDetails } from '../types/BookDetails'

export type ReadingStatus =
  | 'to_read'
  | 'reading'
  | 'completed'

function getReadingId(userId: string, bookId: string) {
  return `${userId}_${bookId}`
}

function isReadingStatus(
  value: unknown
): value is ReadingStatus {
  return (
    value === 'to_read' ||
    value === 'reading' ||
    value === 'completed'
  )
}

export async function getReadingStatus(
  userId: string,
  bookId: string
): Promise<ReadingStatus | null> {
  const snapshot = await getDoc(
    doc(
      db,
      'readingStatus',
      getReadingId(userId, bookId)
    )
  )

  if (!snapshot.exists()) {
    return null
  }

  const status: unknown = snapshot.data().status

  return isReadingStatus(status) ? status : null
}

export function subscribeToReadingStatus(
  userId: string,
  bookId: string,
  callback: (status: ReadingStatus | null) => void
) {
  return onSnapshot(
    doc(
      db,
      'readingStatus',
      getReadingId(userId, bookId)
    ),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }

      const status: unknown = snapshot.data().status

      callback(
        isReadingStatus(status) ? status : null
      )
    }
  )
}

export async function setReadingStatus(
  userId: string,
  book: BookDetails,
  readingStatus: ReadingStatus
): Promise<void> {
  const statusRef = doc(
    db,
    'bookStatus',
    book.id
  )

  const readingRef = doc(
    db,
    'readingStatus',
    getReadingId(userId, book.id)
  )

  await runTransaction(db, async (transaction) => {
    const availabilitySnapshot =
      await transaction.get(statusRef)

    const availability = availabilitySnapshot.data()

    if (
      !availabilitySnapshot.exists() ||
      availability?.available !== false ||
      availability?.borrowedBy !== userId ||
      !availability?.activeLoanId
    ) {
      throw new Error(
        'You must borrow this book before updating its reading status.'
      )
    }

    const loanRef = doc(
      db,
      'loans',
      availability.activeLoanId as string
    )

    const loanSnapshot =
      await transaction.get(loanRef)

    if (
      !loanSnapshot.exists() ||
      loanSnapshot.data().status !== 'active' ||
      loanSnapshot.data().userId !== userId ||
      loanSnapshot.data().bookId !== book.id
    ) {
      throw new Error(
        'You do not have an active loan for this book.'
      )
    }

    transaction.set(readingRef, {
      userId,
      bookId: book.id,
      loanId: loanRef.id,
      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,
      status: readingStatus,
      updatedAt: Timestamp.now(),
    })
  })
}
