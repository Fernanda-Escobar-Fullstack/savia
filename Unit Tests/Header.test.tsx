import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Header from '../src/components/Header/Header'
import { useAppSelector } from '../src/hooks/reduxHooks'
import { subscribeToNotifications } from '../src/services/notificationService'

jest.mock('../src/hooks/reduxHooks', () => ({
  useAppSelector: jest.fn(),
}))

jest.mock('../src/services/notificationService', () => ({
  subscribeToNotifications: jest.fn(() => jest.fn()),
}))

jest.mock('../src/components/Logo/Logo', () => ({
  __esModule: true,
  default: () => <span>SAVIA Logo</span>,
}))

jest.mock('../src/components/Sidebar/Sidebar', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean
    onClose: () => void
  }) =>
    isOpen ? (
      <aside>
        Navigation sidebar
        <button type="button" onClick={onClose}>
          Close sidebar
        </button>
      </aside>
    ) : null,
}))

const mockedUseAppSelector = jest.mocked(useAppSelector)
const mockedSubscribe = jest.mocked(
  subscribeToNotifications
)

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          user: {
            uid: 'user-1',
            fullName: 'Ana Perez',
          },
        },
      } as never)
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('muestra la inicial del usuario y sus enlaces', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('link', { name: 'Go to my profile' })
    ).toHaveTextContent('A')
    expect(
      screen.getByRole('link', { name: 'Go to wishlist' })
    ).toHaveAttribute('href', '/wishlist')
  })

  it('abre y cierra el menu lateral', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      })
    )

    expect(
      screen.getByText('Navigation sidebar')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Close sidebar' })
    )

    expect(
      screen.queryByText('Navigation sidebar')
    ).not.toBeInTheDocument()
  })

  it('se suscribe a las notificaciones del usuario', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(mockedSubscribe).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function)
    )
  })
})
