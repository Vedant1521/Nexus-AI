import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import useCurrentUser from './hooks/useCurrentUser'
import { useSelector } from 'react-redux'

function AuthSplash() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0b1621]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#14b4dc]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#14b4dc] animate-spin" />
        </div>
        <span className="text-[13px] font-medium tracking-wide text-slate-500">NexusAI</span>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { userData, isAuthLoading } = useSelector(s => s.user)
  if (isAuthLoading) return <AuthSplash />
  if (!userData) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { userData, isAuthLoading } = useSelector(s => s.user)
  if (isAuthLoading) return <AuthSplash />
  if (userData) return <Navigate to="/" replace />
  return children
}

function App() {
  useCurrentUser()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
