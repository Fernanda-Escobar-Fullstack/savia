// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { configureStore } from '@reduxjs/toolkit'
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import authReducer from '../src/features/auth/authSlice'
import booksReducer from '../src/features/books/booksSlice'
import HomePage from '../src/pages/HomePage/HomePage'

vi.mock('../src/components/Header/Header', () => ({
  default: () => <header>SAVIA Header</header>,
}))

vi.mock('../src/hooks/useBooks', () => ({
  useBooks: () => ({
    books: [
      {
        key: '/works/OL1W',
        title: 'Clean Code',
        authorName: ['Robert C. Martin'],
        firstPublishYear: 2008,
        editionCount: 25,
      },
      {
        key: '/works/OL2W',
        title: 'The Pragmatic Programmer',
        authorName: ['Andrew Hunt'],
        firstPublishYear: 1999,
        editionCount: 18,
      },
    ],
    searchTerm: '',
    category: 'all',
    sortBy: 'popularity',
    page: 1,
    totalResults: 2,
    loading: false,
    error: null,
  }),
}))

function renderHomePage() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      books: booksReducer,
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>
  )

  return store
}

describe('HomePage integration', () => {
  afterEach(() => {
    cleanup()
  })

  it('muestra los libros recibidos por el catalogo', () => {
    renderHomePage()

    expect(screen.getByText('Clean Code')).toBeInTheDocument()
    expect(
      screen.getByText('The Pragmatic Programmer')
    ).toBeInTheDocument()
  })

  it('guarda la busqueda escrita en Redux', () => {
    const store = renderHomePage()

    fireEvent.change(
      screen.getByPlaceholderText(
        'Search title, author or keyword...'
      ),
      { target: { value: 'harry potter' } }
    )

    expect(store.getState().books.searchTerm).toBe(
      'harry potter'
    )
  })

  it('guarda la categoria seleccionada en Redux', () => {
    const store = renderHomePage()

    fireEvent.change(
      screen.getByRole('combobox', { name: 'Category' }),
      { target: { value: 'science' } }
    )

    expect(store.getState().books.category).toBe('science')
  })
})
