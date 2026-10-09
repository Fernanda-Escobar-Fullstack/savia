import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import Button from '../src/components/Button/Button'

describe('Button', () => {
  afterEach(() => {
    cleanup()
  })

  it('muestra el texto recibido', () => {
    render(<Button>Borrow Book</Button>)

    expect(
      screen.getByRole('button', { name: 'Borrow Book' })
    ).toBeInTheDocument()
  })

  it('ejecuta onClick cuando el usuario hace clic', () => {
    const handleClick = jest.fn()

    render(
      <Button onClick={handleClick}>
        Confirm
      </Button>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm' })
    )

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('no ejecuta onClick cuando esta deshabilitado', () => {
    const handleClick = jest.fn()

    render(
      <Button disabled onClick={handleClick}>
        Confirm
      </Button>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm' })
    )

    expect(handleClick).not.toHaveBeenCalled()
  })
})
