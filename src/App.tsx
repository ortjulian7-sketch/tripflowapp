import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { IdentityProvider } from '@/features/identity/IdentityProvider'
import { SyncProvider } from '@/features/sync/SyncProvider'
import { AppRoutes } from '@/app/routes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IdentityProvider>
          <SyncProvider>
            <AppRoutes />
          </SyncProvider>
        </IdentityProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
