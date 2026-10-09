import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Header from '../../components/Header/Header'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import { useAppSelector } from '../../hooks/reduxHooks'

import {
  markNotificationAsRead,
  subscribeToNotifications,
  type LibraryNotification,
} from '../../services/notificationService'

import styles from './NotificationsPage.module.css'

type NotificationTab = 'unread' | 'history'

function formatRelativeTime(
  timestamp: LibraryNotification['createdAt']
) {
  if (!timestamp) return 'Recently'

  const difference = Math.max(
    0,
    Date.now() - timestamp.toMillis()
  )

  const minutes = Math.floor(difference / 60000)
  const hours = Math.floor(difference / 3600000)
  const days = Math.floor(difference / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (days === 1) return 'Yesterday'

  if (days < 7) return `${days} days ago`

  return timestamp.toDate().toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  )
}

function NotificationsPage() {
  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  const [notifications, setNotifications] =
    useState<LibraryNotification[]>([])

  const [loadedUserId, setLoadedUserId] =
    useState<string | null>(null)

  const [activeTab, setActiveTab] =
    useState<NotificationTab>('unread')

  const [updatingId, setUpdatingId] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    let active = true

    const unsubscribe = subscribeToNotifications(
      userId,
      (results) => {
        if (!active) return

        setNotifications(results)
        setLoadedUserId(userId)
      }
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [userId])

  const isLoading =
    !userId || loadedUserId !== userId

  const unreadCount = useMemo(() => isLoading
    ? 0
    : notifications.filter(
        (notification) => !notification.read
      ).length, [isLoading, notifications])

  const visibleNotifications = useMemo(() => isLoading
    ? []
    : notifications.filter((notification) =>
        activeTab === 'unread'
          ? !notification.read
          : notification.read
      ), [activeTab, isLoading, notifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      setUpdatingId(id)
      setError(null)

      await markNotificationAsRead(id)
    } catch {
      setError('Could not update notification.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header className={styles.heading}>
          <div className={styles.headingIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </div>
          <div>
            <h1>Notifications</h1>
            <p>Stay up to date with your loans and reservations.</p>
          </div>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={
              activeTab === 'unread'
                ? styles.activeTab
                : ''
            }
            onClick={() => setActiveTab('unread')}
          >
            Unread
            <span className={styles.count}>{unreadCount}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === 'history'
                ? styles.activeTab
                : ''
            }
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <LoadingScreen
            message="Loading notifications"
            description="Checking for library updates..."
          />
        ) : visibleNotifications.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">✓</span>
            <h2>
              {activeTab === 'unread'
                ? "You're all caught up"
                : 'No notification history'}
            </h2>
            <p>
              {activeTab === 'unread'
                ? 'New library updates will appear here.'
                : 'Read notifications will appear here.'}
            </p>
          </div>
        ) : (
          <section className={styles.list}>
            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`${styles.card} ${!notification.read ? styles.unreadCard : ''}`}
              >
                <div className={styles.cardIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                </div>
                <Link
                  to={`/books/${notification.bookId}?from=notification`}
                  className={styles.notificationLink}
                >
                  <div className={styles.cardHeader}>
                    <h2>{notification.title}</h2>
                    <span className={styles.tag}>
                      {notification.read ? 'Read' : 'New'}
                    </span>
                  </div>

                  <p>{notification.message}</p>

                  <span className={styles.timestamp}>
                    {formatRelativeTime(
                      notification.createdAt
                    )}
                  </span>
                </Link>

                {!notification.read && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => {
                        void handleMarkAsRead(
                          notification.id
                        )
                      }}
                    >
                      {updatingId === notification.id
                        ? 'Updating...'
                        : 'Mark as read'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  )
}

export default NotificationsPage
