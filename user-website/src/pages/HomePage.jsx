import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react'

function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export default function HomePage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTours()
  }, [])

  async function fetchTours() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTours(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600 w-6 h-6" />
            <span className="text-xl font-bold text-gray-900">Nippon Travel Tours</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#tours" className="hover:text-blue-600 transition-colors">Tours</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1600&q=80')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Discover the Magic of <br className="hidden sm:block" />
            <span className="text-blue-300">Japan</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Explore breathtaking landscapes, rich culture, and unforgettable experiences with Nippon Travel Tours.
          </p>
          <a
            href="#tours"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-base"
          >
            Explore Tours <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Tours Section */}
      <section id="tours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Featured Tours</h2>
          <p className="text-gray-500 text-base sm:text-lg">Hand-picked experiences for every kind of traveler</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500">
            <p>Failed to load tours: {error}</p>
            <button onClick={fetchTours} className="mt-4 text-blue-600 underline">Retry</button>
          </div>
        )}

        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No tours available at the moment. Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col">
              <div className="relative h-52 bg-gray-100">
                {isSafeImageUrl(tour.image_url) ? (
                  <img
                    src={tour.image_url}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <MapPin className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow">
                  ¥{Number(tour.price).toLocaleString()}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{tour.title}</h3>
                <p className="text-gray-500 text-sm flex-1 line-clamp-3">{tour.description}</p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/tour/${tour.id}`}
                    className="flex-1 text-center border border-blue-600 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/book/${tour.id}`}
                    className="flex-1 text-center bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Nippon Travel Tours?</h2>
          <p className="text-gray-600 mb-10 text-base sm:text-lg">
            We craft personalized Japan travel experiences with expert local guides, seamless logistics, and unforgettable memories.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🗾', title: 'Expert Local Guides', desc: 'Passionate guides who know Japan inside out.' },
              { icon: '✈️', title: 'Full Itinerary Support', desc: 'From flights to hotels, we handle everything.' },
              { icon: '⭐', title: '5-Star Experiences', desc: 'Hundreds of happy travelers across Japan.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-gray-500 mb-6">Have questions? We're here to help you plan your dream Japan trip.</p>
          <a
            href="mailto:info@nippontours.com"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>© {new Date().getFullYear()} Nippon Travel Tours. All rights reserved.</p>
      </footer>
    </div>
  )
}
