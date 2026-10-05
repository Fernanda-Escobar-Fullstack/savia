import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { loginUser } from '../../services/authService'
import {
  setAuthError,
  setAuthLoading,
  setUser,
} from '../../features/auth/authSlice'
import {
  useAppDispatch,
  useAppSelector,
} from '../../hooks/reduxHooks'

import Logo from '../../components/Logo/Logo'
import Button from '../../components/Button/Button'
import TextField from '../../components/TextField/TextField'

import styles from './LoginPage.module.css'

function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const loading = useAppSelector(
    (state) => state.auth.loading
  )

  const error = useAppSelector(
    (state) => state.auth.error
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))

      const user = await loginUser(
        email,
        password
      )

      dispatch(setUser(user))

      navigate('/')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed.'

      dispatch(setAuthError(message))
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.logoWrapper}>
          <Logo size={120} />
        </div>

        <div className={styles.heading}>
          <h1>Welcome back</h1>
          <p>
            Sign in to continue to your university library
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </Button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage