import axios from 'axios'

import type { Book } from '../types/Book'
import type { BookDetails } from '../types/BookDetails'

const openLibraryApi = axios.create({
  baseURL: 'https://openlibrary.org',
})

interface OpenLibraryDocument {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  edition_count?: number
  subject?: string[]
}

interface OpenLibraryApiResponse {
  docs: OpenLibraryDocument[]
  numFound: number
}

interface OpenLibraryResponse {
  docs: Book[]
  numFound: number
}

interface OpenLibraryWorkResponse {
  key: string
  title: string

  description?:
    | string
    | {
        value?: string
      }

  covers?: number[]
  subjects?: string[]

  authors?: {
    author: {
      key: string
    }
  }[]
}

interface OpenLibraryAuthorResponse {
  name?: string
}

export async function searchBooks(
  query: string,
  page: number = 1,
  signal?: AbortSignal
): Promise<OpenLibraryResponse> {
  const response =
    await openLibraryApi.get<OpenLibraryApiResponse>(
      '/search.json',
      {
        signal,
        params: {
          q: query,
          page,
          limit: 20,
        },
      }
    )

  const books: Book[] =
    response.data.docs.map((book) => ({
      key: book.key,
      title: book.title,
      authorName:
        book.author_name ?? [],
      firstPublishYear:
        book.first_publish_year,
      coverId:
        book.cover_i,
      editionCount:
        book.edition_count,
      subject:
        book.subject ?? [],
    }))

  return {
    docs: books,
    numFound: response.data.numFound,
  }
}

export async function getBookDetails(
  bookId: string
): Promise<BookDetails> {
  const response =
    await openLibraryApi.get<OpenLibraryWorkResponse>(
      `/works/${bookId}.json`
    )

  const work = response.data

  const authorRequests =
    work.authors?.map(async (authorReference) => {
      try {
        const authorResponse =
          await openLibraryApi.get<OpenLibraryAuthorResponse>(
            `${authorReference.author.key}.json`
          )

        return (
          authorResponse.data.name ??
          'Unknown author'
        )
      } catch {
        return 'Unknown author'
      }
    }) ?? []

  const authorName =
    await Promise.all(authorRequests)

  let description =
    'No description available.'

  if (typeof work.description === 'string') {
    description = work.description
  }

  if (
    typeof work.description === 'object' &&
    work.description?.value
  ) {
    description = work.description.value
  }

  return {
    id: bookId,
    title: work.title,
    authorName,
    description,
    subjects: work.subjects?.slice(0, 5) ?? [],
    coverId: work.covers?.[0],
  }
}
