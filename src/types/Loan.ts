import type { Timestamp } from 'firebase/firestore'

export interface Loan {
  id: string
  userId: string
  bookId: string

  title: string
  authorName: string[]
  coverId?: number

  borrowedAt: Timestamp
  dueDate: Timestamp

  returnedAt: Timestamp | null

  status: 'active' | 'returned'
}