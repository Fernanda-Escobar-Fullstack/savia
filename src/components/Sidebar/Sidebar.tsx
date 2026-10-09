import { memo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import Logo from '../Logo/Logo'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import { logoutUser } from '../../services/authService'

import styles from './Sidebar.module.css'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] =
    useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return

    try {
      setLoggingOut(true)
      await logoutUser()

      onClose()

      navigate('/login')
    } finally {
      setLoggingOut(false)
      setConfirmingLogout(false)
    }
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isOpen ? styles.open : ''
        }`}
      >
        <div className={styles.top}>
          <div className={styles.sidebarHeader}>
            <Logo size={88} />

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav className={styles.navigation}>
            <NavLink
              to="/"
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/my-library"
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              My Library
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Wishlist
            </NavLink>

            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Profile
            </NavLink>

            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>

        <button
          type="button"
          className={styles.logout}
          onClick={() => setConfirmingLogout(true)}
        >
          Logout
        </button>
      </aside>

      {confirmingLogout && (
        <ConfirmationModal
          title="Log out?"
          description="Are you sure you want to log out of SAVIA?"
          confirmLabel="Log out"
          loading={loggingOut}
          onConfirm={() => {
            void handleLogout()
          }}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </>
  )
}

export default memo(Sidebar)
