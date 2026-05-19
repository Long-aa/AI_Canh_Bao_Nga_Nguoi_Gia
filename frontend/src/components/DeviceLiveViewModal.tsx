import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Activity,
  Clock,
  Shield,
  Maximize2,
  Settings,
  Pause,
  Play,
  Volume2,
  Zap,
  User,
  AlertTriangle,
  History,
  Info,
  Layers,
  Cpu
} from 'lucide-react'

import api from '../services/api'

interface DeviceLiveViewModalProps {
  device: any
  isOpen: boolean
  onClose: () => void
}

// Extract BACKEND_URL dynamically to avoid hardcoding!
const BACKEND_URL = api.defaults.baseURL || 'https://unmade-backed-willed.ngrok-free.dev'
const BACKEND_HOST = BACKEND_URL.replace('https://', '').replace('http://', '')
const WS_PROTOCOL = BACKEND_URL.startsWith('https') ? 'wss:' : 'ws:'

const DeviceLiveViewModal: React.FC<DeviceLiveViewModalProps> = ({ device, isOpen, onClose }) => {
  const [isAiEnabled, setIsAiEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [logs, setLogs] = useState([
    { id: 1, time: '00:00:00', type: 'info', message: 'Hệ thống AI đã sẵn sàng' },
  ])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mobileFrame, setMobileFrame] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'activity' | 'history'>('activity')
  const [showSettings, setShowSettings] = useState(false)
  const [deviceStatus, setDeviceStatus] = useState(device?.status)
  const [processedVideoUrl, setProcessedVideoUrl] = useState(device?.stream_url)
  const [progress, setProgress] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const producerWsRef = useRef<WebSocket | null>(null)

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (device) {
      setDeviceStatus(device.status)
      setProcessedVideoUrl(device.stream_url)
      setProgress(null)
    }
  }, [device])

  useEffect(() => {
    const isUploadVideo = (device?.camera_type || 'ip_camera') === 'upload_video'
    if (isUploadVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, device, deviceStatus])


  const formattedTime = currentTime.getFullYear() + '-' +
    String(currentTime.getMonth() + 1).padStart(2, '0') + '-' +
    String(currentTime.getDate()).padStart(2, '0') + ' ' +
    String(currentTime.getHours()).padStart(2, '0') + ':' +
    String(currentTime.getMinutes()).padStart(2, '0') + ':' +
    String(currentTime.getSeconds()).padStart(2, '0');

  const addLog = (type: string, message: string) => {
    setLogs(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      type, message
    }, ...prev.slice(0, 49)])
  }

  const connectViewerWs = (deviceId: string) => {
    const wsUrl = `${WS_PROTOCOL}//${BACKEND_HOST}/ws/view/${deviceId}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'frame' && isPlaying) {
          setMobileFrame(payload.data)
          setStreamStatus('live')
        } else if (payload.type === 'alert') {
          addLog(payload.level || 'warning', payload.message)
        } else if (payload.type === 'error') {
          setErrorMsg(payload.message)
          setStreamStatus('error')
        }
      } catch {
        if (isPlaying && typeof event.data === 'string') setMobileFrame(event.data)
      }
    }
    ws.onerror = () => { setStreamStatus('error'); setErrorMsg('Lỗi kết nối WebSocket') }
  }

  const connectUploadWs = (deviceId: string) => {
    const wsUrl = `${WS_PROTOCOL}//${BACKEND_HOST}/ws`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'device_progress' && payload.device_id === deviceId) {
          setProgress(payload.progress)
          setStreamStatus('connecting')
        } else if (payload.type === 'device_status' && payload.device_id === deviceId && payload.status === 'online') {
          setDeviceStatus('online')
          setProcessedVideoUrl(payload.stream_url)
          setStreamStatus('live')
          setProgress(null)
          addLog('info', 'Xử lý video hoàn tất! Bắt đầu phát lại video.')
        } else if (payload.type === 'fall_alert' && payload.data?.camera_id === deviceId) {
          addLog('danger', `🚨 CẢNH BÁO: Phát hiện người Ngã trong video tại ${payload.data.location || 'đây'}!`)
        }
      } catch (err) {
        console.error("WS error parse:", err)
      }
    }
    ws.onerror = () => { 
      console.error("Upload WS error") 
    }
  }

  useEffect(() => {
    if (!isOpen || !device) return
    setStreamStatus('connecting')
    setErrorMsg(null)
    setMobileFrame(null)

    const deviceId = device.device_id || device.id
    const cameraType = device.camera_type || 'ip_camera'
    const isMobile = cameraType === 'mobile' || deviceId?.startsWith('MOBILE-')
    const isWebcam = cameraType === 'webcam' || device.model?.toLowerCase().includes('webcam')
    const isUploadVideo = cameraType === 'upload_video'

    if (isUploadVideo) {
      if (deviceStatus === 'online') {
        setStreamStatus('live')
      } else {
        setStreamStatus('connecting')
      }
      connectUploadWs(deviceId)
    } else if (isWebcam) {
      // Webcam máy tính: frontend capture → backend AI → viewer WS
      const startWebcam = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
          setStream(mediaStream)
          const producerUrl = `${WS_PROTOCOL}//${BACKEND_HOST}/ws/stream/${deviceId}`
          const viewUrl = `${WS_PROTOCOL}//${BACKEND_HOST}/ws/view/${deviceId}`
          producerWsRef.current = new WebSocket(producerUrl)
          connectViewerWs(deviceId)

          const captureLoop = setInterval(() => {
            if (isPlaying && producerWsRef.current?.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current
              const ctx = canvas.getContext('2d')
              if (ctx) {
                canvas.width = 640; canvas.height = 480
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                producerWsRef.current.send(canvas.toDataURL('image/jpeg', 0.5))
              }
            }
          }, 100)
          return () => clearInterval(captureLoop)
        } catch (err) {
          setStreamStatus('error')
          setErrorMsg('Không thể truy cập webcam')
        }
      }
      startWebcam()
    } else if (isMobile) {
      // Mobile: chỉ nhận stream từ view WS
      connectViewerWs(deviceId)
    } else {
      // Camera ngoài (IP Camera / RTSP): backend mở camera, ta chỉ xem
      const startExternal = async () => {
        try {
          addLog('info', `Đang kết nối camera ngoài: ${device.location}...`)
          const res = await fetch(`${BACKEND_URL}/api/camera/${deviceId}/start`, {
            method: 'POST',
            headers: { 'ngrok-skip-browser-warning': 'true' }
          })
          const data = await res.json()
          if (res.ok) {
            addLog('info', `Backend đã mở camera: ${data.stream_url || deviceId}`)
            connectViewerWs(deviceId)
          } else {
            setStreamStatus('error')
            setErrorMsg(data.detail || 'Không thể khởi động camera')
          }
        } catch (err) {
          setStreamStatus('error')
          setErrorMsg('Lỗi kết nối tới backend')
        }
      }
      startExternal()
    }

    return () => {
      stream?.getTracks().forEach(t => t.stop())
      wsRef.current?.close()
      producerWsRef.current?.close()
      setMobileFrame(null)
      setStreamStatus('idle')
      // Stop external camera on backend when modal closes
      const camType = device.camera_type || 'ip_camera'
      const devId = device.device_id || device.id
      if (camType !== 'webcam' && camType !== 'upload_video' && !devId?.startsWith('MOBILE-')) {
        fetch(`${BACKEND_URL}/api/camera/${devId}/stop`, {
          method: 'POST',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }).catch(() => {})
      }
    }
  }, [isOpen, device, deviceStatus])


  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  if (!isOpen || !device) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[95vw] h-[90vh] bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-white/10">
        {/* Header */}
        <div className="h-20 bg-slate-900/50 border-b border-white/5 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white tracking-tight">{device.location}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                ID: {device.id} • Model: {device.model} • IP: 192.168.1.10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-8 mr-8 px-8 py-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">FPS</p>
                <p className="text-sm font-black text-white">30.2</p>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Latency</p>
                <p className="text-sm font-black text-blue-400">45ms</p>
              </div>
              <div className="w-px h-6 bg-white/10"></div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Resolution</p>
                <p className="text-sm font-black text-white">1080p</p>
              </div>
            </div>

            <button
              onClick={() => setIsAiEnabled(!isAiEnabled)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${isAiEnabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
              <Zap className={`w-4 h-4 ${isAiEnabled ? 'fill-current' : ''}`} />
              <span>AI Mode: {isAiEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Video Player */}
          <div
            ref={containerRef}
            className="flex-1 relative bg-black flex items-center justify-center group overflow-hidden"
          >
            {/* Video Feed */}
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              {device.camera_type === 'upload_video' ? (
                deviceStatus === 'processing' ? (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                      <Cpu className="absolute inset-0 m-auto w-10 h-10 text-blue-400 animate-bounce" />
                    </div>
                    <div className="max-w-md space-y-2">
                      <h3 className="text-lg font-black text-white">Đang phân tích Video bằng AI</h3>
                      <p className="text-slate-400 text-xs font-medium">
                        Hệ thống AI đang trích xuất khung xương, phát hiện khuôn mặt và nhận diện hành vi ngã...
                      </p>
                    </div>
                    
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-blue-400 uppercase tracking-wider">Tiến độ phân tích</span>
                        <span className="text-white">{progress !== null ? `${progress}%` : 'Đang chuẩn bị...'}</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
                          style={{ width: `${progress || 10}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                      Video đã xử lý AI sẽ tự động phát lại khi hoàn tất
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={processedVideoUrl ? `${BACKEND_URL}${processedVideoUrl}` : ''}
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <>
                  {/* Luôn giữ thẻ <video> trong DOM để tiếp tục trích xuất frame, chỉ ẩn/hiện bằng CSS */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${stream && (!isAiEnabled || !mobileFrame) ? 'block' : 'hidden'}`}
                  />

                  {/* Chỉ hiện AI Stream khi đang bật AI và đã có ảnh */}
                  {isAiEnabled && mobileFrame && (
                    <img
                      src={mobileFrame}
                      className="w-full h-full object-contain"
                      alt="AI Stream"
                    />
                  )}

                  {/* Placeholder khi chưa tải xong */}
                  {!stream && !mobileFrame && (
                    <>
                      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                      </div>
                      <div className="text-center space-y-4">
                        {streamStatus === 'error' ? (
                          <>
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                              <AlertTriangle className="w-10 h-10 text-red-400" />
                            </div>
                            <p className="text-red-400 font-bold text-sm">{errorMsg || 'Lỗi kết nối'}</p>
                            <p className="text-slate-600 text-xs">Kiểm tra URL camera hoặc kết nối mạng</p>
                          </>
                        ) : (
                          <>
                            <div className="relative w-20 h-20 mx-auto">
                              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                              <Activity className="absolute inset-0 m-auto w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                              {streamStatus === 'connecting' ? 'Đang kết nối camera...' : 'Đang tải luồng video...'}
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 text-white hover:bg-white/10 rounded-xl transition-all">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all">
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <button
                onClick={() => setIsAiEnabled(!isAiEnabled)}
                className={`p-2 rounded-xl transition-all ${isAiEnabled ? 'text-blue-400 bg-blue-500/20' : 'text-white hover:bg-white/10'}`}
              >
                <Layers className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    containerRef.current?.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Timestamp */}
            <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-white font-mono text-sm tracking-widest font-bold">{formattedTime}</span>
            </div>
          </div>

          {/* Right: Activity & History Sidebar */}
          <div className="w-[400px] bg-slate-900/50 border-l border-white/5 flex flex-col shrink-0">
            {showSettings ? (
              // Cấu hình nâng cao
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Cấu hình nâng cao</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Độ nhạy AI (Confidence)</label>
                    <input type="range" min="0" max="100" defaultValue="60" className="w-full accent-blue-500" />
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Cao</span>
                      <span>Thấp</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chế độ phân tích</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all">Khung xương</button>
                      <button className="py-2.5 bg-white/5 text-slate-400 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Hộp bao (Box)</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cảnh báo tự động</label>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-sm font-bold text-white">Gửi SMS cho người thân</span>
                      <div className="w-10 h-6 bg-blue-500 rounded-full flex items-center px-1 justify-end shadow-lg shadow-blue-500/20 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Tabs & Logs
              <>
                {/* Tabs Header */}
                <div className="flex border-b border-white/5">
                  <button 
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${activeTab === 'activity' ? 'text-blue-400 border-blue-500 bg-blue-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    Hoạt động
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-colors border-b-2 ${activeTab === 'history' ? 'text-amber-400 border-amber-500 bg-amber-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                  >
                    Lịch sử AI
                  </button>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {logs.filter(log => activeTab === 'activity' || log.type === 'warning').length === 0 ? (
                    <div className="text-center py-10">
                      <Shield className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chưa có dữ liệu</p>
                    </div>
                  ) : (
                    logs.filter(log => activeTab === 'activity' || log.type === 'warning').map((log) => (
                      <div key={log.id} className={`group relative flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all ${log.type === 'warning' ? 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' : ''}`}>
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${log.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                            log.type === 'detect' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                          {log.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                            log.type === 'detect' ? <User className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-slate-500 tracking-widest">{log.time}</span>
                            <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors uppercase">Details</span>
                          </div>
                          <p className={`text-sm font-bold ${log.type === 'warning' ? 'text-amber-200' : 'text-slate-200'}`}>{log.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Device Info Card (Bottom of Sidebar) */}
            <div className="p-6 bg-slate-950/50 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái Edge</h4>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Hoạt động tốt
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">CPU</span>
                  </div>
                  <p className="text-sm font-black text-white">45%</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Secure</span>
                  </div>
                  <p className="text-sm font-black text-white">Encrypted</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" /> Cấu hình nâng cao
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceLiveViewModal
