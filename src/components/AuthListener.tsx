import { useEffect, type ReactNode } from 'react'

import { subscribeToAuthState } from '../services/authService'
import {
  setAuthError,
  setAuthLoading,
  setUser,
} from '../features/auth/authSlice'
import { useAppDispatch } from '../hooks/reduxHooks'

interface AuthListenerProps {
  children: ReactNode
}

function AuthListener({
  children,
}: AuthListenerProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setAuthLoading(true))

    const unsubscribe = subscribeToAuthState(
      (user) => {
        dispatch(setUser(user))
      },
      (message) => {
        dispatch(setAuthError(message))
      }
    )

    return () => {
      unsubscribe()
    }
  }, [dispatch])

  return children
}

export default AuthListener

