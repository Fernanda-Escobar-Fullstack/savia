
import Header from '../../components/Header/Header'
import { useAppSelector } from '../../hooks/reduxHooks'

import styles from './ProfilePage.module.css'

function ProfilePage() {
  const user = useAppSelector(
    (state) => state.auth.user
  )

  if (!user) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <p>Unable to load user profile.</p>
        </main>
      </>
    )
  }

  const avatarLetter =
    user.fullName.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header className={styles.heading}>
          <h1>My Profile</h1>
          <p>View your personal information.</p>
        </header>

        <section className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {avatarLetter}
            </div>

            <div className={styles.profileIdentity}>
              <h2>{user.fullName}</h2>
              <p>@{user.username}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <h3 className={styles.sectionTitle}>
            Personal Information
          </h3>

          <dl className={styles.information}>
            <div className={styles.field}>
              <dt>Full name</dt>
              <dd>{user.fullName}</dd>
            </div>

            <div className={styles.field}>
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>

            <div className={styles.field}>
              <dt>Email address</dt>
              <dd>{user.email}</dd>
            </div>

            <div className={styles.field}>
              <dt>University code</dt>
              <dd>{user.universityCode}</dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  )
}

export default ProfilePage
