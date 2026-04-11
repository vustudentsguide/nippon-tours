import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  MapPin, Star, ArrowLeft, ArrowRight, Calendar, 
  Clock, Users, Check, X, ShieldCheck, 
  Compass, Loader2, AlignLeft, Milestone, ListChecks
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

export default function TourDetailsPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTourAndReviews();
  }, [id]);

  async function fetchTourAndReviews() {
    try {
      setLoading(true);
      const [tourRes, reviewsRes] = await Promise.all([
        supabase.from('tours').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('tour_id', id).order('created_at', { ascending: false }),
      ]);
      
      if (tourRes.error) throw tourRes.error;
      
      setTour(tourRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Safe average calculation
  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Experience...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <p className="text-slate-900 mb-8 font-black text-xl">{error || 'Tour not found'}</p>
          <Link to="/" className="inline-flex items-center justify-center w-full gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 transition-all font-bold uppercase tracking-wider text-sm shadow-lg shadow-indigo-600/30">
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Safe title check
  const tourTitle = tour?.title || '';
  const isMultiDay = tourTitle.toLowerCase().includes('day');

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      
      {/* Clean Premium Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Compass className="text-indigo-600 w-6 h-6" />
            <span className="font-black tracking-tighter text-xl">MEIJI<span className="text-indigo-600">TOURS</span></span>
          </div>
          <div className="w-16"></div> {/* Spacer for perfect centering */}
        </div>
      </nav>

      {/* Cinematic Hero Image Section */}
      <div className="w-full h-[40vh] sm:h-[55vh] lg:h-[65vh] bg-slate-900 relative">
        {isSafeImageUrl(tour?.image_url) ? (
          <img src={tour.image_url} alt={tourTitle} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <MapPin className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title & Meta Box */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest border border-indigo-100">
                  Premium Experience
                </span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded border border-amber-100">
                  <Star className="w-4 h-4 fill-current" />
                  {averageRating} <span className="text-amber-700/70 font-semibold ml-1">({reviews.length} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                {tourTitle}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500 border-t border-slate-100 pt-6 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  {isMultiDay ? 'Multi-Day Tour' : 'Full Day (8-10 Hours)'}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  Meiji Verified
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Private Group
                </div>
              </div>
            </div>

            {/* Tabs Navigation & Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-slate-100 hide-scrollbar bg-slate-50/50">
                {[
                  { id: 'overview', label: 'Overview', icon: <AlignLeft className="w-4 h-4" /> },
                  { id: 'itinerary', label: 'Itinerary', icon: <Milestone className="w-4 h-4" /> },
                  { id: 'inclusions', label: 'Inclusions', icon: <ListChecks className="w-4 h-4" /> },
                  { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab.id 
                        ? 'border-indigo-600 text-indigo-700 bg-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Area */}
              <div className="p-8 sm:p-10">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">About This Tour</h3>
                    <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                      {tour?.description || 'Detailed description will be provided shortly.'}
                    </div>
                  </div>
                )}

                {/* ITINERARY TAB (Dynamic from DB) */}
                {activeTab === 'itinerary' && (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Tour Itinerary</h3>
                    {tour?.itinerary ? (
                      <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                        {tour.itinerary}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-100">
                        <Milestone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-semibold">Custom itinerary will be discussed and finalized upon booking.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* INCLUSIONS TAB (Dynamic from DB) */}
                {activeTab === 'inclusions' && (
                  <div className="animate-in fade-in duration-300">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">What's Included</h3>
                    {tour?.inclusions ? (
                      <div className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                        {tour.inclusions}
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                          <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Check className="w-4 h-4" /> Standard Inclusions
                          </h4>
                          <ul className="space-y-3 text-sm font-medium text-emerald-700">
                            <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0"/> Private English-speaking guide</li>
                            <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0"/> Hotel pickup & drop-off</li>
                            <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0"/> Dedicated transport</li>
                          </ul>
                        </div>
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                          <h4 className="font-black text-rose-800 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <X className="w-4 h-4" /> Exclusions
                          </h4>
                          <ul className="space-y-3 text-sm font-medium text-rose-700">
                            <li className="flex items-start gap-2"><X className="w-4 h-4 mt-0.5 shrink-0"/> Meals and personal expenses</li>
                            <li className="flex items-start gap-2"><X className="w-4 h-4 mt-0.5 shrink-0"/> Attraction entrance fees</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <h3 className="text-2xl font-black text-slate-900">Guest Reviews</h3>
                      <div className="text-left sm:text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-fit">
                        <div className="text-2xl font-black text-indigo-600">{averageRating}<span className="text-sm text-slate-400 font-bold ml-1">/ 5.0</span></div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Based on {reviews.length} reviews</div>
                      </div>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="bg-slate-50 rounded-2xl p-10 text-center text-slate-400 border border-slate-100">
                        <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="font-bold">No reviews yet. Book this tour and be the first!</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {reviews.map(review => (
                          <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg border border-indigo-100 uppercase">
                                  {review?.reviewer_name ? review.reviewer_name.charAt(0) : 'U'}
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 block">{review?.reviewer_name || 'Anonymous Guest'}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {review?.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < (review?.rating || 5) ? 'text-amber-400 fill-current' : 'text-slate-300 fill-current'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{review?.comment || 'No comment provided.'}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sticky top-28">
              <div className="text-center border-b border-slate-100 pb-6 mb-6">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Price Per Group</p>
                <div className="flex items-center justify-center gap-1 text-5xl font-black text-slate-900 tracking-tighter">
                  <span className="text-2xl text-indigo-600">¥</span>{Number(tour?.price || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Taxes & Fees Included</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Secure Booking Process
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                  <Calendar className="w-5 h-5 text-emerald-500" /> Flexible Cancellation
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                  <Clock className="w-5 h-5 text-emerald-500" /> Instant Support 24/7
                </li>
              </ul>

              <Link
                to={`/book/${tour?.id}`}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-sm py-5 rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-widest"
              >
                Proceed to Booking <ArrowRight className="w-5 h-5" />
              </Link>
              
              <p className="text-[10px] text-center text-slate-400 mt-5 font-bold uppercase tracking-widest leading-relaxed">
                No hidden fees. <br/> You won't be charged right now.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
