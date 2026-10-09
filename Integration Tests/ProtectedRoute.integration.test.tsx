// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { configureStore } from '@reduxjs/toolkit'
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'
import { Provider } from 'react-redux'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import ProtectedRoute from '../src/components/ProtectedRoute'
import authReducer from '../src/features/auth/authSlice'
import booksReducer from '../src/features/books/booksSlice'
import type { UserProfile } from '../src/types/UserProfile'

const user: UserProfile = {
  uid: 'user-1',
  fullName: 'Ana Perez',
  username: 'ana',
  email: 'ana@university.edu',
  universityCode: 'UNI001',
}

function renderProtectedRoute(
  currentUser: UserProfile | null,
  loading = false
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      books: booksReducer,
    },
    preloadedState: {
      auth: {
        user: currentUser,
        loading,
        error: null,
      },
      books: booksReducer(undefined, { type: '@@INIT' }),
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <h1>Private library</h1>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<h1>Login screen</h1>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ProtectedRoute integration', () => {
  afterEach(() => {
    cleanup()
  })

  it('envia al login cuando no existe un usuario', () => {
    renderProtectedRoute(null)

    expect(
      screen.getByRole('heading', { name: 'Login screen' })
    ).toBeInTheDocument()
  })

  it('muestra la pagina privada cuando existe un usuario', () => {
    renderProtectedRoute(user)

    expect(
      screen.getByRole('heading', { name: 'Private library' })
    ).toBeInTheDocument()
  })

  it('muestra la pantalla de carga mientras revisa la sesion', () => {
    renderProtectedRoute(null, true)

    expect(
      screen.getByRole('heading', { name: 'Loading SAVIA' })
    ).toBeInTheDocument()
  })
})
