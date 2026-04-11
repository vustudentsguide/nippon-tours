import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  CheckCircle, Trash2, Mail, RefreshCw, Calendar, 
  AlertCircle, Phone, User, MapPin, Plane, 
  Building, MessageSquare, Clock, Users 
} from 'lucide-react';

// Professional, muted status colors
const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  deleted: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function BookingsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, toursRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('tours').select('id, title'),
      ]);
      
      if (bookingsRes.error) throw bookingsRes.error;
      if (toursRes.error) throw toursRes.error;
      
      setBookings(bookingsRes.data || []);
      
      const toursMap = {};
      toursRes.data?.forEach(t => { toursMap[t.id] = t.title });
      setTours(toursMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking(id) {
    setActionLoading(id + '_confirm');
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    }
    setActionLoading(null);
  }

  async function deleteBooking(id) {
    if (!window.confirm('Are you sure you want to delete this booking permanently?')) return;
    setActionLoading(id + '_delete');
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
    setActionLoading(null);
  }

  // Calculate Quick Stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header & Quick Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bookings Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Meiji Tours - Manage and track customer reservations.</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-all shadow-sm font-semibold text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Row - Clean White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{confirmedCount}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 border border-rose-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-b-indigo-600 mb-4" />
          <p className="font-medium text-sm">Loading reservations securely...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h3>
          <p className="text-slate-500 text-sm">Reservations made on meijitours.com will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" /> {booking.customer_name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" /> 
                    <span className="font-bold text-slate-700">{tours[booking.tour_id] || 'Unknown Tour'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tour Date</p>
                    <p className="font-bold text-slate-900 text-sm leading-none">{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}) : 'Not Specified'}</p>
                  </div>
                </div>
              </div>

              {/* Card Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-slate-900">{booking.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone / WhatsApp</p>
                      <p className="text-sm font-medium text-slate-900">{booking.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guests</p>
                      <p className="text-sm font-medium text-slate-900">{booking.number_of_people || 1} Person(s)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 lg:col-span-2 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  {booking.flight_details && (
                    <div className="flex items-start gap-3">
                      <Plane className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flight Details</p>
                        <p className="text-sm font-medium text-slate-800">{booking.flight_details}</p>
                      </div>
                    </div>
                  )}
                  {booking.hotel_details && (
                    <div className="flex items-start gap-3 mt-3">
                      <Building className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotel / Pickup</p>
                        <p className="text-sm font-medium text-slate-800">{booking.hotel_details}</p>
                      </div>
                    </div>
                  )}
                  {booking.special_requests && (
                    <div className="flex items-start gap-3 mt-3">
                      <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Special Requests</p>
                        <p className="text-sm font-medium text-slate-800 italic">"{booking.special_requests}"</p>
                      </div>
                    </div>
                  )}
                  {(!booking.flight_details && !booking.hotel_details && !booking.special_requests) && (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium italic">
                      No extra logistics provided by customer.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer (Actions) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Received: {new Date(booking.created_at).toLocaleString()}
                </p>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => confirmBooking(booking.id)}
                      disabled={actionLoading === booking.id + '_confirm'}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </button>
                  )}
                  <a
                    href={`mailto:${booking.customer_email}?subject=Regarding Your Meiji Tours Booking for ${tours[booking.tour_id]}&body=Hi ${booking.customer_name},`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> Contact
                  </a>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    disabled={actionLoading === booking.id + '_delete'}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
