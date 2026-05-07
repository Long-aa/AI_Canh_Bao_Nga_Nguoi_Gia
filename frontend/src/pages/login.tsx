import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Eye, EyeOff, Mail, Lock, Phone, AlertTriangle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Mock login logic
    setTimeout(() => {
      if (email === 'admin@safeguard.ai' && password === 'admin123') {
        router.push('/dashboard')
      } else {
        setError('Email hoặc mật khẩu không chính xác.')
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <>
      <Head>
        <title>Đăng nhập - SafeGuard AI</title>
        <meta name="description" content="Hệ thống giám sát thông minh ứng dụng AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
        {/* Left Column - Premium Branding */}
        <div className="lg:flex-1 bg-[#0f172a] flex items-center justify-center p-8 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full opacity-20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full opacity-10 blur-[150px]"></div>
          
          <div className="relative z-10 text-center text-white max-w-lg">
            {/* Logo with Glow */}
            <div className="flex items-center justify-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 transform hover:rotate-6 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">SafeGuard <span className="text-blue-400">AI</span></h1>
            <p className="text-2xl mb-10 font-light text-slate-300">Hệ thống giám sát & cảnh báo ngã thông minh</p>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-blue-400 font-bold mb-1">99.9%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Độ chính xác</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-green-400 font-bold mb-1">&lt; 1s</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Tốc độ phản hồi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="lg:w-[40%] bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Chào mừng trở lại</h2>
              <p className="text-slate-500">Đăng nhập để quản lý hệ thống giám sát của bạn.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex items-center">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email quản trị</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="admin@safeguard.ai"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Quên mật khẩu?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 active:transform active:scale-[0.98] transition-all font-bold shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Đăng nhập hệ thống"}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center text-slate-400">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium uppercase tracking-widest">Hỗ trợ kỹ thuật: 1900 8888</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
