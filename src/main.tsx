import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { DataProvider } from './contexts/DataContext'
import { RentalCartProvider } from './contexts/RentalCartContext'
import { PurchaseQuoteProvider } from './contexts/PurchaseQuoteContext'
import { DialogProvider } from './contexts/DialogContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './contexts/ToastContext'
import { router } from './router'
import PerfClass from './components/PerfClass'
import './styles/input.css'
import './styles/site.css'

const AppTree = (
  <ErrorBoundary>
    <PerfClass>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <ToastProvider>
          <DialogProvider>
          <SessionProvider>
            <AuthProvider>
              <UserProvider>
                <DataProvider>
                  <RentalCartProvider>
                    <PurchaseQuoteProvider>
                      <RouterProvider router={router} future={{ v7_startTransition: true }} />
                    </PurchaseQuoteProvider>
                  </RentalCartProvider>
                </DataProvider>
              </UserProvider>
            </AuthProvider>
          </SessionProvider>
          </DialogProvider>
          </ToastProvider>
        </ThemeProvider>
      </MotionConfig>
    </PerfClass>
  </ErrorBoundary>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{AppTree}</React.StrictMode> : AppTree,
)
