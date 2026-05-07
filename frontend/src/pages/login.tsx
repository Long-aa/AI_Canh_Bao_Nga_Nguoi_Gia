import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, Phone, User } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <>
      <Head>
        <title>Đăng nhập - SafeGuard AI</title>
        <meta name="description" content="Hệ thống giám sát thông minh ứng dụng AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left Column - Blue Background */}
        <div className="flex-1 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Circular decoration */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 text-center text-white max-w-md">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-2">SafeGuard AI</h1>
            <p className="text-xl mb-8 opacity-90">Giám sát an toàn, chăm sóc tận tâm.</p>
            
            <p className="text-base leading-relaxed opacity-80">
              Hệ thống giám sát thông minh ứng dụng AI, mang lại sự an tâm tuyệt đối cho bạn và gia đình trong việc chăm sóc người cao tuổi.
            </p>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập hệ thống</h2>
            <p className="text-gray-600 mb-8">Vui lòng nhập thông tin để truy cập bảng điều khiển.</p>

            <form className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="nhap.email@vi_du.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Đăng nhập
              </button>
            </form>

            {/* Support */}
            <div className="mt-8 flex items-center justify-center text-gray-500">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">Hỗ trợ kỹ thuật: liên hệ quản trị viên</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
