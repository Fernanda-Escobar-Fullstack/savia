import { Link } from 'react-router-dom'
import Header from '../../components/Header/Header'
import styles from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.card}>
          <span className={styles.code}>404</span>

          <h1>Page not found</h1>

          <p>
            Oops! The page you're looking for
            doesn't exist or has been moved.
          </p>

          <Link to="/" className={styles.homeButton}>
            Back to Home
          </Link>
        </section>
      </main>
    </>
  )
}

export default NotFoundPage