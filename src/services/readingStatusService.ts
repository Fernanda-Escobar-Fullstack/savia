import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from './firebase'

import type { BookDetails } from '../types/BookDetails'

export type ReadingStatus =
  | 'reading'
  | 'completed'

export async function setReadingStatus(
  userId: string,
  book: BookDetails,
  status: ReadingStatus
) {
  const documentId =
    `${userId}_${book.id}`

  const reference = doc(
    db,
    'readingStatus',
    documentId
  )

  await setDoc(
    reference,
    {
      userId,
      bookId: book.id,

      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,

      status,

      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  )
}

export async function getReadingStatus(
  userId: string,
  bookId: string
): Promise<ReadingStatus | null> {
  const documentId =
    `${userId}_${bookId}`

  const snapshot = await getDoc(
    doc(
      db,
      'readingStatus',
      documentId
    )
  )

  if (!snapshot.exists()) {
    return null
  }

  return (
    snapshot.data().status as ReadingStatus
  )
}