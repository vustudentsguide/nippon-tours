import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TourDetailsPage from './pages/TourDetailsPage'
import BookingPage from './pages/BookingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tour/:id" element={<TourDetailsPage />} />
        <Route path="/book/:id" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
