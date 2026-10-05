import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import { store } from './app/store'
import { router } from './app/router'

import AuthListener from './components/AuthListener'
import ThemeProvider from './context/ThemeProvider'

import './index.css'

createRoot(
  document.getElementById('root')!
).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AuthListener>
          <RouterProvider router={router} />
        </AuthListener>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)