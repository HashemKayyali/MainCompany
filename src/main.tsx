import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { DataProvider } from './contexts/DataContext'
import { router } from './router'
import './styles/input.css'
import './styles/site.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <AuthProvider>
          <UserProvider>
            <DataProvider>
              <RouterProvider router={router} />
            </DataProvider>
          </UserProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
