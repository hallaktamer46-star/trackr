import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ApplicationProvider } from './contexts/ApplicationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import AITools from './pages/AITools'
import CVHub from './pages/CVHub'
import Stats from './pages/Stats'
import Jobs from './pages/Jobs'
import Blog from './pages/Blog'
import Calendar from './pages/Calendar'
import Roadmap from './pages/Roadmap'
import PitchLab from './pages/PitchLab'
import GrowthLab from './pages/GrowthLab'
import StartupStudio from './pages/StartupStudio'
import TimeReport from './pages/TimeReport'
import MentalClarity from './pages/MentalClarity'
import RoundTable from './pages/RoundTable'
import RoadmapDetail from './pages/RoadmapDetail'
import LifePlan from './pages/LifePlan'
import DailyDebrief from './pages/DailyDebrief'
import Library from './pages/Library'
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
              <Home />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/board" element={
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
      <Route path="/cv/:tool?" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <CVHub />
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
      <Route path="/blog" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Blog />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/growth" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <GrowthLab />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/pitch" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <PitchLab />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/roadmap" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Roadmap />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Calendar />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/plans" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Plans />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/startup" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <StartupStudio />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/time-report" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <TimeReport />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/clarity" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <MentalClarity />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/roundtable" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <RoundTable />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/roadmap/:pathId" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <RoadmapDetail />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <Library />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/debrief" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <DailyDebrief />
            </Layout>
          </ApplicationProvider>
        </ProtectedRoute>
      } />
      <Route path="/life" element={
        <ProtectedRoute>
          <ApplicationProvider>
            <Layout>
              <LifePlan />
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
