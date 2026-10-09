// @vitest-environment jsdom

import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '../src/hooks/useDebounce'

describe('useDebounce', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('espera el tiempo indicado antes de cambiar el valor', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'har' },
      }
    )

    rerender({ value: 'harry' })

    expect(result.current).toBe('har')

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(result.current).toBe('har')

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(result.current).toBe('harry')
  })
})
