import { useEffect, useMemo } from 'react'
import axios from 'axios'

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

  const books = useAppSelector((state) => state.books.books)
  const searchTerm = useAppSelector((state) => state.books.searchTerm)
  const category = useAppSelector((state) => state.books.category)
  const sortBy = useAppSelector((state) => state.books.sortBy)
  const page = useAppSelector((state) => state.books.page)
  const totalResults = useAppSelector((state) => state.books.totalResults)
  const loading = useAppSelector((state) => state.books.loading)
  const error = useAppSelector((state) => state.books.error)

  const debouncedSearchTerm = useDebounce(
    searchTerm,
    500
  )

  useEffect(() => {
    const controller = new AbortController()
    let active = true

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
          page,
          controller.signal
        )

        if (!active) return

        dispatch(setBooks(result.docs))
        dispatch(setTotalResults(result.numFound))
      } catch (error) {
        if (!active || axios.isCancel(error)) return

        dispatch(
          setBooksError(
            error instanceof Error
              ? error.message
              : 'Failed to load books.'
          )
        )
      } finally {
        if (active) {
          dispatch(setBooksLoading(false))
        }
      }
    }

    void loadBooks()

    return () => {
      active = false
      controller.abort()
      dispatch(setBooksLoading(false))
    }
  }, [
    dispatch,
    debouncedSearchTerm,
    category,
    page,
  ])

  const sortedBooks = useMemo(() => [...books].sort((a, b) => {
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
  }), [books, sortBy])

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
