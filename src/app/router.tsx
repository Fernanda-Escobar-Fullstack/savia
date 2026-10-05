import { createBrowserRouter } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'

import HomePage from '../pages/HomePage/HomePage'
import LoginPage from '../pages/LoginPage/LoginPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import BookDetailsPage from '../pages/BookDetailsPage/BookDetailsPage'
import MyLibraryPage from '../pages/MyLibraryPage/MyLibraryPage'
import WishlistPage from '../pages/WishlistPage/WishlistPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/books/:bookId',
    element: (
      <ProtectedRoute>
        <BookDetailsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/my-library',
    element: (
      <ProtectedRoute>
        <MyLibraryPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/wishlist',
    element: (
      <ProtectedRoute>
        <WishlistPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },

  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
])