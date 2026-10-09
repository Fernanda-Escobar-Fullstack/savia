import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'

import { getBookDetails } from '../../services/openLibraryService'

import {
  borrowBook,
  reserveBook,
  subscribeToBookAvailability,
  subscribeToUserReservation,
  type BookAvailability,
} from '../../services/libraryService'

import {
  addToWishlist,
  isBookInWishlist,
  removeFromWishlist,
} from '../../services/wishlistService'

import {
  setReadingStatus,
  subscribeToReadingStatus,
  type ReadingStatus,
} from '../../services/readingStatusService'

import { useAppSelector } from '../../hooks/reduxHooks'
import type { BookDetails } from '../../types/BookDetails'

import styles from './BookDetailsPage.module.css'

interface BookDetailsContentProps {
  bookId?: string
}

type PendingAction =
  | 'borrow'
  | 'reserve'
  | 'remove-wishlist'
  | null

function BookDetailsContent({
  bookId,
}: BookDetailsContentProps) {
  const [searchParams] = useSearchParams()

  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  const [book, setBook] =
    useState<BookDetails | null>(null)

  const [availability, setAvailability] =
    useState<BookAvailability | null>(null)

  const [alreadyReserved, setAlreadyReserved] =
    useState<boolean | null>(null)

  const [inWishlist, setInWishlist] =
    useState(false)

  const [readingStatus, setCurrentReadingStatus] =
    useState<ReadingStatus | null>(null)

  const [coverFailed, setCoverFailed] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [actionLoading, setActionLoading] =
    useState(false)

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [message, setMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (!bookId) return

    const currentBookId = bookId
    let cancelled = false

    async function loadBook() {
      try {
        const result = await getBookDetails(
          currentBookId
        )

        if (cancelled) return

        setBook(result)

        if (userId) {
          const saved = await isBookInWishlist(
            userId,
            currentBookId
          )

          if (!cancelled) {
            setInWishlist(saved)
          }
        }
      } catch {
        if (!cancelled) {
          setError('Could not load book details.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadBook()

    const unsubscribeAvailability =
      subscribeToBookAvailability(
        currentBookId,
        setAvailability
      )

    const unsubscribeReservation = userId
      ? subscribeToUserReservation(
          userId,
          currentBookId,
          setAlreadyReserved
        )
      : undefined

    const unsubscribeReading = userId
      ? subscribeToReadingStatus(
          userId,
          currentBookId,
          setCurrentReadingStatus
        )
      : undefined

    return () => {
      cancelled = true
      unsubscribeAvailability()
      unsubscribeReservation?.()
      unsubscribeReading?.()
    }
  }, [bookId, userId])

  const handleConfirm = async () => {
    if (!userId || !book || !pendingAction || actionLoading) {
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      if (pendingAction === 'borrow') {
        await borrowBook(userId, book)

        setMessage(
          'Book borrowed successfully. You have 21 days to return it.'
        )

        if (inWishlist) {
          try {
            await removeFromWishlist(userId, book.id)
            setInWishlist(false)
          } catch {
            setMessage(
              'Book borrowed successfully. Could not remove it from your wishlist.'
            )
          }
        }
      } else if (pendingAction === 'reserve') {
        const created = await reserveBook(
          userId,
          book
        )

        setAlreadyReserved(true)

        setMessage(
          created
            ? 'Book reserved successfully.'
            : 'You have already reserved this book.'
        )
      } else {
        await removeFromWishlist(userId, book.id)
        setInWishlist(false)
        setMessage('Book removed from wishlist.')
      }

      setPendingAction(null)
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

  const handleWishlist = async () => {
    if (!userId || !book) return

    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      if (inWishlist) {
        setPendingAction('remove-wishlist')
        return
      } else {
        await addToWishlist(
          userId,
          book
        )

        setInWishlist(true)
        setMessage('Book added to wishlist.')
      }
    } catch {
      setError('Could not update wishlist.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReadingStatus = async (
    status: ReadingStatus
  ) => {
    if (!userId || !book) return

    const borrowedByMe =
      availability?.available === false &&
      availability.borrowedBy === userId

    if (!borrowedByMe) {
      setError(
        'You must borrow this book before updating its reading status.'
      )
      return
    }

    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      await setReadingStatus(
        userId,
        book,
        status
      )

      setCurrentReadingStatus(status)

      const label =
        status === 'to_read'
          ? 'To Read'
          : status === 'reading'
            ? 'Reading'
            : 'Completed'

      setMessage(`Book marked as ${label}.`)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not update reading status.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />

        <main className={styles.statusPage}>
          <LoadingScreen
            message="Opening your book"
            description="Getting your book details ready..."
          />
        </main>
      </>
    )
  }

  if (!book) {
    return (
      <>
        <Header />

        <main className={styles.statusPage}>
          <div className={styles.loadingCard}>
            {error || 'Book not found.'}
          </div>
        </main>
      </>
    )
  }

  const borrowedByMe =
    availability?.available === false &&
    availability.borrowedBy === userId

  const isUnavailable =
    availability?.available === false

  const fromNotification =
    searchParams.get('from') === 'notification'

  const reservationReady =
    fromNotification &&
    alreadyReserved === true &&
    availability?.available === true

  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
    : null

  return (
    <>
      <Header />

      <main className={styles.page}>
        <Link to="/" className={styles.back}>
          <span aria-hidden="true">←</span>
          Back to catalog
        </Link>

        <section className={styles.details}>
          <div className={styles.coverPanel}>
            <div className={styles.coverContainer}>
              {coverUrl && !coverFailed ? (
                <img
                  className={styles.coverImage}
                  src={coverUrl}
                  alt={`Cover of ${book.title}`}
                  loading="eager"
                  decoding="async"
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <div className={styles.noCover}>
                  <span aria-hidden="true">📖</span>
                  <p>No cover available</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.information}>
            <div className={styles.heading}>
              <span className={styles.eyebrow}>
                BOOK DETAILS
              </span>

              <h1>{book.title}</h1>

              <p className={styles.author}>
                {book.authorName.join(', ') ||
                  'Unknown author'}
              </p>
            </div>

            {book.subjects.length > 0 && (
              <div className={styles.subjects}>
                {book.subjects.map((subject) => (
                  <span key={subject}>
                    {subject}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.availability}>
              {!availability ? (
                <span className={styles.checking}>
                  Checking availability...
                </span>
              ) : availability.available ? (
                <span className={styles.available}>
                  <span
                    className={styles.statusDot}
                    aria-hidden="true"
                  />
                  Available
                </span>
              ) : (
                <span className={styles.unavailable}>
                  <span
                    className={styles.statusDot}
                    aria-hidden="true"
                  />
                  Unavailable
                </span>
              )}
            </div>

            {reservationReady && (
              <div className={styles.reservedNotice}>
                <span
                  className={styles.messageIcon}
                  aria-hidden="true"
                >
                  ✓
                </span>

                <span>
                  You reserved this book. It is now
                  available to borrow.
                </span>
              </div>
            )}

            <div className={styles.actions}>
              {availability?.available === true && (
                <Button
                  fullWidth
                  onClick={() =>
                    setPendingAction('borrow')
                  }
                  disabled={actionLoading}
                >
                  Borrow Book
                </Button>
              )}

              {borrowedByMe && (
                <>
                  <button
                    type="button"
                    className={styles.disabledButton}
                    disabled
                  >
                    Already Borrowed
                  </button>

                  <div className={styles.borrowedMessage}>
                    <span
                      className={styles.messageIcon}
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span>
                      You currently have this book.
                    </span>
                  </div>
                </>
              )}

              {isUnavailable && !borrowedByMe && (
                <>
                  {alreadyReserved === true ? (
                    <button
                      type="button"
                      className={styles.disabledButton}
                      disabled
                    >
                      Already Reserved
                    </button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() =>
                        setPendingAction('reserve')
                      }
                      disabled={
                        actionLoading ||
                        alreadyReserved !== false
                      }
                    >
                      Reserve Book
                    </Button>
                  )}

                  {alreadyReserved === true && (
                    <div className={styles.reservedNotice}>
                      <span
                        className={styles.messageIcon}
                        aria-hidden="true"
                      >
                        ✓
                      </span>

                      <span>
                        You have already reserved this book.
                      </span>
                    </div>
                  )}
                </>
              )}

              <Button
                variant="secondary"
                fullWidth
                onClick={handleWishlist}
                disabled={actionLoading}
              >
                {inWishlist
                  ? 'Remove from Wishlist'
                  : 'Add to Wishlist'}
              </Button>
            </div>

            <section className={styles.readingStatus}>
              <div className={styles.sectionHeading}>
                <h2>Reading Status</h2>

                <p>
                  Keep track of your reading progress.
                </p>
              </div>

              <div className={styles.readingButtons}>
                {(
                  [
                    ['to_read', 'To Read'],
                    ['reading', 'Reading'],
                    ['completed', 'Completed'],
                  ] as const
                ).map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      borrowedByMe &&
                      readingStatus === status
                        ? styles.readingActive
                        : ''
                    }
                    disabled={
                      actionLoading ||
                      !borrowedByMe
                    }
                    onClick={() =>
                      handleReadingStatus(status)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {!borrowedByMe && (
                <p className={styles.readingHint}>
                  Borrow this book to track your reading.
                </p>
              )}
            </section>

            {message && (
              <p className={styles.success} role="status">
                {message}
              </p>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <section className={styles.description}>
              <h2>Description</h2>

              <p>
                {book.description ||
                  'No description available for this book.'}
              </p>
            </section>
          </div>
        </section>
      </main>

      {pendingAction && (
        <ConfirmationModal
          title={
            pendingAction === 'borrow'
              ? 'Borrow this book?'
              : pendingAction === 'reserve'
                ? 'Reserve this book?'
                : 'Remove from wishlist?'
          }
          description={
            pendingAction === 'borrow'
              ? 'Are you sure you want to borrow this book?'
              : pendingAction === 'reserve'
                ? 'Are you sure you want to reserve this book?'
                : 'Are you sure you want to remove this book from your wishlist?'
          }
          confirmLabel={
            pendingAction === 'remove-wishlist'
              ? 'Remove'
              : 'Confirm'
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

function BookDetailsPage() {
  const { bookId } = useParams()

  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  return (
    <BookDetailsContent
      key={`${bookId ?? 'unknown'}-${userId ?? 'guest'}`}
      bookId={bookId}
    />
  )
}

export default BookDetailsPage
