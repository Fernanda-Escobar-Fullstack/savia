import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAppSelector } from '../hooks/reduxHooks'
import LoadingScreen from './LoadingScreen/LoadingScreen'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const user = useAppSelector(
    (state) => state.auth.user
  )

  const loading = useAppSelector(
    (state) => state.auth.loading
  )

  if (loading) {
    return (
      <LoadingScreen
        fullScreen
        message="Loading SAVIA"
        description="Preparing your library..."
      />
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
