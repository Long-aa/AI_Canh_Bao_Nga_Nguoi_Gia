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

interface DeviceLiveViewModalProps {
  device: any
  isOpen: boolean
  onClose: () => void
}

const DeviceLiveViewModal: React.FC<DeviceLiveViewModalProps> = ({ device, isOpen, onClose }) => {
  const [isAiEnabled, setIsAiEnabled] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [logs, setLogs] = useState([
    { id: 1, time: '13:45:22', type: 'info', message: 'Hệ thống AI đã sẵn sàng' },
    { id: 2, time: '13:45:25', type: 'detect', message: 'Phát hiện người: Khu vực A' },
    { id: 3, time: '13:46:10', type: 'warning', message: 'Cảnh báo: Đối tượng tiếp cận vùng cấm' },
    { id: 4, time: '13:47:05', type: 'info', message: 'Cập nhật tọa độ di chuyển' },
    { id: 5, time: '13:48:30', type: 'detect', message: 'Phát hiện người: Hành lang' },
  ])
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mobileFrame, setMobileFrame] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (isOpen && device) {
      const isMobile = device.device_id?.startsWith('MOBILE-') || device.id?.startsWith('MOBILE-')
      const isWebcam = device.model?.toLowerCase().includes('webcam') || device.id?.toLowerCase().includes('web')

      if (isWebcam) {
        const startCamera = async () => {
          try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
            setStream(mediaStream)
          } catch (error) {
            console.error("Error accessing camera:", error)
          }
        }
        startCamera()
      } else if (isMobile) {
        // Connect to WebSocket stream
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
        const wsUrl = `${protocol}//${hostname}:8001/ws/view/${device.device_id || device.id}`;
        
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onmessage = (event) => {
          setMobileFrame(event.data);
        };
        wsRef.current.onerror = (error) => console.error("WS Streaming Error:", error);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      setMobileFrame(null)
    }
  }, [isOpen, device])

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
          <div className="flex-1 relative bg-black flex items-center justify-center group overflow-hidden">
             {/* Video Feed */}
             <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                {stream ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : mobileFrame ? (
                  <img 
                    src={mobileFrame} 
                    className="w-full h-full object-contain" 
                    alt="Mobile Stream" 
                  />
                ) : (
                  <>
                    {/* Background image placeholder */}
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                       <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    </div>
                    <div className="text-center">
                       <Activity className="w-20 h-20 text-slate-800 mb-4 mx-auto animate-pulse" />
                       <p className="text-slate-600 font-bold tracking-widest uppercase text-sm">Đang tải luồng video...</p>
                    </div>
                  </>
                )}
             </div>

             {/* AI Overlay Bounding Boxes (Simulated) */}
             {isAiEnabled && isPlaying && (
                <>
                  <div className="absolute top-1/4 left-1/3 w-48 h-80 border-2 border-blue-500 rounded-lg animate-pulse">
                     <div className="absolute -top-7 left-0 bg-blue-500 text-white px-2 py-0.5 text-[10px] font-bold rounded-t-md flex items-center gap-1">
                        <User className="w-3 h-3" /> PERSON: 98.2%
                     </div>
                  </div>
                  <div className="absolute top-2/3 right-1/4 w-32 h-32 border-2 border-emerald-500 rounded-lg">
                     <div className="absolute -top-7 left-0 bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-bold rounded-t-md">
                        CHAIR: 92.5%
                     </div>
                  </div>
                  {/* AI Skeleton points (Simulated) */}
                  <div className="absolute top-[35%] left-[40%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
                  <div className="absolute top-[40%] left-[42%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
                  <div className="absolute top-[45%] left-[38%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
                </>
             )}

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
                <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all">
                   <Layers className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:bg-white/10 rounded-xl transition-all">
                   <Maximize2 className="w-5 h-5" />
                </button>
             </div>

             {/* Timestamp */}
             <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-white font-mono text-sm tracking-widest font-bold">2024-05-08 13:48:45</span>
             </div>
          </div>

          {/* Right: Activity & History Sidebar */}
          <div className="w-[400px] bg-slate-900/50 border-l border-white/5 flex flex-col shrink-0">
             {/* Tabs Header */}
             <div className="flex border-b border-white/5">
                <button className="flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] text-blue-400 border-b-2 border-blue-500 bg-blue-500/5">
                   Hoạt động
                </button>
                <button className="flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors">
                   Lịch sử AI
                </button>
             </div>

             {/* Log Content */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="group relative flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all">
                     <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        log.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
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
                ))}
             </div>

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
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2">
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
