import React, { useState } from 'react'
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin1243'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Artificial delay for premium feel
    await new Promise(r => setTimeout(r, 800))
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError('Invalid credentials. Please check your username and password.')
    }
    setLoading(false)
  }

  return (
    // BACKGROUND: Soft Slate Gray (Aankhon ke liye thanda aur distinct)
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-200 font-sans">
      
      {/* Login Card Container */}
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* CARD: Pure White (Solid contrast) */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
          
          {/* Header Section */}
          <div className="p-8 sm:p-10 pb-6 text-center bg-slate-50 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-600/30 rotate-3">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white -rotate-3" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">MEIJI TOURS</h1>
            <p className="text-indigo-600 text-[10px] sm:text-xs mt-2 uppercase tracking-[0.2em] font-bold">Secure Admin Portal</p>
          </div>

          {/* Form Section */}
          <div className="p-8 sm:p-10 pt-6">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Admin ID</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="Enter username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 text-sm sm:text-base uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info below card */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-slate-500 text-[10px] sm:text-xs font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} Meiji Tours LLC. | meijitours.com
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs font-medium">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}
