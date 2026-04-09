import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MapPin, Star, ArrowLeft, Calendar } from 'lucide-react'

function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export default function TourDetailsPage() {
  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTourAndReviews()
  }, [id])

  async function fetchTourAndReviews() {
    try {
      setLoading(true)
      const [tourRes, reviewsRes] = await Promise.all([
        supabase.from('tours').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('tour_id', id).order('created_at', { ascending: false }),
      ])
      if (tourRes.error) throw tourRes.error
      setTour(tourRes.data)
      setReviews(reviewsRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Tour not found'}</p>
          <Link to="/" className="text-blue-600 underline">Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-600 w-5 h-5" />
            <span className="font-bold text-gray-900">Nippon Travel Tours</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tour Image */}
        <div className="rounded-2xl overflow-hidden h-64 sm:h-96 bg-gray-100 mb-8">
          {isSafeImageUrl(tour.image_url) ? (
            <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <MapPin className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Tour Info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.title}</h1>
            {averageRating && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold text-gray-700">{averageRating}</span>
                <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">¥{Number(tour.price).toLocaleString()}</div>
            <div className="text-gray-400 text-sm">per person</div>
          </div>
        </div>

        <div className="prose max-w-none text-gray-600 mb-8 leading-relaxed">
          <p>{tour.description}</p>
        </div>

        <Link
          to={`/book/${tour.id}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-md"
        >
          <Calendar className="w-4 h-4" /> Book This Tour
        </Link>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Traveler Reviews {reviews.length > 0 && <span className="text-gray-400 text-lg font-normal">({reviews.length})</span>}
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{review.reviewer_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  <p className="text-gray-300 text-xs mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
