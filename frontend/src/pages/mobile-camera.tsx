import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Camera, Smartphone, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react'
import axios from 'axios'

const MobileCamera = () => {
  const router = useRouter()
  const { session } = router.query
  const [status, setStatus] = useState<'welcome' | 'requesting' | 'streaming' | 'error' | 'paired'>('welcome')
  const [error, setError] = useState('')
  const [phoneInfo, setPhoneInfo] = useState({ model: '', battery: '' })
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Detect phone model
    const ua = navigator.userAgent
    let model = 'Thiết bị di động'
    if (ua.includes('iPhone')) model = 'iPhone'
    else if (ua.includes('Android')) model = 'Android Device'
    setPhoneInfo(prev => ({ ...prev, model }))
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use back camera by default
        audio: false 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setStatus('paired')
      
      // Notify backend that this phone is now a camera
      const API_URL = 'http://' + window.location.hostname + ':8001/api/mobile/pair'
      await axios.post(API_URL, {
        session_id: session,
        phone_model: navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Android Phone',
        camera_id: 'MOBILE-' + Math.random().toString(36).substr(2, 9)
      })
      
      setStatus('streaming')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setError(err.message || 'Không thể truy cập camera')
    }
  }

  const handleStart = () => {
    setStatus('requesting')
    startCamera()
  }

  if (status === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50" />
        <div className="relative space-y-8 max-w-sm w-full">
          <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-600/40 mx-auto animate-bounce-slow">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Kết nối Camera</h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Sử dụng điện thoại của bạn như một thiết bị giám sát AI chuyên nghiệp trong hệ thống SafeGuard.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <span className="text-slate-500">Thiết bị</span>
              <span className="text-blue-400">{phoneInfo.model}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <span className="text-slate-500">Phiên làm việc</span>
              <span className="text-white font-mono">{String(session || 'N/A').substr(0, 8)}</span>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            Bắt đầu kết nối
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-white text-xl font-bold">Lỗi Session</h1>
          <p className="text-slate-400">Vui lòng quét lại mã QR từ máy tính.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Video Viewport */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* UI Overlay */}
        <div className="absolute inset-x-0 top-0 p-8 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-sm tracking-tight uppercase">SafeGuard Mobile</h1>
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Streaming
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
              <span className="text-white font-mono text-xs font-bold tracking-widest">SESSION: {String(session).substr(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-4">
          {status === 'streaming' ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl backdrop-blur-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-white font-bold text-sm">Đã kết nối với máy tính</span>
              </div>
              <p className="text-slate-400 text-xs font-medium">Bạn có thể thu nhỏ trình duyệt, camera vẫn đang hoạt động</p>
            </div>
          ) : status === 'requesting' ? (
            <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-xl">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-white font-bold text-sm">Đang thiết lập camera...</span>
            </div>
          ) : status === 'error' ? (
            <div className="flex items-center gap-3 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-white font-bold text-sm">{error}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default MobileCamera
