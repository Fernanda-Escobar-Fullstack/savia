import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'

import {
  getUserLoans,
  getUserReservations,
  returnBook,
} from '../../services/libraryService'

import {
  getReadingStatus,
  type ReadingStatus,
} from '../../services/readingStatusService'

import {
  cancelBookReservation,
} from '../../services/reservationCancellationService'

import { useAppSelector } from '../../hooks/reduxHooks'

import type { Loan } from '../../types/Loan'
import type { Reservation } from '../../types/Reservation'

import styles from './MyLibraryPage.module.css'

type LibraryTab = 'active' | 'reservations' | 'history'

type PendingAction =
  | { type: 'return'; loan: Loan }
  | { type: 'cancel'; reservation: Reservation }

function MyLibraryPage() {
  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  const [activeTab, setActiveTab] =
    useState<LibraryTab>('active')

  const [loans, setLoans] = useState<Loan[]>([])
  const [reservations, setReservations] =
    useState<Reservation[]>([])

  const [readingByBook, setReadingByBook] =
    useState<Record<string, ReadingStatus | null>>({})

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  const [pendingAction, setPendingAction] =
    useState<PendingAction | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) return

    let cancelled = false

    async function loadLibrary() {
      try {
        const [loanResults, reservationResults] =
          await Promise.all([
            getUserLoans(userId!),
            getUserReservations(userId!),
          ])

        const activeResults = loanResults.filter(
          (loan) => loan.status === 'active'
        )

        const statuses = await Promise.all(
          activeResults.map(async (loan) => ({
            bookId: loan.bookId,
            status: await getReadingStatus(
              userId!,
              loan.bookId
            ),
          }))
        )

        if (cancelled) return

        const statusMap: Record<
          string,
          ReadingStatus | null
        > = {}

        for (const item of statuses) {
          statusMap[item.bookId] = item.status
        }

        setLoans(loanResults)
        setReservations(reservationResults)
        setReadingByBook(statusMap)
      } catch {
        if (!cancelled) {
          setError('Could not load your library.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadLibrary()

    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  const handleReturnRequest = async (loan: Loan) => {
    if (!userId) return

    try {
      setCheckingId(loan.id)
      setError(null)
      setMessage(null)

      const readingStatus = await getReadingStatus(
        userId,
        loan.bookId
      )

      if (readingStatus !== 'completed') {
        setError(
          'You must mark this book as completed before returning it.'
        )
        return
      }

      setPendingAction({
        type: 'return',
        loan,
      })
    } catch {
      setError('Could not verify reading status.')
    } finally {
      setCheckingId(null)
    }
  }

  const handleCancelRequest = (
    reservation: Reservation
  ) => {
    setError(null)
    setMessage(null)

    setPendingAction({
      type: 'cancel',
      reservation,
    })
  }

  const handleConfirm = async () => {
    if (!pendingAction || !userId || actionLoading) {
      return
    }

    try {
      setActionLoading(true)
      setError(null)

      if (pendingAction.type === 'return') {
        await returnBook(pendingAction.loan)

        setMessage('Book returned successfully.')
      } else {
        await cancelBookReservation(
          userId,
          pendingAction.reservation.bookId
        )

        setMessage('Reservation cancelled successfully.')
      }

      setPendingAction(null)
      setLoading(true)
      setReloadKey((current) => current + 1)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not complete the action.'
      )
      setPendingAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  const activeLoans = useMemo(
    () => loans.filter((loan) => loan.status === 'active'),
    [loans]
  )

  const activeReservations = useMemo(
    () => reservations.filter(
      (reservation) => reservation.status === 'active'
    ),
    [reservations]
  )

  const history = useMemo(
    () => loans.filter((loan) => loan.status === 'returned'),
    [loans]
  )

  const formatDate = (timestamp: Loan['borrowedAt']) =>
    timestamp.toDate().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  const readingLabel = (
    status: ReadingStatus | null | undefined
  ) => {
    if (status === 'to_read') return 'To Read'
    if (status === 'reading') return 'Reading'
    if (status === 'completed') return 'Completed'

    return 'Not started'
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header className={styles.heading}>
          <h1>My Library</h1>
          <p>
            Track loans, reservations,
            and your borrowing history.
          </p>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={
              activeTab === 'active'
                ? styles.activeTab
                : ''
            }
            onClick={() => setActiveTab('active')}
          >
            Active Loans
          </button>

          <button
            type="button"
            className={
              activeTab === 'reservations'
                ? styles.activeTab
                : ''
            }
            onClick={() => setActiveTab('reservations')}
          >
            Reservations
          </button>

          <button
            type="button"
            className={
              activeTab === 'history'
                ? styles.activeTab
                : ''
            }
            onClick={() => setActiveTab('history')}
          >
            Loan History
          </button>
        </div>

        {loading && (
          <LoadingScreen
            message="Loading your library"
            description="Getting your loans and reservations ready..."
          />
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}

        {!loading && activeTab === 'active' && (
          <section className={styles.list}>
            {activeLoans.length === 0 ? (
              <p className={styles.empty}>
                You don't have any active loans.
              </p>
            ) : (
              activeLoans.map((loan) => (
                <article
                  key={loan.id}
                  className={styles.card}
                >
                  <h2>
                    <Link
                      to={`/books/${loan.bookId}`}
                      className={styles.bookLink}
                    >
                      {loan.title}
                    </Link>
                  </h2>

                  <p className={styles.loanIndicator}>
                    You currently have this book.
                  </p>

                  <div className={styles.dateBox}>
                    <span>Borrow date</span>
                    <strong>
                      {formatDate(loan.borrowedAt)}
                    </strong>
                  </div>

                  <div className={styles.due}>
                    Due date: {formatDate(loan.dueDate)}
                  </div>

                  <p className={styles.readingInfo}>
                    Reading status:{' '}
                    <strong>
                      {readingLabel(
                        readingByBook[loan.bookId]
                      )}
                    </strong>
                  </p>

                  {readingByBook[loan.bookId] !==
                    'completed' && (
                    <p className={styles.returnHint}>
                      Mark the book as Completed in
                      Book Details before returning it.
                    </p>
                  )}

                  <Button
                    variant="secondary"
                    disabled={
                      actionLoading ||
                      checkingId !== null
                    }
                    onClick={() =>
                      handleReturnRequest(loan)
                    }
                  >
                    {checkingId === loan.id
                      ? 'Checking...'
                      : 'Return Book'}
                  </Button>
                </article>
              ))
            )}
          </section>
        )}

        {!loading && activeTab === 'reservations' && (
          <section className={styles.list}>
            {activeReservations.length === 0 ? (
              <p className={styles.empty}>
                You don't have active reservations.
              </p>
            ) : (
              activeReservations.map((reservation) => (
                <article
                  key={reservation.id}
                  className={styles.card}
                >
                  <h2>
                    <Link
                      to={`/books/${reservation.bookId}`}
                      className={styles.bookLink}
                    >
                      {reservation.title}
                    </Link>
                  </h2>

                  <p className={styles.loanIndicator}>
                    You have already reserved this book.
                  </p>

                  <Button
                    variant="secondary"
                    disabled={actionLoading}
                    onClick={() =>
                      handleCancelRequest(reservation)
                    }
                  >
                    Cancel Reservation
                  </Button>
                </article>
              ))
            )}
          </section>
        )}

        {!loading && activeTab === 'history' && (
          <section className={styles.list}>
            {history.length === 0 ? (
              <p className={styles.empty}>
                No loan history yet.
              </p>
            ) : (
              history.map((loan) => (
                <article
                  key={loan.id}
                  className={styles.card}
                >
                  <h2>{loan.title}</h2>

                  <p>
                    Borrow date: {formatDate(loan.borrowedAt)}
                  </p>

                  <p>
                    Return date:{' '}
                    {loan.returnedAt
                      ? formatDate(loan.returnedAt)
                      : '-'}
                  </p>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      {pendingAction && (
        <ConfirmationModal
          title={
            pendingAction.type === 'return'
              ? 'Return this book?'
              : 'Cancel this reservation?'
          }
          description={
            pendingAction.type === 'return'
              ? 'Are you sure you want to return this book?'
              : 'Are you sure you want to cancel this reservation?'
          }
          confirmLabel={
            pendingAction.type === 'return'
              ? 'Confirm'
              : 'Cancel Reservation'
          }
          loading={actionLoading}
          onConfirm={() => {
            void handleConfirm()
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  )
}

export default MyLibraryPage
