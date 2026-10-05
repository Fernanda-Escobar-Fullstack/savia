export interface WishlistItem {
  id: string
  userId: string
  bookId: string

  title: string
  authorName: string[]
  coverId?: number

  createdAt: unknown
}