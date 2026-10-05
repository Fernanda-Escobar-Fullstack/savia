import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'

import {
  getBookDetails,
} from '../../services/openLibraryService'

import {
  borrowBook,
  reserveBook,
  subscribeToBookAvailability,
  type BookAvailability,
} from '../../services/libraryService'

import {
  addToWishlist,
  isBookInWishlist,
  removeFromWishlist,
} from '../../services/wishlistService'

import {
  getReadingStatus,
  setReadingStatus,
  type ReadingStatus,
} from '../../services/readingStatusService'

import {
  useAppSelector,
} from '../../hooks/reduxHooks'

import type {
  BookDetails,
} from '../../types/BookDetails'

import styles from './BookDetailsPage.module.css'

function BookDetailsPage() {
  const { bookId } = useParams()

  const user = useAppSelector(
    (state) => state.auth.user
  )

  const [
    book,
    setBook,
  ] = useState<BookDetails | null>(
    null
  )

  const [
    availability,
    setAvailability,
  ] = useState<BookAvailability>({
    available: true,
    borrowedBy: null,
    activeLoanId: null,
  })

  const [
    inWishlist,
    setInWishlist,
  ] = useState(false)

  const [
    readingStatus,
    setCurrentReadingStatus,
  ] =
    useState<ReadingStatus | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!bookId) {
      return
    }

    const loadBook = async () => {
      try {
        setLoading(true)
        setError(null)

        const result =
          await getBookDetails(
            bookId
          )

        setBook(result)

        if (user) {
          const [
            saved,
            status,
          ] = await Promise.all([
            isBookInWishlist(
              user.uid,
              bookId
            ),

            getReadingStatus(
              user.uid,
              bookId
            ),
          ])

          setInWishlist(saved)

          setCurrentReadingStatus(
            status
          )
        }
      } catch {
        setError(
          'Could not load book details.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBook()

    const unsubscribe =
      subscribeToBookAvailability(
        bookId,
        setAvailability
      )

    return () => {
      unsubscribe()
    }
  }, [bookId, user])

  const handleBorrow =
    async () => {
      if (!user || !book) {
        return
      }

      try {
        setActionLoading(true)
        setError(null)
        setMessage(null)

        await borrowBook(
          user.uid,
          book
        )

        if (inWishlist) {
          await removeFromWishlist(
            user.uid,
            book.id
          )

          setInWishlist(false)
        }

        await setReadingStatus(
          user.uid,
          book,
          'reading'
        )

        setCurrentReadingStatus(
          'reading'
        )

        setMessage(
          'Book borrowed successfully. You have 21 days to return it.'
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not borrow book.'
        )
      } finally {
        setActionLoading(false)
      }
    }

  const handleReserve =
    async () => {
      if (!user || !book) {
        return
      }

      try {
        setActionLoading(true)
        setError(null)
        setMessage(null)

        await reserveBook(
          user.uid,
          book
        )

        setMessage(
          'Book reserved successfully.'
        )
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not reserve book.'
        )
      } finally {
        setActionLoading(false)
      }
    }

  const handleWishlist =
    async () => {
      if (!user || !book) {
        return
      }

      try {
        setActionLoading(true)
        setError(null)
        setMessage(null)

        if (inWishlist) {
          await removeFromWishlist(
            user.uid,
            book.id
          )

          setInWishlist(false)

          setMessage(
            'Book removed from wishlist.'
          )
        } else {
          await addToWishlist(
            user.uid,
            book
          )

          setInWishlist(true)

          setMessage(
            'Book added to wishlist.'
          )
        }
      } catch {
        setError(
          'Could not update wishlist.'
        )
      } finally {
        setActionLoading(false)
      }
    }

  const handleReadingStatus =
    async (
      status: ReadingStatus
    ) => {
      if (!user || !book) {
        return
      }

      try {
        setActionLoading(true)
        setError(null)
        setMessage(null)

        await setReadingStatus(
          user.uid,
          book,
          status
        )

        setCurrentReadingStatus(
          status
        )

        if (
          status === 'reading' &&
          inWishlist
        ) {
          await removeFromWishlist(
            user.uid,
            book.id
          )

          setInWishlist(false)
        }

        setMessage(
          status === 'reading'
            ? 'Book marked as Reading.'
            : 'Book marked as Completed.'
        )
      } catch {
        setError(
          'Could not update reading status.'
        )
      } finally {
        setActionLoading(false)
      }
    }

  if (loading) {
    return (
      <>
        <Header />

        <main
          className={
            styles.statusPage
          }
        >
          Loading book...
        </main>
      </>
    )
  }

  if (!book) {
    return (
      <>
        <Header />

        <main
          className={
            styles.statusPage
          }
        >
          Book not found.
        </main>
      </>
    )
  }

  const coverUrl =
    book.coverId
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
      : null

  const borrowedByMe =
    !availability.available &&
    availability.borrowedBy ===
      user?.uid

  return (
    <>
      <Header />

      <main className={styles.page}>
        <Link
          to="/"
          className={styles.back}
        >
          ← Back to catalog
        </Link>

        <section
          className={styles.details}
        >
          <div
            className={
              styles.coverContainer
            }
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`Cover of ${book.title}`}
                loading="lazy"
              />
            ) : (
              <div
                className={
                  styles.noCover
                }
              >
                No cover
              </div>
            )}
          </div>

          <div
            className={
              styles.information
            }
          >
            <h1>{book.title}</h1>

            <p
              className={
                styles.author
              }
            >
              {book.authorName.join(
                ', '
              ) || 'Unknown author'}
            </p>

            {book.subjects.length >
              0 && (
              <div
                className={
                  styles.subjects
                }
              >
                {book.subjects.map(
                  (subject) => (
                    <span
                      key={subject}
                    >
                      {subject}
                    </span>
                  )
                )}
              </div>
            )}

            <div
              className={
                styles.availability
              }
            >
              {availability.available ? (
                <span
                  className={
                    styles.available
                  }
                >
                  Available
                </span>
              ) : (
                <span
                  className={
                    styles.unavailable
                  }
                >
                  Unavailable
                </span>
              )}
            </div>

            {availability.available && (
              <Button
                fullWidth
                onClick={
                  handleBorrow
                }
                disabled={
                  actionLoading
                }
              >
                Borrow book
              </Button>
            )}

            {borrowedByMe && (
              <div
                className={
                  styles.borrowedMessage
                }
              >
                You currently have
                this book on loan.
              </div>
            )}

            {!availability.available &&
              !borrowedByMe && (
                <Button
                  fullWidth
                  onClick={
                    handleReserve
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Reserve book
                </Button>
              )}

            <Button
              variant="secondary"
              fullWidth
              onClick={
                handleWishlist
              }
              disabled={
                actionLoading
              }
            >
              {inWishlist
                ? 'Remove from wishlist'
                : 'Add to wishlist'}
            </Button>

            <section
              className={
                styles.readingStatus
              }
            >
              <h2>
                Reading status
              </h2>

              <div
                className={
                  styles.readingButtons
                }
              >
                <button
                  type="button"
                  className={
                    readingStatus ===
                    'reading'
                      ? styles.readingActive
                      : ''
                  }
                  onClick={() =>
                    handleReadingStatus(
                      'reading'
                    )
                  }
                >
                  Reading
                </button>

                <button
                  type="button"
                  className={
                    readingStatus ===
                    'completed'
                      ? styles.readingActive
                      : ''
                  }
                  onClick={() =>
                    handleReadingStatus(
                      'completed'
                    )
                  }
                >
                  Completed
                </button>
              </div>
            </section>

            {message && (
              <p
                className={
                  styles.success
                }
              >
                {message}
              </p>
            )}

            {error && (
              <p
                className={
                  styles.error
                }
              >
                {error}
              </p>
            )}

            <section
              className={
                styles.description
              }
            >
              <h2>Description</h2>

              <p>
                {book.description}
              </p>
            </section>
          </div>
        </section>
      </main>
    </>
  )
}

export default BookDetailsPage