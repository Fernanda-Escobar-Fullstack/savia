import Header from '../../components/Header/Header'

import {
  useTheme,
} from '../../hooks/useTheme'

import styles from './SettingsPage.module.css'

function SettingsPage() {
  const {
    theme,
    setTheme,
  } = useTheme()

  return (
    <>
      <Header />

      <main className={styles.page}>
        <header className={styles.heading}>
          <h1>Settings</h1>

          <p>
            Customize the appearance of SAVIA.
          </p>
        </header>

        <section className={styles.section}>
          <h2>Appearance</h2>

          <div className={styles.options}>
            <button
              type="button"
              className={
                theme === 'light'
                  ? styles.selected
                  : styles.option
              }
              onClick={() =>
                setTheme('light')
              }
            >
              <div>
                <strong>
                  Light mode
                </strong>

                <span>
                  Use a bright interface
                </span>
              </div>

              <span
                className={
                  styles.radio
                }
              >
                {theme === 'light'
                  ? '●'
                  : '○'}
              </span>
            </button>

            <button
              type="button"
              className={
                theme === 'dark'
                  ? styles.selected
                  : styles.option
              }
              onClick={() =>
                setTheme('dark')
              }
            >
              <div>
                <strong>
                  Dark mode
                </strong>

                <span>
                  Use a darker interface
                </span>
              </div>

              <span
                className={
                  styles.radio
                }
              >
                {theme === 'dark'
                  ? '●'
                  : '○'}
              </span>
            </button>
          </div>
        </section>
      </main>
    </>
  )
}

export default SettingsPage