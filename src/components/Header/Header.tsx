import { memo, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from '../Logo/Logo'
import Sidebar from '../Sidebar/Sidebar'

import { useAppSelector } from '../../hooks/reduxHooks'

import {
  subscribeToNotifications,
} from '../../services/notificationService'

import styles from './Header.module.css'

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false)

  const userId = useAppSelector(
    (state) => state.auth.user?.uid
  )

  const fullName = useAppSelector(
    (state) => state.auth.user?.fullName
  )

  const [notificationState, setNotificationState] =
    useState({
      userId: '',
      hasUnread: false,
    })

  useEffect(() => {
    if (!userId) return

    const unsubscribe = subscribeToNotifications(
      userId,
      (notifications) => {
        const hasUnread = notifications.some(
          (notification) => !notification.read
        )

        setNotificationState({
          userId,
          hasUnread,
        })
      }
    )

    return () => {
      unsubscribe()
    }
  }, [userId])

  const hasUnread =
    notificationState.userId === userId &&
    notificationState.hasUnread

  const avatarLetter =
    fullName?.charAt(0).toUpperCase() || 'U'

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.leftSection}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={openSidebar}
              aria-label="Open navigation menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <Link
            to="/"
            className={styles.logo}
            aria-label="Go to home"
          >
            <Logo size={72} />
          </Link>

          <div className={styles.actions}>
            <Link
              to="/wishlist"
              className={styles.iconButton}
              aria-label="Go to wishlist"
              title="Wishlist"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </Link>

            <Link
              to="/notifications"
              className={`${styles.iconButton} ${styles.notificationButton}`}
              aria-label={
                hasUnread
                  ? 'Notifications: unread notifications'
                  : 'Go to notifications'
              }
              title="Notifications"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>

              {hasUnread && (
                <span
                  className={styles.notificationDot}
                  aria-hidden="true"
                />
              )}
            </Link>

            <Link
              to="/profile"
              className={styles.avatar}
              aria-label="Go to my profile"
              title="My Profile"
            >
              {avatarLetter}
            </Link>
          </div>
        </div>
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
    </>
  )
}

export default memo(Header)
