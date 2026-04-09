import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react'

export default function ManageReviews() {
  const [reviews, setReviews] = useState([])
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  const [form, setForm] = useState({
    tour_id: '',
    reviewer_name: '',
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [reviewsRes, toursRes] = await Promise.all([
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('tours').select('id, title').order('title'),
    ])
    setReviews(reviewsRes.data || [])
    setTours(toursRes.data || [])
    if (toursRes.data?.length > 0 && !form.tour_id) {
      setForm(prev => ({ ...prev, tour_id: toursRes.data[0].id }))
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert([{
        tour_id: form.tour_id,
        reviewer_name: form.reviewer_name,
        rating: parseInt(form.rating),
        comment: form.comment,
      }])
      if (error) throw error
      setFormSuccess('Review added successfully!')
      setForm(prev => ({ ...prev, reviewer_name: '', comment: '', rating: 5 }))
      await fetchData()
      setTimeout(() => setFormSuccess(null), 3000)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteReview(id) {
    if (!confirm('Delete this review?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (!error) setReviews(prev => prev.filter(r => r.id !== id))
  }

  const getTourTitle = (tourId) => tours.find(t => t.id === tourId)?.title || 'Unknown Tour'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Add and manage tour reviews</p>
      </div>

      {/* Add Review Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Add New Review
        </h2>

        {formError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            <AlertCircle className="w-4 h-4" />
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
            <CheckCircle className="w-4 h-4" />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tour *</label>
              <select
                value={form.tour_id}
                onChange={e => setForm(p => ({ ...p, tour_id: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a tour...</option>
                {tours.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name *</label>
              <input
                type="text"
                value={form.reviewer_name}
                onChange={e => setForm(p => ({ ...p, reviewer_name: e.target.value }))}
                required
                placeholder="John Doe"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, rating: star }))}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= form.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-500 self-center ml-1">{form.rating}/5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
              required
              rows={4}
              placeholder="Write the review here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
          >
            {submitting ? 'Adding...' : 'Add Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          All Reviews <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{review.reviewer_name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                      {getTourTitle(review.tour_id)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  <p className="text-gray-300 text-xs mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
