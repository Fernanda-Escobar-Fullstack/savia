import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import Header from '../../components/Header/Header'
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'

import {
  getUserWishlist,
  removeFromWishlist,
} from '../../services/wishlistService'

import {
  getBookAvailability,
} from '../../services/libraryService'

import {
  useAppSelector,
} from '../../hooks/reduxHooks'

import type {
  WishlistItem,
} from '../../types/WishlistItem'

import styles from './WishlistPage.module.css'

interface WishlistBook {
  item: WishlistItem
  available: boolean
}

function WishlistPage() {
  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  const [
    books,
    setBooks,
  ] = useState<WishlistBook[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [pendingRemoval, setPendingRemoval] =
    useState<WishlistItem | null>(null)

  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const loadWishlist = useCallback(async () => {
    if (!userId) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setLoadFailed(false)

      const wishlist = await getUserWishlist(userId)

      const booksWithAvailability = await Promise.all(
        wishlist.map(async (item) => {
          const availability = await getBookAvailability(
            item.bookId
          )

          return {
            item,
            available: availability.available,
          }
        })
      )

      setBooks(booksWithAvailability)
    } catch {
      setError('Could not load your wishlist. Please try again.')
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void Promise.resolve().then(loadWishlist)
  }, [loadWishlist])

  const handleRemove = async (bookId: string) => {
    if (!userId) {
      return
    }

    try {
      setRemoving(true)
      setError(null)

      await removeFromWishlist(userId, bookId)

      setBooks((currentBooks) =>
        currentBooks.filter(
          ({ item }) => item.bookId !== bookId
        )
      )

      setPendingRemoval(null)
    } catch {
      setPendingRemoval(null)
      setError('Could not remove this book from your wishlist.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header className={styles.heading}>
          <h1>Wishlist</h1>

          <p>Books you saved for later.</p>
        </header>

        {loading && (
          <LoadingScreen
            message="Loading your wishlist"
            description="Getting your saved books ready..."
          />
        )}

        {!loading && error && (
          <div className={styles.error} role="alert">
            <p>{error}</p>

            {loadFailed && (
              <button
                type="button"
                onClick={() => {
                  void loadWishlist()
                }}
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!loading &&
          !loadFailed &&
          books.length === 0 && (
            <div className={styles.empty}>
              <h2>Your wishlist is empty</h2>

              <p>Save books you want to read later.</p>

              <Link to="/">Browse books</Link>
            </div>
          )}

        {!loading &&
          !loadFailed &&
          books.length > 0 && (
            <section className={styles.list}>
              {books.map(({ item, available }) => (
                <article
                  key={item.id}
                  className={styles.card}
                >
                  <Link
                    to={`/books/${item.bookId}`}
                    className={styles.bookInfo}
                  >
                    <h2>{item.title}</h2>

                    <p>
                      {item.authorName.join(', ') ||
                        'Unknown author'}
                    </p>
                  </Link>

                  <div className={styles.actions}>
                    <span
                      className={
                        available
                          ? styles.available
                          : styles.unavailable
                      }
                    >
                      {available ? 'Available' : 'Unavailable'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPendingRemoval(item)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
      </main>

      {pendingRemoval && (
        <ConfirmationModal
          title="Remove from wishlist?"
          description={`Are you sure you want to remove ${pendingRemoval.title} from your wishlist?`}
          confirmLabel="Remove"
          loading={removing}
          onConfirm={() => {
            void handleRemove(pendingRemoval.bookId)
          }}
          onCancel={() => setPendingRemoval(null)}
        />
      )}
    </>
  )
}

export default WishlistPage

