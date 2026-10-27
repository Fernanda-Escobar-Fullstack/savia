import { demoState } from './state'

export async function cancelBookReservation(_userId: string, bookId: string) {
  const reservation = demoState.reservations.find(
    (item) => item.bookId === bookId && item.status === 'active'
  )
  if (reservation) reservation.status = 'cancelled'
  demoState.reservedBookIds.delete(bookId)
}
