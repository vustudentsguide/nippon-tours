import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import BookingsDashboard from './pages/BookingsDashboard'
import ManageTours from './pages/ManageTours'
import ManageReviews from './pages/ManageReviews'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  )

  const handleLogin = () => {
    sessionStorage.setItem('admin_auth', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/bookings" replace />} />
          <Route path="bookings" element={<BookingsDashboard />} />
          <Route path="tours" element={<ManageTours />} />
          <Route path="reviews" element={<ManageReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
