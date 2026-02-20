import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { DataProvider } from './contexts/DataContext'
import { router } from './router'
import PerfClass from './components/PerfClass'
import './styles/input.css'
import './styles/site.css'

const AppTree = (
  <PerfClass>
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
  </PerfClass>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{AppTree}</React.StrictMode> : AppTree,
)