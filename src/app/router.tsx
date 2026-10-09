import { Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import LoadingScreen from '../components/LoadingScreen/LoadingScreen'

import {
  BookDetailsPage,
  HomePage,
  LoginPage,
  MyLibraryPage,
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  RegisterPage,
  SettingsPage,
  WishlistPage,
} from './LazyPages'

const routeFallback = (
  <LoadingScreen
    fullScreen
    message="Loading SAVIA"
    description="Preparing your library..."
  />
)

function lazyRoute(element: ReactNode) {
  return <Suspense fallback={routeFallback}>{element}</Suspense>
}

function protectedLazyRoute(element: ReactNode) {
  return (
    <ProtectedRoute>
      {lazyRoute(element)}
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: lazyRoute(<LoginPage />),
  },
  {
    path: '/register',
    element: lazyRoute(<RegisterPage />),
  },

  {
    path: '/',
    element: protectedLazyRoute(<HomePage />),
  },

  {
    path: '/books/:bookId',
    element: protectedLazyRoute(<BookDetailsPage />),
  },

  {
    path: '/my-library',
    element: protectedLazyRoute(<MyLibraryPage />),
  },

  {
    path: '/wishlist',
    element: protectedLazyRoute(<WishlistPage />),
  },

  {
    path: '/profile',
    element: protectedLazyRoute(<ProfilePage />),
  },

  {
    path: '/settings',
    element: protectedLazyRoute(<SettingsPage />),
  },

  {
    path: '/notifications',
    element: protectedLazyRoute(<NotificationsPage />),
  },

  {
    path: '*',
    element: lazyRoute(<NotFoundPage />),
  },
])
