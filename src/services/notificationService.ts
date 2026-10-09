import {
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

export interface LibraryNotification {
  id: string
  userId: string
  bookId: string
  title: string
  message: string
  type: 'book_available'
  read: boolean
  createdAt: Timestamp | null
}

interface NotificationSubscription {
  listeners: Set<(notifications: LibraryNotification[]) => void>
  latest: LibraryNotification[] | null
  unsubscribe: () => void
}

const notificationSubscriptions = new Map<
  string,
  NotificationSubscription
>()

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: LibraryNotification[]) => void
) {
  const existingSubscription = notificationSubscriptions.get(userId)

  if (existingSubscription) {
    existingSubscription.listeners.add(callback)

    if (existingSubscription.latest) {
      callback(existingSubscription.latest)
    }

    return () => {
      existingSubscription.listeners.delete(callback)

      if (existingSubscription.listeners.size === 0) {
        existingSubscription.unsubscribe()
        notificationSubscriptions.delete(userId)
      }
    }
  }

  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  )

  const listeners = new Set([callback])
  const subscription: NotificationSubscription = {
    listeners,
    latest: null,
    unsubscribe: () => undefined,
  }

  const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map(
      (document) => ({
        ...document.data(),
        id: document.id,
      })
    ) as LibraryNotification[]

    notifications.sort(
      (a, b) =>
        (b.createdAt?.toMillis() ?? 0) -
        (a.createdAt?.toMillis() ?? 0)
    )

    subscription.latest = notifications
    subscription.listeners.forEach((listener) => {
      listener(notifications)
    })
  })

  subscription.unsubscribe = unsubscribe
  notificationSubscriptions.set(userId, subscription)

  return () => {
    subscription.listeners.delete(callback)

    if (subscription.listeners.size === 0) {
      subscription.unsubscribe()
      notificationSubscriptions.delete(userId)
    }
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await updateDoc(
    doc(db, 'notifications', notificationId),
    {
      read: true,
    }
  )
}
