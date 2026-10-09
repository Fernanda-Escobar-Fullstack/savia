import {
  doc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore'

import { db } from './firebase'

export async function cancelBookReservation(
  userId: string,
  bookId: string
): Promise<void> {
  const reference = doc(
    db,
    'reservations',
    `${userId}_${bookId}`
  )

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference)

    if (
      !snapshot.exists() ||
      snapshot.data().status !== 'active'
    ) {
      throw new Error(
        'This reservation is no longer active.'
      )
    }

    if (snapshot.data().userId !== userId) {
      throw new Error(
        'You cannot cancel this reservation.'
      )
    }

    transaction.update(reference, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
    })
  })
}