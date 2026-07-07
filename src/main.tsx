import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SessionProvider } from './contexts/SessionContext'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import { ChatProvider } from './contexts/ChatContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { DataProvider } from './contexts/DataContext'
import { RentalCartProvider } from './contexts/RentalCartContext'
import { PurchaseQuoteProvider } from './contexts/PurchaseQuoteContext'
import { DialogProvider } from './contexts/DialogContext'
import { LanguageProvider } from './contexts/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './contexts/ToastContext'
import { router } from './router'
import PerfClass from './components/PerfClass'
import { ensureImageOriginPreconnect } from './lib/image-delivery'
import './styles/input.css'
import './styles/site.css'

ensureImageOriginPreconnect()

const AppTree = (
  <ErrorBoundary>
    <PerfClass>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <DialogProvider>
                <SessionProvider>
                  <AuthProvider>
                    <UserProvider>
                      <NotificationProvider>
                        <ChatProvider>
                          <DataProvider>
                            <RentalCartProvider>
                              <PurchaseQuoteProvider>
                                <RouterProvider router={router} future={{ v7_startTransition: true }} />
                              </PurchaseQuoteProvider>
                            </RentalCartProvider>
                          </DataProvider>
                        </ChatProvider>
                      </NotificationProvider>
                    </UserProvider>
                  </AuthProvider>
                </SessionProvider>
              </DialogProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </MotionConfig>
    </PerfClass>
  </ErrorBoundary>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{AppTree}</React.StrictMode> : AppTree,
)
