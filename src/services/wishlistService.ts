import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

import type { BookDetails } from '../types/BookDetails'
import type { WishlistItem } from '../types/WishlistItem'

export async function addToWishlist(
  userId: string,
  book: BookDetails
) {
  const wishlistId = `${userId}_${book.id}`

  const wishlistReference = doc(
    db,
    'wishlist',
    wishlistId
  )

  await setDoc(wishlistReference, {
    userId,
    bookId: book.id,

    title: book.title,
    authorName: book.authorName,
    coverId: book.coverId ?? null,

    createdAt: serverTimestamp(),
  })
}

export async function removeFromWishlist(
  userId: string,
  bookId: string
) {
  const wishlistId = `${userId}_${bookId}`

  await deleteDoc(
    doc(
      db,
      'wishlist',
      wishlistId
    )
  )
}

export async function isBookInWishlist(
  userId: string,
  bookId: string
): Promise<boolean> {
  const wishlistId = `${userId}_${bookId}`

  const snapshot = await getDoc(
    doc(
      db,
      'wishlist',
      wishlistId
    )
  )

  return snapshot.exists()
}

export async function getUserWishlist(
  userId: string
): Promise<WishlistItem[]> {
  const wishlistQuery = query(
    collection(db, 'wishlist'),
    where('userId', '==', userId)
  )

  const snapshot =
    await getDocs(wishlistQuery)

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  ) as WishlistItem[]
}