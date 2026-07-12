import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import useCurrentUser from './hooks/useCurrentUser'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const { userData } = useSelector(s => s.user)
  if (!userData) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { userData } = useSelector(s => s.user)
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
