import { Timestamp } from 'firebase/firestore'
import type { BookDetails } from '../../../src/types/BookDetails'
import type { Loan } from '../../../src/types/Loan'
import type { Reservation } from '../../../src/types/Reservation'
import { addDemoLoan, demoState, demoUserId } from './state'

export interface BookAvailability {
  available: boolean
  borrowedBy: string | null
  activeLoanId: string | null
}

const availabilityListeners = new Map<string, Set<(value: BookAvailability) => void>>()
const reservationListeners = new Map<string, Set<(value: boolean) => void>>()

function availabilityFor(bookId: string): BookAvailability {
  if (demoState.borrowedBookIds.has(bookId)) {
    return {
      available: false,
      borrowedBy: demoUserId,
      activeLoanId: `demo-loan-${bookId}`,
    }
  }

  const unavailablePreview = new URLSearchParams(window.location.search).get('demo') === 'unavailable'

  return {
    available: !unavailablePreview,
    borrowedBy: unavailablePreview ? 'another-reader' : null,
    activeLoanId: unavailablePreview ? 'another-loan' : null,
  }
}

function publishAvailability(bookId: string) {
  const value = availabilityFor(bookId)
  availabilityListeners.get(bookId)?.forEach((listener) => listener(value))
}

export function subscribeToBookAvailability(
  bookId: string,
  callback: (availability: BookAvailability) => void
) {
  const listeners = availabilityListeners.get(bookId) ?? new Set()
  listeners.add(callback)
  availabilityListeners.set(bookId, listeners)
  callback(availabilityFor(bookId))
  return () => listeners.delete(callback)
}

export async function getBookAvailability(bookId: string) {
  return availabilityFor(bookId)
}

export function subscribeToUserReservation(
  _userId: string,
  bookId: string,
  callback: (reserved: boolean) => void
) {
  const listeners = reservationListeners.get(bookId) ?? new Set()
  listeners.add(callback)
  reservationListeners.set(bookId, listeners)
  callback(demoState.reservedBookIds.has(bookId))
  return () => listeners.delete(callback)
}

export async function borrowBook(_userId: string, book: BookDetails) {
  addDemoLoan(book)
  publishAvailability(book.id)
}

export async function reserveBook(_userId: string, book: BookDetails) {
  if (demoState.reservedBookIds.has(book.id)) return false
  demoState.reservedBookIds.add(book.id)
  demoState.reservations.push({
    id: `demo-reservation-${book.id}`,
    userId: demoUserId,
    bookId: book.id,
    title: book.title,
    authorName: book.authorName,
    coverId: book.coverId,
    createdAt: Timestamp.fromDate(new Date('2026-10-27T12:00:00Z')),
    status: 'active',
  })
  reservationListeners.get(book.id)?.forEach((listener) => listener(true))
  return true
}

export async function returnBook(loan: Loan) {
  const match = demoState.loans.find((item) => item.id === loan.id)
  if (!match) throw new Error('Demo loan not found.')
  match.status = 'returned'
  match.returnedAt = Timestamp.fromDate(new Date('2026-10-30T12:00:00Z'))
  demoState.borrowedBookIds.delete(match.bookId)
  publishAvailability(match.bookId)
}

export async function getUserLoans(): Promise<Loan[]> {
  return [...demoState.loans]
}

export async function getUserReservations(): Promise<Reservation[]> {
  return [...demoState.reservations]
}
