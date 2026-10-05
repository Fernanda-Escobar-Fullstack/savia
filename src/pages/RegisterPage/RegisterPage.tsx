import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { registerUser } from '../../services/authService'

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

import styles from './RegisterPage.module.css'

function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const loading = useAppSelector(
    (state) => state.auth.loading
  )

  const error = useAppSelector(
    (state) => state.auth.error
  )

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [universityCode, setUniversityCode] =
    useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      dispatch(
        setAuthError('Passwords do not match.')
      )
      return
    }

    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))

      const user = await registerUser({
        fullName,
        username,
        email,
        universityCode,
        password,
      })

      dispatch(setUser(user))

      navigate('/')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed.'

      dispatch(setAuthError(message))
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.logoWrapper}>
          <Logo size={110} />
        </div>

        <div className={styles.heading}>
          <h1>Create your account</h1>

          <p>
            Join SAVIA and access your university
            library
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Full name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            required
          />

          <TextField
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            required
          />

          <TextField
            label="Email"
            type="email"
            placeholder="Enter your university email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <TextField
            label="University code"
            type="text"
            placeholder="Example: UMH001"
            value={universityCode}
            onChange={(event) =>
              setUniversityCode(
                event.target.value.toUpperCase()
              )
            }
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            minLength={6}
            required
          />

          <TextField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            minLength={6}
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
              ? 'Creating account...'
              : 'Create account'}
          </Button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage