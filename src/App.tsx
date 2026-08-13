import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { SyncProvider } from '@/features/sync/SyncProvider'
import { AppRoutes } from '@/app/routes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>
          <AppRoutes />
        </SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
