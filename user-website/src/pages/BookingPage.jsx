import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  MapPin, ArrowLeft, CheckCircle, AlertCircle, 
  Calendar, Users, User, Mail, Phone, Plane, 
  Building, MessageSquare, ShieldCheck, CreditCard,
  Compass, Loader2
} from 'lucide-react';

function isSafeImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    number_of_people: 1,
    booking_date: '',
    flight_details: '',
    hotel_details: '',
    special_requests: '',
  });

  useEffect(() => {
    async function fetchTour() {
      const { data, error } = await supabase.from('tours').select('id, title, price, image_url').eq('id', id).single();
      if (!error) setTour(data);
      setLoading(false);
    }
    fetchTour();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').insert([{
        tour_id: id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        booking_date: form.booking_date,
        flight_details: form.flight_details,
        hotel_details: form.hotel_details,
        special_requests: form.special_requests,
        status: 'pending',
      }]);
      if (error) throw error;
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
      </div>
    );
  }

  // SUCCESS STATE
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="bg-white p-10 md:p-14 rounded-[2rem] shadow-xl text-center max-w-lg w-full border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 -rotate-3" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Request Received</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium">
            Arigatou Gozaimasu, <strong className="text-slate-900">{form.customer_name}</strong>! Your reservation for <strong className="text-slate-900">{tour?.title}</strong> is processing. The Meiji Tours team will email you at <strong className="text-indigo-600">{form.customer_email}</strong> shortly.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full gap-2 bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 uppercase tracking-widest text-sm"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = tour ? Number(tour.price) * Math.max(1, form.number_of_people) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      
      {/* Checkout Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link to={`/tour/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tour</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-900">
            <Compass className="text-indigo-600 w-5 h-5" />
            <span className="font-black tracking-tighter text-lg hidden sm:block">MEIJI<span className="text-indigo-600">TOURS</span></span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest hidden sm:block">Secure Checkout</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Booking Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Complete Your Booking</h2>
              <p className="text-slate-500 mb-10 font-medium">Please provide accurate details for a smooth Meiji Tours experience.</p>

              {error && (
                <div className="flex items-center gap-3 bg-rose-50 text-rose-700 p-4 rounded-xl mb-8 border border-rose-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Section 1: Contact Details */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> 1. Lead Traveler
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name *</label>
                      <input
                        type="text" name="customer_name" value={form.customer_name} onChange={handleChange} required
                        placeholder="e.g. John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address *</label>
                      <input
                        type="email" name="customer_email" value={form.customer_email} onChange={handleChange} required
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone / WhatsApp *</label>
                      <input
                        type="tel" name="customer_phone" value={form.customer_phone} onChange={handleChange} required
                        placeholder="+1 234 567 8900"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Tour Specifics */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" /> 2. Tour Specifics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tour Date *</label>
                      <input
                        type="date" name="booking_date" value={form.booking_date} onChange={handleChange} required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Number of Guests *</label>
                      <input
                        type="number" name="number_of_people" value={form.number_of_people} onChange={handleChange} required min="1" max="50"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Logistics & Extras */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-indigo-500" /> 3. Logistics (Optional)
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Flight Details
                    </label>
                    <textarea
                      name="flight_details" value={form.flight_details} onChange={handleChange} rows={2}
                      placeholder="Arrival / Departure info if applicable..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Hotel / Pickup Location
                    </label>
                    <textarea
                      name="hotel_details" value={form.hotel_details} onChange={handleChange} rows={2}
                      placeholder="e.g. Hotel Gracery Shinjuku"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Special Requests
                    </label>
                    <textarea
                      name="special_requests" value={form.special_requests} onChange={handleChange} rows={2}
                      placeholder="Dietary needs, wheelchair access, etc."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin h-4 w-4 text-white" /> Processing...
                      </span>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
                    By clicking submit, you agree to Meiji Tours terms. <br/> No payment is required at this step.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              
              {/* Tour Image */}
              <div className="h-48 bg-slate-100 relative">
                {tour && isSafeImageUrl(tour.image_url) ? (
                  <img src={tour.image_url} alt="Tour" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <h3 className="absolute bottom-5 left-5 right-5 text-white font-black text-xl leading-tight line-clamp-2">
                  {tour?.title || 'Loading tour...'}
                </h3>
              </div>

              {/* Summary Details */}
              <div className="p-6 sm:p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Booking Summary</h4>
                
                <div className="space-y-4 text-sm font-medium mb-8">
                  <div className="flex justify-between text-slate-500">
                    <span>Date</span>
                    <span className="font-bold text-slate-900">{form.booking_date ? new Date(form.booking_date).toLocaleDateString() : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Guests</span>
                    <span className="font-bold text-slate-900">{form.number_of_people} Person(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Price / person</span>
                    <span className="font-bold text-slate-900">¥{Number(tour?.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-6 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900 text-lg uppercase tracking-wider">Total</span>
                    <span className="font-black text-indigo-600 text-3xl">
                      ¥{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-right text-slate-400 mt-2">Taxes & fees included</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-800 text-sm">
                  <CreditCard className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-xs font-semibold">
                    <strong className="block mb-1 text-sm">Pay Later</strong>
                    Meiji Tours will review your request and send a secure payment link via email.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
