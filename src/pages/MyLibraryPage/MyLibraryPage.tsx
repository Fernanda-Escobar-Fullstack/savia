import {
  useEffect,
  useState,
} from 'react'

import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'

import {
  getUserLoans,
  getUserReservations,
  returnBook,
} from '../../services/libraryService'

import {
  useAppSelector,
} from '../../hooks/reduxHooks'

import type {
  Loan,
} from '../../types/Loan'

import type {
  Reservation,
} from '../../types/Reservation'

import styles from './MyLibraryPage.module.css'

type LibraryTab =
  | 'active'
  | 'reservations'
  | 'history'

function MyLibraryPage() {
  const user = useAppSelector(
    (state) => state.auth.user
  )

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<LibraryTab>(
      'active'
    )

  const [
    loans,
    setLoans,
  ] = useState<Loan[]>([])

  const [
    reservations,
    setReservations,
  ] =
    useState<Reservation[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const loadLibrary =
    async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)

        const [
          loanResults,
          reservationResults,
        ] =
          await Promise.all([
            getUserLoans(
              user.uid
            ),

            getUserReservations(
              user.uid
            ),
          ])

        setLoans(
          loanResults
        )

        setReservations(
          reservationResults
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadLibrary()
  }, [user])

  const handleReturn =
    async (
      loan: Loan
    ) => {
      await returnBook(
        loan
      )

      await loadLibrary()
    }

  const activeLoans =
    loans.filter(
      (loan) =>
        loan.status ===
        'active'
    )

  const history =
    loans.filter(
      (loan) =>
        loan.status ===
        'returned'
    )

  const activeReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
        'active'
    )

  const formatDate = (
    timestamp: Loan['borrowedAt']
  ) =>
    timestamp
      .toDate()
      .toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }
      )

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header
          className={styles.heading}
        >
          <h1>My Library</h1>

          <p>
            Track loans, reservations,
            and your borrowing history.
          </p>
        </header>

        <div className={styles.tabs}>
          <button
            type="button"
            className={
              activeTab === 'active'
                ? styles.activeTab
                : ''
            }
            onClick={() =>
              setActiveTab('active')
            }
          >
            Active Loans
          </button>

          <button
            type="button"
            className={
              activeTab ===
              'reservations'
                ? styles.activeTab
                : ''
            }
            onClick={() =>
              setActiveTab(
                'reservations'
              )
            }
          >
            Reservations
          </button>

          <button
            type="button"
            className={
              activeTab === 'history'
                ? styles.activeTab
                : ''
            }
            onClick={() =>
              setActiveTab('history')
            }
          >
            Loan History
          </button>
        </div>

        {loading && (
          <p
            className={styles.empty}
          >
            Loading library...
          </p>
        )}

        {!loading &&
          activeTab ===
            'active' && (
            <section
              className={styles.list}
            >
              {activeLoans.length ===
              0 ? (
                <p
                  className={
                    styles.empty
                  }
                >
                  You don't have any
                  active loans.
                </p>
              ) : (
                activeLoans.map(
                  (loan) => (
                    <article
                      key={loan.id}
                      className={
                        styles.card
                      }
                    >
                      <h2>
                        {loan.title}
                      </h2>

                      <div
                        className={
                          styles.dateBox
                        }
                      >
                        <span>
                          Borrow date
                        </span>

                        <strong>
                          {formatDate(
                            loan.borrowedAt
                          )}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.due
                        }
                      >
                        Due date:{' '}
                        {formatDate(
                          loan.dueDate
                        )}
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleReturn(
                            loan
                          )
                        }
                      >
                        Return book
                      </Button>
                    </article>
                  )
                )
              )}
            </section>
          )}

        {!loading &&
          activeTab ===
            'reservations' && (
            <section
              className={styles.list}
            >
              {activeReservations.length ===
              0 ? (
                <p
                  className={
                    styles.empty
                  }
                >
                  You don't have active
                  reservations.
                </p>
              ) : (
                activeReservations.map(
                  (
                    reservation
                  ) => (
                    <article
                      key={
                        reservation.id
                      }
                      className={
                        styles.card
                      }
                    >
                      <h2>
                        {
                          reservation.title
                        }
                      </h2>

                      <p
                        className={
                          styles.reservationStatus
                        }
                      >
                        Reservation active
                      </p>
                    </article>
                  )
                )
              )}
            </section>
          )}

        {!loading &&
          activeTab ===
            'history' && (
            <section
              className={styles.list}
            >
              {history.length ===
              0 ? (
                <p
                  className={
                    styles.empty
                  }
                >
                  No loan history yet.
                </p>
              ) : (
                history.map(
                  (loan) => (
                    <article
                      key={loan.id}
                      className={
                        styles.card
                      }
                    >
                      <h2>
                        {loan.title}
                      </h2>

                      <p>
                        Borrow date:{' '}
                        {formatDate(
                          loan.borrowedAt
                        )}
                      </p>

                      <p>
                        Return date:{' '}
                        {loan.returnedAt
                          ? formatDate(
                              loan.returnedAt
                            )
                          : '-'}
                      </p>
                    </article>
                  )
                )
              )}
            </section>
          )}
      </main>
    </>
  )
}

export default MyLibraryPage