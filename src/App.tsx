import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/components/Toast'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { IdentityProvider } from '@/features/identity/IdentityProvider'
import { SyncProvider } from '@/features/sync/SyncProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { AppRoutes } from '@/app/routes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <IdentityProvider>
              <SyncProvider>
                <AppRoutes />
              </SyncProvider>
            </IdentityProvider>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
