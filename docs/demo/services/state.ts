import { Timestamp } from 'firebase/firestore'
import type { BookDetails } from '../../../src/types/BookDetails'
import type { Loan } from '../../../src/types/Loan'
import type { Reservation } from '../../../src/types/Reservation'

export const demoUserId = 'portfolio-demo-user'

export const demoState: {
  loans: Loan[]
  reservations: Reservation[]
  reading: Record<string, 'to_read' | 'reading' | 'completed'>
  borrowedBookIds: Set<string>
  reservedBookIds: Set<string>
} = {
  loans: [],
  reservations: [],
  reading: {},
  borrowedBookIds: new Set(),
  reservedBookIds: new Set(),
}

export function addDemoLoan(book: BookDetails) {
  if (demoState.loans.some((loan) => loan.bookId === book.id && loan.status === 'active')) return

  const borrowedAt = new Date('2026-10-27T12:00:00Z')
  const dueDate = new Date('2026-11-17T12:00:00Z')

  demoState.loans.push({
    id: `demo-loan-${book.id}`,
    userId: demoUserId,
    bookId: book.id,
    title: book.title,
    authorName: book.authorName,
    coverId: book.coverId,
    borrowedAt: Timestamp.fromDate(borrowedAt),
    dueDate: Timestamp.fromDate(dueDate),
    returnedAt: null,
    status: 'active',
  })
  demoState.borrowedBookIds.add(book.id)
  demoState.reading[book.id] = 'to_read'
}
