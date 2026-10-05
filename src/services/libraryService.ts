import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
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

export function subscribeToBookAvailability(
  bookId: string,
  callback: (availability: BookAvailability) => void
) {
  const statusReference = doc(
    db,
    'bookStatus',
    bookId
  )

  return onSnapshot(
    statusReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          available: true,
          borrowedBy: null,
          activeLoanId: null,
        })

        return
      }

      const data = snapshot.data()

      callback({
        available: data.available ?? true,
        borrowedBy: data.borrowedBy ?? null,
        activeLoanId: data.activeLoanId ?? null,
      })
    }
  )
}

export async function getBookAvailability(
  bookId: string
): Promise<BookAvailability> {
  const statusReference = doc(
    db,
    'bookStatus',
    bookId
  )

  const snapshot = await getDoc(
    statusReference
  )

  if (!snapshot.exists()) {
    return {
      available: true,
      borrowedBy: null,
      activeLoanId: null,
    }
  }

  const data = snapshot.data()

  return {
    available: data.available ?? true,
    borrowedBy: data.borrowedBy ?? null,
    activeLoanId: data.activeLoanId ?? null,
  }
}

export async function borrowBook(
  userId: string,
  book: BookDetails
) {
  const loanReference = doc(
    collection(db, 'loans')
  )

  const statusReference = doc(
    db,
    'bookStatus',
    book.id
  )

  const borrowedDate = new Date()

  const dueDate = new Date(
    borrowedDate
  )

  dueDate.setDate(
    dueDate.getDate() + 21
  )

  await runTransaction(
    db,
    async (transaction) => {
      const statusSnapshot =
        await transaction.get(
          statusReference
        )

      if (
        statusSnapshot.exists() &&
        statusSnapshot.data().available === false
      ) {
        throw new Error(
          'This book is currently unavailable.'
        )
      }

      transaction.set(
        loanReference,
        {
          userId,
          bookId: book.id,

          title: book.title,
          authorName: book.authorName,
          coverId: book.coverId ?? null,

          borrowedAt:
            Timestamp.fromDate(
              borrowedDate
            ),

          dueDate:
            Timestamp.fromDate(
              dueDate
            ),

          returnedAt: null,

          status: 'active',
        }
      )

      transaction.set(
        statusReference,
        {
          available: false,
          borrowedBy: userId,
          activeLoanId: loanReference.id,
        }
      )
    }
  )
}

export async function returnBook(
  loan: Loan
) {
  const loanReference = doc(
    db,
    'loans',
    loan.id
  )

  const statusReference = doc(
    db,
    'bookStatus',
    loan.bookId
  )

  await runTransaction(
    db,
    async (transaction) => {
      transaction.update(
        loanReference,
        {
          status: 'returned',
          returnedAt: Timestamp.now(),
        }
      )

      transaction.set(
        statusReference,
        {
          available: true,
          borrowedBy: null,
          activeLoanId: null,
        }
      )
    }
  )
}

export async function reserveBook(
  userId: string,
  book: BookDetails
) {
  const availability =
    await getBookAvailability(
      book.id
    )

  if (availability.available) {
    throw new Error(
      'This book is currently available and does not need a reservation.'
    )
  }

  if (
    availability.borrowedBy === userId
  ) {
    throw new Error(
      'You already have this book on loan.'
    )
  }

  const reservationId =
    `${userId}_${book.id}`

  const reservationReference =
    doc(
      db,
      'reservations',
      reservationId
    )

  const existingReservation =
    await getDoc(
      reservationReference
    )

  if (
    existingReservation.exists() &&
    existingReservation.data().status ===
      'active'
  ) {
    throw new Error(
      'You already reserved this book.'
    )
  }

  await setDoc(
    reservationReference,
    {
      userId,
      bookId: book.id,

      title: book.title,
      authorName: book.authorName,
      coverId: book.coverId ?? null,

      createdAt: Timestamp.now(),

      status: 'active',
    }
  )
}

export async function getUserLoans(
  userId: string
): Promise<Loan[]> {
  const loansQuery = query(
    collection(db, 'loans'),
    where(
      'userId',
      '==',
      userId
    )
  )

  const snapshot =
    await getDocs(
      loansQuery
    )

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  ) as Loan[]
}

export async function getUserReservations(
  userId: string
): Promise<Reservation[]> {
  const reservationsQuery = query(
    collection(
      db,
      'reservations'
    ),
    where(
      'userId',
      '==',
      userId
    )
  )

  const snapshot =
    await getDocs(
      reservationsQuery
    )

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  ) as Reservation[]
}