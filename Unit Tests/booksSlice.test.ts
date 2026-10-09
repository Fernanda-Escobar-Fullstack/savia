import booksReducer, {
  setBooks,
  setCategory,
  setPage,
  setSearchTerm,
  setSortBy,
} from '../src/features/books/booksSlice'

const books = [
  {
    key: '/works/OL1W',
    title: 'Clean Code',
    authorName: ['Robert C. Martin'],
    firstPublishYear: 2008,
  },
]

describe('booksSlice', () => {
  it('guarda los libros recibidos', () => {
    const state = booksReducer(undefined, setBooks(books))

    expect(state.books).toEqual(books)
  })

  it('guarda la busqueda y vuelve a la pagina uno', () => {
    const pageState = booksReducer(undefined, setPage(4))
    const state = booksReducer(
      pageState,
      setSearchTerm('programming')
    )

    expect(state.searchTerm).toBe('programming')
    expect(state.page).toBe(1)
  })

  it('guarda la categoria y vuelve a la pagina uno', () => {
    const pageState = booksReducer(undefined, setPage(3))
    const state = booksReducer(
      pageState,
      setCategory('science')
    )

    expect(state.category).toBe('science')
    expect(state.page).toBe(1)
  })

  it('cambia el orden del catalogo', () => {
    const state = booksReducer(
      undefined,
      setSortBy('author')
    )

    expect(state.sortBy).toBe('author')
  })
})
