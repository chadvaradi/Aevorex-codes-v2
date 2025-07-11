import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './router'
import './styles/globals.css'
import { AuthProvider } from './hooks/auth/useAuth'
import { ThemeProvider } from './hooks/ui/useTheme.tsx'
import { ChatProvider } from './contexts/ChatContext'
import { UserPreferencesProvider } from './hooks/ui/useUserPreferences.tsx'

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
