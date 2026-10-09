import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react'
import { useDebounce } from '../src/hooks/useDebounce'

describe('useDebounce', () => {
  afterEach(() => {
    cleanup()
    jest.useRealTimers()
  })

  it('espera el tiempo indicado antes de cambiar el valor', () => {
    jest.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'har' },
      }
    )

    rerender({ value: 'harry' })

    expect(result.current).toBe('har')

    act(() => {
      jest.advanceTimersByTime(499)
    })

    expect(result.current).toBe('har')

    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(result.current).toBe('harry')
  })
})
