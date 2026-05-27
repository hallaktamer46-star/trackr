import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ApplicationProvider } from './contexts/ApplicationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import AITools from './pages/AITools'
import Stats from './pages/Stats'
import Jobs from './pages/Jobs'
import Auth from './pages/Auth'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Dashboard />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/stats" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Stats />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/ai/:tool?" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <AITools />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Jobs />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
