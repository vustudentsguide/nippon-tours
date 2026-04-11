import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Star, Trash2, Plus, CheckCircle, AlertCircle, 
  MessageSquare, User, List, TrendingUp, Loader2 
} from 'lucide-react';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const [form, setForm] = useState({
    tour_id: '',
    reviewer_name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [reviewsRes, toursRes] = await Promise.all([
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('tours').select('id, title').order('title'),
      ]);
      setReviews(reviewsRes.data || []);
      setTours(toursRes.data || []);
      if (toursRes.data?.length > 0 && !form.tour_id) {
        setForm(prev => ({ ...prev, tour_id: toursRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        tour_id: form.tour_id,
        reviewer_name: form.reviewer_name,
        rating: parseInt(form.rating),
        comment: form.comment,
      }]);
      if (error) throw error;
      setFormSuccess('Feedback published successfully.');
      setForm(prev => ({ ...prev, reviewer_name: '', comment: '', rating: 5 }));
      await fetchData();
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReview(id) {
    if (!window.confirm('Are you sure you want to remove this feedback permanently?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) setReviews(prev => prev.filter(r => r.id !== id));
  }

  const getTourTitle = (tourId) => tours.find(t => t.id === tourId)?.title || 'Unknown Tour';

  // Stats Calculation
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header & Stats Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Feedback Management</h1>
        <p className="text-slate-500 font-medium mt-1 mb-6 text-sm sm:text-base">Meiji Tours - Moderate and publish customer reviews.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reviews</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{reviews.length}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
              <MessageSquare className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Avg Rating</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{avgRating}<span className="text-sm text-slate-400 font-medium">/5.0</span></p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Active Tours</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{tours.length}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Add Review Form (Sticky on Desktop) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 sticky top-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Create New Review</h2>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 p-4 rounded-lg mb-6 text-sm font-semibold border border-rose-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 text-sm font-semibold border border-emerald-100">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Assign to Tour</label>
                <select
                  value={form.tour_id}
                  onChange={e => setForm(p => ({ ...p, tour_id: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                >
                  <option value="">Select a tour...</option>
                  {tours.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Reviewer Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    value={form.reviewer_name}
                    onChange={e => setForm(p => ({ ...p, reviewer_name: e.target.value }))}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Star Rating</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 w-fit">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, rating: star }))}
                        className="transition-transform active:scale-90 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= form.rating ? 'text-amber-400 fill-current' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 border-l border-slate-300 pl-3">{form.rating}/5</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Customer Feedback</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Paste the customer's comment here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 mt-2 text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Reviews List */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-slate-900">Recent Feedback</h2>
            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">{reviews.length} Total</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-b-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-400 shadow-sm">
              <List className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-sm">Your feedback list is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-700 rounded-md flex items-center justify-center font-bold text-xs uppercase border border-indigo-100">
                          {review.reviewer_name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{review.reviewer_name}</span>
                        <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          <Star className="w-3 h-3 text-amber-500 fill-current mr-1" />
                          <span className="text-[11px] font-bold text-amber-700">{review.rating}.0</span>
                        </div>
                      </div>
                      
                      {/* Tour Link Badge */}
                      <div className="mb-3 inline-block bg-slate-50 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded border border-slate-200 uppercase tracking-widest">
                        {getTourTitle(review.tour_id)}
                      </div>

                      <p className="text-slate-700 text-sm leading-relaxed italic">"{review.comment}"</p>
                      
                      <p className="text-slate-400 text-[10px] font-semibold mt-4 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
