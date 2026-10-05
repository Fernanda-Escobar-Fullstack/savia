import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  ThemeContext,
  type Theme,
} from './ThemeContext'

interface ThemeProviderProps {
  children: ReactNode
}

function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem('savia-theme')

      return savedTheme === 'dark'
        ? 'dark'
        : 'light'
    })

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    )

    localStorage.setItem(
      'savia-theme',
      theme
    )
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider