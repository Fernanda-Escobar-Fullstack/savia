import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import Header from '../../components/Header/Header'

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
  const user = useAppSelector(
    (state) => state.auth.user
  )

  const [
    books,
    setBooks,
  ] = useState<WishlistBook[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const loadWishlist =
    async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)

        const wishlist =
          await getUserWishlist(
            user.uid
          )

        const booksWithAvailability =
          await Promise.all(
            wishlist.map(
              async (item) => {
                const availability =
                  await getBookAvailability(
                    item.bookId
                  )

                return {
                  item,
                  available:
                    availability.available,
                }
              }
            )
          )

        setBooks(
          booksWithAvailability
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadWishlist()
  }, [user])

  const handleRemove =
    async (
      bookId: string
    ) => {
      if (!user) {
        return
      }

      await removeFromWishlist(
        user.uid,
        bookId
      )

      setBooks(
        (currentBooks) =>
          currentBooks.filter(
            ({ item }) =>
              item.bookId !== bookId
          )
      )
    }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header
          className={styles.heading}
        >
          <h1>
            Wishlist
          </h1>

          <p>
            Books you saved for later.
          </p>
        </header>

        {loading && (
          <p
            className={
              styles.message
            }
          >
            Loading wishlist...
          </p>
        )}

        {!loading &&
          books.length === 0 && (
            <div
              className={
                styles.empty
              }
            >
              <h2>
                Your wishlist is empty
              </h2>

              <p>
                Save books you want
                to read later.
              </p>

              <Link to="/">
                Browse books
              </Link>
            </div>
          )}

        {!loading &&
          books.length > 0 && (
            <section
              className={styles.list}
            >
              {books.map(
                ({
                  item,
                  available,
                }) => (
                  <article
                    key={item.id}
                    className={
                      styles.card
                    }
                  >
                    <Link
                      to={`/books/${item.bookId}`}
                      className={
                        styles.bookInfo
                      }
                    >
                      <h2>
                        {item.title}
                      </h2>

                      <p>
                        {item.authorName.join(
                          ', '
                        ) ||
                          'Unknown author'}
                      </p>
                    </Link>

                    <div
                      className={
                        styles.actions
                      }
                    >
                      <span
                        className={
                          available
                            ? styles.available
                            : styles.unavailable
                        }
                      >
                        {available
                          ? 'Available'
                          : 'Unavailable'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            item.bookId
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                )
              )}
            </section>
          )}
      </main>
    </>
  )
}

export default WishlistPage