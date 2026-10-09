import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import BookCard from '../src/components/BookCard/BookCard'

describe('BookCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('muestra la informacion principal del libro', () => {
    render(
      <MemoryRouter>
        <BookCard
          book={{
            key: '/works/OL1W',
            title: 'Clean Code',
            authorName: ['Robert C. Martin'],
            firstPublishYear: 2008,
            coverId: 123,
          }}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Clean Code')).toBeInTheDocument()
    expect(
      screen.getByText('Robert C. Martin')
    ).toBeInTheDocument()
    expect(
      screen.getByText('First published 2008')
    ).toBeInTheDocument()
  })

  it('crea el enlace correcto para ver los detalles', () => {
    render(
      <MemoryRouter>
        <BookCard
          book={{
            key: '/works/OL25W',
            title: 'Refactoring',
            authorName: ['Martin Fowler'],
          }}
        />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: 'View details' })
    ).toHaveAttribute('href', '/books/OL25W')
  })

  it('muestra valores alternativos cuando faltan datos', () => {
    render(
      <MemoryRouter>
        <BookCard
          book={{
            key: '/works/OL30W',
            title: 'Unknown Book',
            authorName: [],
          }}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Unknown author')).toBeInTheDocument()
    expect(
      screen.getByText('Publication year unavailable')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'No cover available for Unknown Book'
      )
    ).toBeInTheDocument()
  })
})
