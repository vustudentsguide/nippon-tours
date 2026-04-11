import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, Edit2, Trash2, X, Upload, CheckCircle, 
  AlertCircle, Tag, Banknote, Image as ImageIcon,
  Loader2, AlignLeft, ListChecks, Milestone
} from 'lucide-react';

const BUCKET = 'tour-images';
const emptyForm = { title: '', description: '', price: '', itinerary: '', inclusions: '' };

function isSafeImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:', 'blob:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function ManageTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  async function fetchTours() {
    setLoading(true);
    const { data, error } = await supabase.from('tours').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setTours(data || []);
    setLoading(false);
  }

  function openCreateForm() {
    setEditingTour(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setFormSuccess(null);
    setShowForm(true);
  }

  function openEditForm(tour) {
    setEditingTour(tour);
    setForm({ 
      title: tour.title, 
      description: tour.description || '', 
      price: tour.price || '',
      itinerary: tour.itinerary || '',
      inclusions: tour.inclusions || ''
    });
    setImageFile(null);
    setImagePreview(isSafeImageUrl(tour.image_url) ? tour.image_url : null);
    setFormError(null);
    setFormSuccess(null);
    setShowForm(true);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop();
    const fileName = `tour-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);
    try {
      let imageUrl = editingTour?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const tourData = { 
        title: form.title, 
        description: form.description, 
        price: parseFloat(form.price), 
        image_url: imageUrl,
        itinerary: form.itinerary,
        inclusions: form.inclusions
      };

      if (editingTour) {
        const { error } = await supabase.from('tours').update(tourData).eq('id', editingTour.id);
        if (error) throw error;
        setFormSuccess('Tour details updated successfully!');
      } else {
        const { error } = await supabase.from('tours').insert([tourData]);
        if (error) throw error;
        setFormSuccess('New tour launched successfully!');
      }

      await fetchTours();
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTour(id) {
    if (!window.confirm('Delete this tour permanently?')) return;
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (!error) setTours(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Manage Tours</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Meiji Tours - Create and customize your travel packages.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Add Tour Package
        </button>
      </div>

      {/* Tours Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="font-semibold text-sm animate-pulse">Fetching latest tours...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {tour.image_url ? (
                  <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 font-black px-3 py-1.5 rounded-md shadow-sm text-sm">
                  ¥{Number(tour.price).toLocaleString()}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{tour.title}</h3>
                <p className="text-slate-400 text-[10px] font-bold mb-3 uppercase tracking-wider">
                  {tour.description ? 'Detailed Package' : 'No description'}
                </p>
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditForm(tour)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deleteTour(tour.id)}
                    className="p-2 font-bold text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Detail Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                  {editingTour ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingTour ? 'Update Tour Package' : 'Create New Package'}
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Notifications */}
              {formError && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-lg text-sm font-semibold border border-rose-100 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm font-semibold border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0" /> {formSuccess}
                </div>
              )}

              {/* Basic Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tour Title</label>
                  <div className="relative group">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      required placeholder="e.g., Osaka Highlights"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price (¥)</label>
                  <div className="relative group">
                    <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                      required min="0" placeholder="70000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-indigo-500" /> Overview
                  </label>
                  <textarea
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    required rows={3} placeholder="Brief summary of the tour..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5 text-indigo-500" /> Sample Itinerary
                  </label>
                  <textarea
                    value={form.itinerary} onChange={e => setForm(p => ({ ...p, itinerary: e.target.value }))}
                    rows={4} placeholder="Morning: Pickup... Afternoon: Visit Temple..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-500" /> Inclusions
                  </label>
                  <textarea
                    value={form.inclusions} onChange={e => setForm(p => ({ ...p, inclusions: e.target.value }))}
                    rows={4} placeholder="What is included?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-900 resize-none"
                  />
                </div>
              </div>

              {/* Image Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tour Visual</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{imageFile ? imageFile.name : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  
                  {imagePreview && (
                    <div className="rounded-lg overflow-hidden h-28 shadow-sm border border-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-100">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="flex-1 text-slate-500 font-bold py-2.5 rounded-lg hover:bg-slate-100 transition-all text-xs uppercase tracking-wider"
                >
                  Discard
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-[2] bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTour ? 'Update Tour' : 'Launch Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
