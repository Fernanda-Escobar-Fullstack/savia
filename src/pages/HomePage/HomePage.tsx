import Header from '../../components/Header/Header'
import BookCard from '../../components/BookCard/BookCard'

import {
  setCategory,
  setPage,
  setSearchTerm,
  setSortBy,
} from '../../features/books/booksSlice'

import { useAppDispatch } from '../../hooks/reduxHooks'
import { useBooks } from '../../hooks/useBooks'

import styles from './HomePage.module.css'

function HomePage() {
  const dispatch = useAppDispatch()

  const {
    books,
    searchTerm,
    category,
    sortBy,
    page,
    totalResults,
    loading,
    error,
  } = useBooks()

  const totalPages = Math.max(
    1,
    Math.ceil(totalResults / 20)
  )

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>
              UNIVERSITY LIBRARY
            </p>

            <h1>Discover your next book</h1>

            <p className={styles.description}>
              Search, explore and find books from the
              university catalog.
            </p>
          </div>
        </section>

        <section className={styles.controls}>
          <div className={styles.searchWrapper}>
            <span
              className={styles.searchIcon}
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search title, author or keyword..."
              value={searchTerm}
              onChange={(event) =>
                dispatch(
                  setSearchTerm(event.target.value)
                )
              }
            />
          </div>

          <div className={styles.selectRow}>
            <label className={styles.selectGroup}>
              <span>Category</span>

              <select
                value={category}
                onChange={(event) =>
                  dispatch(
                    setCategory(event.target.value)
                  )
                }
              >
                <option value="all">
                  All categories
                </option>

                <option value="science">
                  Science
                </option>

                <option value="technology">
                  Technology
                </option>

                <option value="history">
                  History
                </option>

                <option value="fiction">
                  Fiction
                </option>

                <option value="mathematics">
                  Mathematics
                </option>

                <option value="computer science">
                  Computer Science
                </option>
              </select>
            </label>

            <label className={styles.selectGroup}>
              <span>Sort by</span>

              <select
                value={sortBy}
                onChange={(event) =>
                  dispatch(
                    setSortBy(event.target.value)
                  )
                }
              >
                <option value="popularity">
                  Popularity
                </option>

                <option value="author">
                  Author
                </option>

                <option value="date">
                  Publication date
                </option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.catalog}>
          <div className={styles.catalogHeader}>
            <div>
              <h2>Books</h2>

              {!loading && !error && (
                <p>
                  {totalResults.toLocaleString()} results
                </p>
              )}
            </div>
          </div>

          {loading && (
            <div className={styles.status}>
              <div className={styles.loader} />

              <p>Loading books...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <strong>
                We couldn't load the books.
              </strong>

              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            books.length === 0 && (
              <div className={styles.empty}>
                <span>📚</span>

                <h3>No books found</h3>

                <p>
                  Try another title, author or category.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            books.length > 0 && (
              <>
                <div className={styles.bookGrid}>
                  {books.map((book) => (
                    <BookCard
                      key={book.key}
                      book={book}
                    />
                  ))}
                </div>

                <nav
                  className={styles.pagination}
                  aria-label="Book results pagination"
                >
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      dispatch(
                        setPage(page - 1)
                      )
                    }
                  >
                    ←
                    <span>Previous</span>
                  </button>

                  <p>
                    Page <strong>{page}</strong> of{' '}
                    {totalPages}
                  </p>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages
                    }
                    onClick={() =>
                      dispatch(
                        setPage(page + 1)
                      )
                    }
                  >
                    <span>Next</span>
                    →
                  </button>
                </nav>
              </>
            )}
        </section>
      </main>
    </>
  )
}

export default HomePage