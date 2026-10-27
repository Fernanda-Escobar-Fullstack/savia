import type { BookDetails } from '../../../src/types/BookDetails'
import type { WishlistItem } from '../../../src/types/WishlistItem'
import { demoUserId } from './state'

const wishlist = new Map<string, WishlistItem>()

export async function addToWishlist(_userId: string, book: BookDetails) {
  wishlist.set(book.id, {
    id: `demo-wishlist-${book.id}`,
    userId: demoUserId,
    bookId: book.id,
    title: book.title,
    authorName: book.authorName,
    coverId: book.coverId,
    createdAt: new Date(),
  })
}

export async function removeFromWishlist(_userId: string, bookId: string) {
  wishlist.delete(bookId)
}

export async function isBookInWishlist(_userId: string, bookId: string) {
  return wishlist.has(bookId)
}

export async function getUserWishlist() {
  return [...wishlist.values()]
}
