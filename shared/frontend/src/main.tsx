import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './router'
import './styles/globals.css'
import { AuthProvider } from './hooks/auth/useAuth.tsx'
import { ThemeProvider } from './hooks/ui/useTheme.tsx'
import { ChatProvider } from './contexts/ChatContext'
import { UserPreferencesProvider } from './hooks/ui/useUserPreferences.tsx'
import { patchFetchWithBaseUrl } from './lib/api'

// Ensure fetch is patched before any component triggers data loads (e.g., SWR)
patchFetchWithBaseUrl()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <UserPreferencesProvider>
        <AuthProvider>
          <ChatProvider>
            <AppRouter />
          </ChatProvider>
        </AuthProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
