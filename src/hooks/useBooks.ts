import { useEffect } from 'react'

import { searchBooks } from '../services/openLibraryService'

import {
  setBooks,
  setBooksError,
  setBooksLoading,
  setTotalResults,
} from '../features/books/booksSlice'

import {
  useAppDispatch,
  useAppSelector,
} from './reduxHooks'

import { useDebounce } from './useDebounce'

export function useBooks() {
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
  } = useAppSelector((state) => state.books)

  const debouncedSearchTerm = useDebounce(
    searchTerm,
    500
  )

  useEffect(() => {
    const loadBooks = async () => {
      try {
        dispatch(setBooksLoading(true))
        dispatch(setBooksError(null))

        const query =
          category === 'all'
            ? debouncedSearchTerm
            : `${debouncedSearchTerm} subject:${category}`

        const result = await searchBooks(
          query || 'programming',
          page
        )

        dispatch(setBooks(result.docs))
        dispatch(setTotalResults(result.numFound))
      } catch (error) {
        dispatch(
          setBooksError(
            error instanceof Error
              ? error.message
              : 'Failed to load books.'
          )
        )
      } finally {
        dispatch(setBooksLoading(false))
      }
    }

    loadBooks()
  }, [
    dispatch,
    debouncedSearchTerm,
    category,
    page,
  ])

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'author') {
      const authorA = a.authorName?.[0] ?? ''
      const authorB = b.authorName?.[0] ?? ''

      return authorA.localeCompare(authorB)
    }

    if (sortBy === 'date') {
      return (
        (b.firstPublishYear ?? 0) -
        (a.firstPublishYear ?? 0)
      )
    }

    if (sortBy === 'popularity') {
      return (
        (b.editionCount ?? 0) -
        (a.editionCount ?? 0)
      )
    }

    return 0
  })

  return {
    books: sortedBooks,
    searchTerm,
    category,
    sortBy,
    page,
    totalResults,
    loading,
    error,
  }
}