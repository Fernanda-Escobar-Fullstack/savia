import { Link } from 'react-router-dom'

import type { Book } from '../../types/Book'

import styles from './BookCard.module.css'

interface BookCardProps {
  book: Book
}

function BookCard({
  book,
}: BookCardProps) {
  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null

  const bookId = book.key.replace(
    '/works/',
    ''
  )

  const author =
    book.authorName?.join(', ') ||
    'Unknown author'

  return (
    <article className={styles.card}>
      <Link
        className={styles.coverWrapper}
        to={`/books/${bookId}`}
      >
        {coverUrl ? (
          <img
            className={styles.cover}
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
          />
        ) : (
          <div
            className={styles.noCover}
            aria-label={`No cover available for ${book.title}`}
          >
            <span>📖</span>

            <small>
              No cover
            </small>
          </div>
        )}
      </Link>

      <div className={styles.content}>
        <div className={styles.bookInfo}>
          <h3 title={book.title}>
            {book.title}
          </h3>

          <p
            className={styles.author}
            title={author}
          >
            {author}
          </p>

          <p className={styles.year}>
            {book.firstPublishYear
              ? `First published ${book.firstPublishYear}`
              : 'Publication year unavailable'}
          </p>
        </div>

        <Link
          className={styles.detailsLink}
          to={`/books/${bookId}`}
        >
          View details
        </Link>
      </div>
    </article>
  )
}

export default BookCard