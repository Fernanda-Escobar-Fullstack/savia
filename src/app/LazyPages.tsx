import { lazy } from 'react'

export const HomePage = lazy(() => import('../pages/HomePage/HomePage'))
export const LoginPage = lazy(() => import('../pages/LoginPage/LoginPage'))
export const RegisterPage = lazy(() => import('../pages/RegisterPage/RegisterPage'))
export const BookDetailsPage = lazy(() => import('../pages/BookDetailsPage/BookDetailsPage'))
export const MyLibraryPage = lazy(() => import('../pages/MyLibraryPage/MyLibraryPage'))
export const WishlistPage = lazy(() => import('../pages/WishlistPage/WishlistPage'))
export const ProfilePage = lazy(() => import('../pages/ProfilePage/ProfilePage'))
export const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'))
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'))
export const NotificationsPage = lazy(() => import('../pages/NotificationsPage/NotificationsPage'))
