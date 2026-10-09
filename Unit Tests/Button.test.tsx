// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
    const handleClick = vi.fn()

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
    const handleClick = vi.fn()

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
