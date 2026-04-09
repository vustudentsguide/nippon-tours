import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, Trash2, Mail, RefreshCw, Calendar, AlertCircle } from 'lucide-react'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  deleted: 'bg-red-100 text-red-700',
}

export default function BookingsDashboard() {
  const [bookings, setBookings] = useState([])
  const [tours, setTours] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [bookingsRes, toursRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('tours').select('id, title'),
      ])
      if (bookingsRes.error) throw bookingsRes.error
      if (toursRes.error) throw toursRes.error
      setBookings(bookingsRes.data || [])
      const toursMap = {}
      toursRes.data?.forEach(t => { toursMap[t.id] = t.title })
      setTours(toursMap)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function confirmBooking(id) {
    setActionLoading(id + '_confirm')
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id)
    if (!error) setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
    setActionLoading(null)
  }

  async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return
    setActionLoading(id + '_delete')
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (!error) setBookings(prev => prev.filter(b => b.id !== id))
    setActionLoading(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base">{booking.customer_name}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-500'}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-700">Tour:</span> {tours[booking.tour_id] || 'Unknown'}</p>
                    <p><span className="font-medium text-gray-700">Email:</span> {booking.customer_email}</p>
                    <p><span className="font-medium text-gray-700">Phone:</span> {booking.customer_phone}</p>
                    <p><span className="font-medium text-gray-700">Date:</span> {booking.booking_date || '—'}</p>
                    {booking.flight_details && (
                      <p className="sm:col-span-2"><span className="font-medium text-gray-700">Flight:</span> {booking.flight_details}</p>
                    )}
                    {booking.hotel_details && (
                      <p className="sm:col-span-2"><span className="font-medium text-gray-700">Hotel:</span> {booking.hotel_details}</p>
                    )}
                    {booking.special_requests && (
                      <p className="sm:col-span-2"><span className="font-medium text-gray-700">Special Requests:</span> {booking.special_requests}</p>
                    )}
                    <p className="text-gray-400 text-xs sm:col-span-2">
                      Submitted: {new Date(booking.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => confirmBooking(booking.id)}
                      disabled={actionLoading === booking.id + '_confirm'}
                      className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                  )}
                  <a
                    href={`mailto:${booking.customer_email}?subject=Your Nippon Tours Booking&body=Hi ${booking.customer_name},`}
                    className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Contact
                  </a>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    disabled={actionLoading === booking.id + '_delete'}
                    className="flex items-center gap-1.5 text-sm bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
