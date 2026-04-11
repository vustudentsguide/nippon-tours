import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  MapPin, Star, Phone, Mail, CheckCircle2, 
  PlayCircle, ArrowRight, ShieldCheck, 
  Compass, Calendar, Clock, Globe, Shield, Zap, Users,
  ChevronRight, Award, Heart
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

const destinations = [
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', tours: '15+ Tours' },
  { name: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', tours: '10+ Tours' },
  { name: 'Osaka', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', tours: '8+ Tours' },
  { name: 'Mt. Fuji', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80', tours: '5+ Tours' },
]

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [toursRes, reviewsRes] = await Promise.all([
        supabase.from('tours').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(3)
      ]);
      setTours(toursRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* 1. PREMIUM NAVBAR */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-white shadow-xl py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Compass className="text-white w-6 h-6" />
            </div>
            <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>MEIJI<span className="text-indigo-500">TOURS</span></span>
          </Link>
          
          <div className={`hidden lg:flex gap-10 font-bold text-sm uppercase tracking-widest ${isScrolled ? 'text-slate-600' : 'text-white/90'}`}>
            <a href="#tours" className="hover:text-indigo-500 transition-colors">Tours</a>
            <a href="#destinations" className="hover:text-indigo-500 transition-colors">Destinations</a>
            <a href="#experience" className="hover:text-indigo-500 transition-colors">Our Story</a>
            <a href="#contact" className="hover:text-indigo-500 transition-colors">Contact</a>
          </div>

          <Link to="#tours" className="bg-indigo-600 text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 active:scale-95">
            Book Experience
          </Link>
        </div>
      </nav>

      {/* 2. CINEMATIC HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 animate-slow-zoom"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80')" }}
        />
        <div className="relative z-20 px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-[0.3em] mb-6">
            <Star className="w-3 h-3 text-amber-400 fill-current" /> The Gold Standard of Japan Tours
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            Experience Japan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-200">Like Never Before.</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Meiji Tours crafts timeless private journeys. We don't just show you sights; we connect you with the soul of Japanese culture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#tours" className="w-full sm:w-auto bg-white text-indigo-900 font-black px-10 py-5 rounded-2xl text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group">
              Explore Our Tours <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </a>
            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-white/20 transition-all">
              Watch Our Film
            </button>
          </div>
        </div>
      </section>

      {/* 3. TRUST STATS SECTION */}
      <section className="relative z-30 -mt-20 max-w-6xl mx-auto px-4 mb-24">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 border border-slate-100">
          <div className="text-center">
            <p className="text-4xl font-black text-indigo-600">500+</p>
            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Happy Guests</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-4xl font-black text-indigo-600">50+</p>
            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Tour Routes</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-4xl font-black text-indigo-600">100%</p>
            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Private Tours</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-4xl font-black text-indigo-600">4.9</p>
            <p className="text-sm font-bold text-slate-400 uppercase mt-1">Star Rating</p>
          </div>
        </div>
      </section>

      {/* 4. DESTINATIONS SECTION */}
      <section id="destinations" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-3">Top Destinations</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Pick Your Landmark</h3>
          </div>
          <p className="text-slate-500 font-medium max-w-md">From the neon streets of Shinjuku to the silent temples of Kyoto, we cover all corners of Japan.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, i) => (
            <div key={i} className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg">
              <img src={dest.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={dest.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{dest.tours}</p>
                <h4 className="text-2xl font-black text-white">{dest.name}</h4>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MAIN TOURS SECTION (REFINED) */}
      <section id="tours" className="py-24 bg-slate-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-3">Curated Packages</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Most Popular Experiences</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {tours.map(tour => (
                <div key={tour.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group border border-slate-100">
                  <div className="relative h-64 overflow-hidden">
                    <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-indigo-900 font-black text-sm shadow-md">
                      ¥{Number(tour.price).toLocaleString()}
                    </div>
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-black text-slate-700">5.0 (Review)</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Available Now</span>
                    </div>

                    <h4 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">{tour.title}</h4>
                    
                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Full Day</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Private</span>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                      {tour.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <Link to={`/tour/${tour.id}`} className="flex items-center justify-center bg-slate-50 text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all border border-slate-200">
                        Details
                      </Link>
                      <Link to={`/book/${tour.id}`} className="flex items-center justify-center bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. WHY MEIJI TOURS SECTION */}
      <section id="experience" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-50 rounded-full -z-10" />
              <img src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80" className="rounded-[3rem] shadow-2xl" alt="Japan Experience" />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 max-w-xs border border-slate-50">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Award className="w-6 h-6" /></div>
                <div>
                  <p className="font-black text-slate-900">#1 Private Tour</p>
                  <p className="text-xs text-slate-400 font-bold">Voted by 2024 Travelers</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-3">Our Values</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Authenticity in every <br/> single milestone.</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: <Shield />, title: "Full Professional Security", desc: "Our vehicles and guides are licensed under government travel regulations." },
                  { icon: <Globe />, title: "English-Speaking Native Guides", desc: "Language is never a barrier. Our guides are fluent and passionate storytellers." },
                  { icon: <Zap />, title: "Bespoke Itineraries", desc: "Every tour is customizable. You decide the pace, we handle the perfection." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5">
                    <div className="mt-1 bg-indigo-50 text-indigo-600 p-3 h-fit rounded-xl">{item.icon}</div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-24 bg-indigo-900 text-white rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-20">
          <h2 className="text-xs font-black text-indigo-300 uppercase tracking-[0.4em] mb-6">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-16 tracking-tight">Voices of Our Guests</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] text-left">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8 italic">"{rev.comment}"</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black uppercase">{rev.reviewer_name?.charAt(0)}</div>
                   <div>
                     <p className="font-black">{rev.reviewer_name}</p>
                     <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Verified Booking</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px]" />
      </section>

      {/* 8. CALL TO ACTION SECTION */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
           <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">Ready to see the real <span className="text-indigo-600">Japan?</span></h2>
           <p className="text-xl text-slate-500 mb-12 font-medium">Your private adventure with Meiji Tours is just 3 minutes away.</p>
           <a href="#tours" className="inline-flex items-center gap-3 bg-indigo-600 text-white font-black px-12 py-6 rounded-2xl text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/40">
             Explore All Tours <ArrowRight className="w-6 h-6" />
           </a>
        </div>
      </section>

      {/* 9. PREMIUM FOOTER */}
      <footer id="contact" className="bg-slate-900 pt-24 pb-12 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <Compass className="text-indigo-400 w-8 h-8" />
                <span className="text-3xl font-black tracking-tighter text-white">MEIJI<span className="text-indigo-500">TOURS</span></span>
              </Link>
              <p className="text-slate-400 font-medium leading-relaxed">Meiji Tours LLC - Japan’s leading private tour provider. Licensed transportation operator with native expertise.</p>
              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer"><Users className="w-5 h-5"/></div>
                 <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer"><Globe className="w-5 h-5"/></div>
                 <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white hover:bg-indigo-600 transition-all cursor-pointer"><Zap className="w-5 h-5"/></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black text-lg mb-8 uppercase tracking-widest">Our Services</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li><a href="#tours" className="hover:text-white transition-colors">Private Day Tours</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Airport VIP Transfers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cultural Workshops</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Custom Expeditions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-lg mb-8 uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Our History</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Protocols</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5">
              <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest">Contact Expert</h4>
              <ul className="space-y-5 text-slate-400 font-bold text-sm">
                <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-indigo-400" /> travel@meijitours.com</li>
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-indigo-400" /> +81-3-6825-0167</li>
                <li className="flex items-start gap-3"><MapPin className="w-6 h-6 text-indigo-400 shrink-0" /> Tokyo Office: Yajima heights 205, 3-14-3 Yazaike, Adachi, Tokyo</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Meiji Tours LLC. | meijitours.com</p>
            <p>Certified License: 関自旅二第212号</p>
          </div>
        </div>
      </footer>

      {/* CUSTOM STYLES FOR ANIMATION */}
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

const Loader2 = ({ className }) => <div className={`animate-spin rounded-full border-b-2 border-current ${className}`} />;
