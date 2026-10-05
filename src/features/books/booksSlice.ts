import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Book } from '../../types/Book'

interface BooksState {
  books: Book[]
  searchTerm: string
  category: string
  sortBy: string
  page: number
  totalResults: number
  loading: boolean
  error: string | null
}

const initialState: BooksState = {
  books: [],
  searchTerm: '',
  category: 'all',
  sortBy: 'popularity',
  page: 1,
  totalResults: 0,
  loading: false,
  error: null,
}

const booksSlice = createSlice({
  name: 'books',

  initialState,

  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.books = action.payload
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      state.page = 1
    },

    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload
      state.page = 1
    },

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },

    setTotalResults: (state, action: PayloadAction<number>) => {
      state.totalResults = action.payload
    },

    setBooksLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setBooksError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload
    },
  },
})

export const {
  setBooks,
  setSearchTerm,
  setCategory,
  setSortBy,
  setPage,
  setTotalResults,
  setBooksLoading,
  setBooksError,
} = booksSlice.actions

export default booksSlice.reducer