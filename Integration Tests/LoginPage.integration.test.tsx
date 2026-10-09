import { configureStore } from '@reduxjs/toolkit'
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import authReducer from '../src/features/auth/authSlice'
import booksReducer from '../src/features/books/booksSlice'
import LoginPage from '../src/pages/LoginPage/LoginPage'
import { loginUser } from '../src/services/authService'

jest.mock('../src/services/authService', () => ({
  loginUser: jest.fn(),
}))

jest.mock('../src/components/Logo/Logo', () => ({
  __esModule: true,
  default: () => <div>SAVIA Logo</div>,
}))

const authenticatedUser = {
  uid: 'user-1',
  fullName: 'Ana Perez',
  username: 'ana',
  email: 'ana@university.edu',
  universityCode: 'UNI001',
}

function renderLoginPage() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      books: booksReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        loading: false,
        error: null,
      },
      books: booksReducer(undefined, { type: '@@INIT' }),
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<h1>Library home</h1>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )

  return store
}

describe('LoginPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('inicia sesion, guarda al usuario y navega al inicio', async () => {
    jest.mocked(loginUser).mockResolvedValue(authenticatedUser)
    const store = renderLoginPage()
    const user = userEvent.setup()

    await user.type(
      screen.getByLabelText('Email'),
      'ana@university.edu'
    )
    await user.type(
      screen.getByLabelText('Password'),
      'secret123'
    )
    await user.click(
      screen.getByRole('button', { name: 'Login' })
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Library home' })
      ).toBeInTheDocument()
    })

    expect(loginUser).toHaveBeenCalledWith(
      'ana@university.edu',
      'secret123'
    )
    expect(store.getState().auth.user).toEqual(
      authenticatedUser
    )
  })

  it('muestra el error cuando el servicio rechaza el acceso', async () => {
    jest.mocked(loginUser).mockRejectedValue(
      new Error('Invalid credentials.')
    )
    renderLoginPage()
    const user = userEvent.setup()

    await user.type(
      screen.getByLabelText('Email'),
      'wrong@university.edu'
    )
    await user.type(
      screen.getByLabelText('Password'),
      'wrong-password'
    )
    await user.click(
      screen.getByRole('button', { name: 'Login' })
    )

    expect(
      await screen.findByText('Invalid credentials.')
    ).toBeInTheDocument()
  })
})
