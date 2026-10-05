import type { Timestamp } from 'firebase/firestore'

export interface Reservation {
  id: string
  userId: string
  bookId: string

  title: string
  authorName: string[]
  coverId?: number

  createdAt: Timestamp

  status: 'active' | 'completed' | 'cancelled'
}