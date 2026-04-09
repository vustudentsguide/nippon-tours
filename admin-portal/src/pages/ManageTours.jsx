import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Plus, Edit2, Trash2, X, Upload, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

const BUCKET = 'tour-images'

const emptyForm = { title: '', description: '', price: '' }

function isSafeImageUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return ['https:', 'http:', 'blob:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function sanitizeImageUrl(url) {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return ['https:', 'http:', 'blob:'].includes(parsed.protocol) ? parsed.href : ''
  } catch {
    return ''
  }
}

export default function ManageTours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  useEffect(() => {
    fetchTours()
  }, [])

  async function fetchTours() {
    setLoading(true)
    const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTours(data || [])
    setLoading(false)
  }

  function openCreateForm() {
    setEditingTour(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setFormError(null)
    setFormSuccess(null)
    setShowForm(true)
  }

  function openEditForm(tour) {
    setEditingTour(tour)
    setForm({ title: tour.title, description: tour.description || '', price: tour.price || '' })
    setImageFile(null)
    setImagePreview(isSafeImageUrl(tour.image_url) ? tour.image_url : null)
    setFormError(null)
    setFormSuccess(null)
    setShowForm(true)
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const fileName = `tour-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setSubmitting(true)
    try {
      let imageUrl = editingTour?.image_url || null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }
      if (editingTour) {
        const { error } = await supabase
          .from('tours')
          .update({ title: form.title, description: form.description, price: parseFloat(form.price), image_url: imageUrl })
          .eq('id', editingTour.id)
        if (error) throw error
        setFormSuccess('Tour updated successfully!')
      } else {
        const { error } = await supabase
          .from('tours')
          .insert([{ title: form.title, description: form.description, price: parseFloat(form.price), image_url: imageUrl }])
        if (error) throw error
        setFormSuccess('Tour created successfully!')
      }
      await fetchTours()
      setTimeout(() => {
        setShowForm(false)
        setFormSuccess(null)
      }, 1500)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteTour(id) {
    if (!confirm('Are you sure you want to delete this tour?')) return
    const { error } = await supabase.from('tours').delete().eq('id', id)
    if (!error) setTours(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tours</h1>
          <p className="text-gray-500 text-sm mt-1">{tours.length} tour{tours.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tour
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tour Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingTour ? 'Edit Tour' : 'Create New Tour'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {formSuccess}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="e.g., Tokyo Explorer 7 Days"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Describe the tour..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (¥) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  placeholder="150000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour Image</label>
                {imagePreview && (
                  <div className="mb-3 rounded-lg overflow-hidden h-40 bg-gray-100">
                    <img src={sanitizeImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {submitting ? 'Saving...' : editingTour ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tours List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tours yet. Create your first tour!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-100">
                {tour.image_url && isSafeImageUrl(tour.image_url) ? (
                  <img src={sanitizeImageUrl(tour.image_url)} alt={tour.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <MapPin className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 truncate">{tour.title}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">¥{Number(tour.price).toLocaleString()}</p>
                <p className="text-gray-500 text-xs line-clamp-2 mb-4">{tour.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(tour)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deleteTour(tour.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors"
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
  )
}
