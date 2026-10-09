import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  message?: string
  description?: string
  fullScreen?: boolean
}

function LoadingScreen({
  message = 'Loading SAVIA...',
  description = 'Please wait a moment.',
  fullScreen = false,
}: LoadingScreenProps) {
  return (
    <div
      className={
        fullScreen
          ? styles.overlay
          : styles.container
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.card}>
        <div
          className={styles.animation}
          aria-hidden="true"
        >
          <div className={styles.spinner}>

            <svg
              className={styles.leaf}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 4c-9 0-15 4-15 12a4 4 0 0 0 4 4c8 0 12-6 11-16Z" />
              <path d="M5 19c3-5 7-8 12-11" />
            </svg>
          </div>
        </div>

        <h2>{message}</h2>
        <p>{description}</p>

        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen