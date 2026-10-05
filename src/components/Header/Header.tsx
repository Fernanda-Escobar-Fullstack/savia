import { useState } from 'react'

import Logo from '../Logo/Logo'
import Sidebar from '../Sidebar/Sidebar'

import styles from './Header.module.css'

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false)

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={openSidebar}
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div className={styles.logo}>
          <Logo size={72} />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Notifications"
          >
            ♡
          </button>

          <button
            type="button"
            className={styles.avatar}
            aria-label="User profile"
          >
            U
          </button>
        </div>
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
    </>
  )
}

export default Header