import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

import type { BookDetails } from '../types/BookDetails'
import type { Loan } from '../types/Loan'
import type { Reservation } from '../types/Reservation'

export interface BookAvailability {
  available: boolean
  borrowedBy: string | null
  activeLoanId: string | null
}

const defaultAvailability: BookAvailability = {
  available: true,
  borrowedBy: null,
  activeLoanId: null,
}

function reservationId(userId: string, bookId: string) {
  return `${userId}_${bookId}`
}

export function subscribeToBookAvailability(
  bookId: string,
  callback: (availability: BookAvailability) => void
) {
  return onSnapshot(
    doc(db, 'bookStatus', bookId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(defaultAvailability)
        return
      }

      const data = snapshot.data()

      callback({
        available: data.available !== false,
        borrowedBy: data.borrowedBy ?? null,
        activeLoanId: data.activeLoanId ?? null,
      })
    }
  )
}

export async function getBookAvailability(
  bookId: string
): Promise<BookAvailability> {
  const snapshot = await getDoc(
    doc(db, 'bookStatus', bookId)
  )

  if (!snapshot.exists()) {
    return defaultAvailability
  }

  const data = snapshot.data()

  return {
    available: data.available !== false,
    borrowedBy: data.borrowedBy ?? null,
    activeLoanId: data.activeLoanId ?? null,
  }
}

export function subscribeToUserReservation(
  userId: string,
  bookId: string,
  callback: (reserved: boolean) => void
) {
  const reference = doc(
    db,
    'reservations',
    reservationId(userId, bookId)
  )

  return onSnapshot(reference, (snapshot) => {
    callback(
      snapshot.exists() &&
      snapshot.data().status === 'active'
    )
  })
}

export async function reserveBook(
  userId: string,
  book: BookDetails
): Promise<boolean> {
  const statusRef = doc(db, 'bookStatus', book.id)

  const reservationRef = doc(
    db,
    'reservations',
    reservationId(userId, book.id)
  )

  return runTransaction(db, async (transaction) => {
    const statusSnapshot =
      await transaction.get(statusRef)

    const reservationSnapshot =
      await transaction.get(reservationRef)

    if (
      reservationSnapshot.exists() &&
      reservationSnapshot.data().status === 'active'
    ) {
      return false
    }

    const bookStatus = statusSnapshot.data()

    if (
      !statusSnapshot.exists() ||
      bookStatus?.available !== false
    ) {
      throw new Error(
        'This book is available. You can borrow it instead.'
      )
    }

    if (bookStatus.borrowedBy === userId) {
      throw new Error(
        'You already have this book on loan.'
      )
    }

    transaction.set(reservationRef, {
      userId,
      bookId: book.id,
      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,
      status: 'active',
      createdAt: Timestamp.now(),
    })

    return true
  })
}

export async function borrowBook(
  userId: string,
  book: BookDetails
): Promise<void> {
  const statusRef = doc(db, 'bookStatus', book.id)
  const loanRef = doc(collection(db, 'loans'))

  const reservationRef = doc(
    db,
    'reservations',
    reservationId(userId, book.id)
  )

  const readingRef = doc(
    db,
    'readingStatus',
    reservationId(userId, book.id)
  )

  await runTransaction(db, async (transaction) => {
    const statusSnapshot =
      await transaction.get(statusRef)

    const reservationSnapshot =
      await transaction.get(reservationRef)

    if (
      statusSnapshot.exists() &&
      statusSnapshot.data().available === false
    ) {
      throw new Error(
        'This book has already been borrowed.'
      )
    }

    const borrowedDate = new Date()
    const dueDate = new Date(borrowedDate)

    dueDate.setDate(dueDate.getDate() + 21)

    transaction.set(loanRef, {
      userId,
      bookId: book.id,
      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,
      borrowedAt: Timestamp.fromDate(borrowedDate),
      dueDate: Timestamp.fromDate(dueDate),
      returnedAt: null,
      status: 'active',
    })

    transaction.set(statusRef, {
      available: false,
      borrowedBy: userId,
      activeLoanId: loanRef.id,
    })

    transaction.set(readingRef, {
      userId,
      bookId: book.id,
      loanId: loanRef.id,
      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,
      status: 'to_read',
      updatedAt: Timestamp.now(),
    })

    if (
      reservationSnapshot.exists() &&
      reservationSnapshot.data().status === 'active'
    ) {
      transaction.update(reservationRef, {
        status: 'completed',
      })
    }
  })
}

export async function returnBook(
  loan: Loan
): Promise<void> {
  const loanRef = doc(db, 'loans', loan.id)
  const statusRef = doc(db, 'bookStatus', loan.bookId)

  const readingRef = doc(
    db,
    'readingStatus',
    reservationId(loan.userId, loan.bookId)
  )

  const reservationsSnapshot = await getDocs(
    query(
      collection(db, 'reservations'),
      where('bookId', '==', loan.bookId)
    )
  )

  await runTransaction(db, async (transaction) => {
    const loanSnapshot = await transaction.get(loanRef)
    const statusSnapshot = await transaction.get(statusRef)
    const readingSnapshot =
      await transaction.get(readingRef)

    const activeReservations: Array<{
      id: string
      userId: string
    }> = []

    for (const reservation of reservationsSnapshot.docs) {
      const snapshot = await transaction.get(
        reservation.ref
      )

      if (
        snapshot.exists() &&
        snapshot.data().status === 'active'
      ) {
        activeReservations.push({
          id: reservation.id,
          userId: snapshot.data().userId as string,
        })
      }
    }

    if (
      !loanSnapshot.exists() ||
      loanSnapshot.data().status !== 'active'
    ) {
      throw new Error(
        'This loan is no longer active.'
      )
    }

    const status = statusSnapshot.data()

    if (
      !statusSnapshot.exists() ||
      status?.activeLoanId !== loan.id ||
      status?.borrowedBy !== loan.userId
    ) {
      throw new Error(
        'This loan does not match the active book loan.'
      )
    }

    const reading = readingSnapshot.data()

    if (
      !readingSnapshot.exists() ||
      reading?.loanId !== loan.id ||
      reading?.status !== 'completed'
    ) {
      throw new Error(
        'You must mark this book as completed before returning it.'
      )
    }

    transaction.update(loanRef, {
      status: 'returned',
      returnedAt: Timestamp.now(),
    })

    transaction.set(statusRef, {
      available: true,
      borrowedBy: null,
      activeLoanId: null,
    })

    for (const reservation of activeReservations) {
      const notificationRef = doc(
        db,
        'notifications',
        `${loan.id}_${reservation.id}`
      )

      transaction.set(notificationRef, {
        userId: reservation.userId,
        bookId: loan.bookId,
        title: loan.title,
        message:
          'A book you reserved is now available.',
        type: 'book_available',
        read: false,
        createdAt: Timestamp.now(),
      })
    }
  })
}

export async function getUserLoans(
  userId: string
): Promise<Loan[]> {
  const results = await getDocs(
    query(
      collection(db, 'loans'),
      where('userId', '==', userId)
    )
  )

  return results.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  })) as Loan[]
}

export async function getUserReservations(
  userId: string
): Promise<Reservation[]> {
  const results = await getDocs(
    query(
      collection(db, 'reservations'),
      where('userId', '==', userId)
    )
  )

  return results.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  })) as Reservation[]
}
