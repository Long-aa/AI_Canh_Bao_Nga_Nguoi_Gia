import React, { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Camera, 
  Smartphone, 
  Monitor, 
  Globe, 
  Shield, 
  Cpu, 
  Wifi, 
  Server,
  ChevronRight,
  Info,
  CheckCircle2,
  Loader2,
  Upload,
  Film
} from 'lucide-react'
import { createDevice, getMobileSession, getMobileStatus, uploadDeviceVideo } from '../services/api'
import { QRCodeSVG } from 'qrcode.react'

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
}

type DeviceType = 'ip_camera' | 'webcam' | 'mobile' | 'upload_video'

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const [activeType, setActiveType] = useState<DeviceType>('ip_camera')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    location: '',
    model: 'IP Camera',
    ip: '',
    username: 'admin',
    password: '',
    port: 554,
    channel: '1',
    stream_url: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mobileSession, setMobileSession] = useState<{session_id: string, local_ip: string, pair_url: string} | null>(null)
  const [pairingStatus, setPairingStatus] = useState<'pending' | 'paired' | 'failed'>('pending')
  const [mobileFrame, setMobileFrame] = useState<string | null>(null)
  const [manualIp, setManualIp] = useState('')
  const [isManualMode, setIsManualMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeType === 'mobile' && step === 2 && mobileSession && pairingStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const status = await getMobileStatus(mobileSession.session_id)
          if (status.status === 'paired') {
            setPairingStatus('paired')
            setMobileSession(prev => prev ? { ...prev, device_id: status.device_id } : null)
            
            // Setup preview stream
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
            const wsUrl = `${protocol}//${hostname}:8001/ws/view/${status.device_id}`;
            console.log("Connecting to preview WS:", wsUrl);
            const ws = new WebSocket(wsUrl);
            ws.onmessage = (event) => {
              setMobileFrame(event.data);
            };
            ws.onopen = () => console.log("Preview WS connected");
            ws.onerror = (e) => console.error("Preview WS error:", e);
            
            clearInterval(interval)
          }
        } catch (error) {
          console.error("Error checking pairing status:", error)
        }
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [activeType, step, mobileSession, pairingStatus])

  const initMobileSession = async () => {
    try {
      const session = await getMobileSession()
      setMobileSession(session)
      setPairingStatus('pending')
    } catch (error) {
      console.error("Error initializing mobile session:", error)
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error("Video play error:", e))
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setFormData({
        ...formData,
        name: 'Webcam Máy tính',
        model: 'Integrated Webcam',
        id: `CAM-WEB-${Math.floor(Math.random() * 1000)}`
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Không thể truy cập camera. Vui lòng cấp quyền.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (activeType === 'upload_video') {
        if (!selectedFile) {
          alert("Vui lòng chọn một file video để tải lên.")
          setIsSubmitting(false)
          return
        }
        
        const form = new FormData()
        form.append('device_id', formData.id || `DEV-VID-${Math.floor(Math.random() * 1000)}`)
        form.append('name', formData.name)
        form.append('location', formData.location)
        form.append('model', formData.model || 'Video AI Processor')
        form.append('video', selectedFile)
        
        await uploadDeviceVideo(form)
      } else {
        // Build RTSP URL if not provided manually
        let streamUrl = formData.stream_url
        if (!streamUrl && formData.ip && activeType === 'ip_camera') {
          streamUrl = `rtsp://${formData.username}:${formData.password}@${formData.ip}:${formData.port}/Streaming/Channels/${formData.channel}01`
        }
        await createDevice({
          device_id: formData.id || `DEV-${Math.floor(Math.random() * 1000)}`,
          name: formData.name,
          location: formData.location,
          model: formData.model,
          status: 'offline',
          stream_url: streamUrl || undefined,
          camera_type: activeType
        })
      }
      onClose()
      window.location.reload()
    } catch (error: any) {
      console.error("Error creating device:", error)
      const detail = error.response?.data?.detail || "ID thiết bị đã tồn tại hoặc có lỗi xảy ra."
      alert(detail)
    } finally {
      setIsSubmitting(false)
    }
  }


  const cameraBrands = [
    { name: 'Hikvision', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Hikvision_logo.svg/2560px-Hikvision_logo.svg.png' },
    { name: 'Dahua', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Dahua_Technology_logo.svg/1280px-Dahua_Technology_logo.svg.png' },
    { name: 'KBVision', logo: 'https://kbvision.vn/wp-content/uploads/2017/04/Logo-KBVISION.png' },
    { name: 'Ezviz', logo: 'https://ezvizvietnam.vn/wp-content/uploads/2020/05/logo-ezviz.png' },
    { name: 'Imou', logo: 'https://imou.vn/wp-content/uploads/2020/07/logo-imou.png' },
    { name: 'UNV', logo: 'https://www.uniview.com/res/201905/27/20190527_1013444_image_873523_0.png' },
  ]

  if (!isOpen) return null

  const renderTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <button 
        onClick={() => { setActiveType('ip_camera'); setStep(2); }}
        className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all group ${activeType === 'ip_camera' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'ip_camera' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Camera className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Camera IP</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Kết nối với các hãng camera (Hikvision, Dahua, KBVision...)</p>
      </button>

      <button 
        onClick={() => { setActiveType('webcam'); setStep(2); }}
        className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all group ${activeType === 'webcam' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'webcam' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Monitor className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Webcam</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Sử dụng camera tích hợp hoặc USB webcam của máy tính</p>
      </button>

      <button 
        onClick={() => { setActiveType('mobile'); setStep(2); initMobileSession(); }}
        className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all group ${activeType === 'mobile' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'mobile' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Smartphone className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Điện thoại</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Kết nối với điện thoại Android hoặc iOS qua ứng dụng</p>
      </button>

      <button 
        onClick={() => { setActiveType('upload_video'); setStep(2); }}
        className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all group ${activeType === 'upload_video' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'upload_video' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Tải lên Video</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Tải video từ máy tính để phân tích và phát hiện ngã bằng AI</p>
      </button>
    </div>
  )


  const renderIPCameraForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cameraBrands.map((brand) => (
          <button key={brand.name} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-blue-200 hover:shadow-md transition-all h-16">
            <span className="font-bold text-slate-400 text-xs">{brand.name}</span>
          </button>
        ))}
        <button className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all text-xs font-bold">
          Hãng khác
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Tên thiết bị</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ví dụ: Camera Phòng Khách" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">ID Thiết bị (Mã định danh)</label>
          <input 
            type="text" 
            value={formData.id}
            onChange={(e) => setFormData({...formData, id: e.target.value})}
            placeholder="Ví dụ: CAM-001" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Vị trí lắp đặt</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Ví dụ: Hành lang tầng 2" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ IP / Domain</label>
          <input 
            type="text" 
            value={formData.ip}
            onChange={(e) => setFormData({...formData, ip: e.target.value})}
            placeholder="192.168.1.10" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-bold text-slate-700 ml-1">URL RTSP (tùy chọn — điền thay thế IP nếu muốn tùy chỉnh)</label>
          <input 
            type="text" 
            value={formData.stream_url}
            onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
            placeholder="rtsp://admin:pass@192.168.1.10:554/stream1" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium font-mono text-sm" 
          />
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
        <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">Lưu ý về RTSP</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed font-medium">Đảm bảo camera đã được bật giao thức RTSP và cổng 554 (mặc định) đã được mở hoặc forward nếu kết nối từ xa.</p>
        </div>
      </div>
    </div>
  )

  const renderWebcamForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 aspect-video rounded-3xl relative overflow-hidden flex items-center justify-center group shadow-2xl shadow-slate-900/20">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Camera className="w-16 h-16 text-slate-700 group-hover:text-slate-400 transition-colors z-0" />
            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={startCamera}
                className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-all"
              >
                Kích hoạt Camera
              </button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Tên camera</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ví dụ: Webcam Laptop" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">ID Thiết bị</label>
          <input 
            type="text" 
            value={formData.id}
            onChange={(e) => setFormData({...formData, id: e.target.value})}
            placeholder="CAM-WEB-001" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
      </div>
    </div>
  )

  const renderMobileForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="shrink-0 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative">
             {pairingStatus === 'paired' ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  {mobileFrame ? (
                    <img src={mobileFrame} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                       <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                       <span className="text-[10px] text-slate-500 font-bold uppercase">Đang nhận luồng...</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/80 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest">
                    Live Preview
                  </div>
                </div>
             ) : mobileSession ? (
               <QRCodeSVG 
                 value={`http://${isManualMode ? manualIp : mobileSession.local_ip}:8001/api/mobile/mobile-camera?session=${mobileSession.session_id}`} 
                 size={160}
                 level="H"
               />
             ) : (
               <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             )}
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
            {pairingStatus === 'paired' ? (
               <div className="text-emerald-500 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ghép đôi thành công</span>
               </div>
            ) : (
              <div className="space-y-2">
                <div>Quét mã để kết nối</div>
                <div className="text-blue-500 font-mono lowercase">
                  {isManualMode ? manualIp : mobileSession?.local_ip}:3000
                </div>
                <button 
                  onClick={() => {
                    setIsManualMode(!isManualMode);
                    if (!isManualMode) setManualIp(mobileSession?.local_ip || '');
                  }}
                  className="text-[9px] text-slate-500 underline hover:text-blue-600 transition-colors"
                >
                  {isManualMode ? 'Dùng IP tự động' : 'Nhập IP thủ công'}
                </button>
                {isManualMode && (
                  <input 
                    type="text"
                    value={manualIp}
                    onChange={(e) => setManualIp(e.target.value)}
                    placeholder="Ví dụ: 192.168.1.10"
                    className="w-full mt-2 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-center focus:outline-none focus:border-blue-500 font-mono"
                  />
                )}
              </div>
            )}
          </p>
        </div>
         <div className="space-y-6">
          {pairingStatus === 'paired' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Xác nhận thiết bị</h3>
                  <p className="text-slate-500 text-sm font-medium">Kiểm tra thông tin trước khi hoàn tất đăng ký.</p>
               </div>
               
               <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Thiết bị</span>
                     <span className="text-sm font-black text-slate-900 font-mono">{(mobileSession as any)?.device_id}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí mặc định</span>
                     <span className="text-sm font-black text-blue-600">Mobile Camera</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái AI</span>
                     <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Ready to process
                     </span>
                  </div>
               </div>
               
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                     Bạn có thể thay đổi tên và vị trí thiết bị bất cứ lúc nào trong cài đặt.
                  </p>
               </div>
            </div>
          ) : (
            <>
              <h4 className="text-xl font-extrabold text-slate-900">
                Kết nối điện thoại làm Camera AI
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-blue-100 text-blue-600">1</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Tải ứng dụng SafeGuard Mobile</p>
                    <p className="text-xs text-slate-500 font-medium">Có sẵn trên App Store (iOS) và Play Store (Android)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-blue-100 text-blue-600">2</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Mở ứng dụng và chọn "Kết nối Edge"</p>
                    <p className="text-xs text-slate-500 font-medium">Đảm bảo điện thoại và máy tính cùng mạng Wifi</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-blue-100 text-blue-600">3</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Quét mã QR ở bên trái</p>
                    <p className="text-xs text-slate-500 font-medium">Thiết bị sẽ tự động được đăng ký vào hệ thống</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                      <Smartphone className="w-4 h-4" /> App Store
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                      <Smartphone className="w-4 h-4" /> Google Play
                  </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderUploadVideoForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Tên thiết bị (Video)</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ví dụ: Video Test 1" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">ID Thiết bị (Mã định danh)</label>
          <input 
            type="text" 
            value={formData.id}
            onChange={(e) => setFormData({...formData, id: e.target.value})}
            placeholder="Ví dụ: DEV-VID-001" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Vị trí trong video</label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Ví dụ: Hành lang nhà chung cư" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Kiểu mô hình (Model)</label>
          <input 
            type="text" 
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            placeholder="Ví dụ: Video Offline AI" 
            className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" 
          />
        </div>
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">Chọn File Video (.mp4, .avi, .mkv, .mov)</label>
        <div 
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setSelectedFile(file);
                const randId = `VID-${Math.floor(Math.random() * 900) + 100}`;
                setFormData(prev => ({
                  ...prev,
                  name: prev.name || `Video: ${file.name.split('.')[0]}`,
                  id: prev.id || randId,
                  location: prev.location || 'Phòng Khách Cụ',
                  model: 'Video Offline AI'
                }));
              }
            };
            input.click();
          }}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 p-10 rounded-[32px] cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-100/50 text-slate-400 group-hover:text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-colors">
            <Film className="w-8 h-8" />
          </div>
          {selectedFile ? (
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng để tải lên
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-bold text-slate-800 mb-1">Nhấn để chọn video từ máy tính</p>
              <p className="text-xs text-slate-400 font-medium">Hỗ trợ các định dạng video chuẩn để AI quét phát hiện ngã</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-slate-50 rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Header */}
        <div className="relative h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step === 2 && (
              <button 
                onClick={() => { setStep(1); stopCamera(); setSelectedFile(null); }}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng ký thiết bị mới</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                {step === 1 ? 'Chọn loại thiết bị' : activeType === 'ip_camera' ? 'Cấu hình Camera IP' : activeType === 'webcam' ? 'Cấu hình Webcam' : activeType === 'mobile' ? 'Kết nối điện thoại' : 'Tải lên Video'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 max-h-[70vh] overflow-y-auto">
          {step === 1 ? renderTypeSelection() : (
            activeType === 'ip_camera' ? renderIPCameraForm() : 
            activeType === 'webcam' ? renderWebcamForm() : 
            activeType === 'mobile' ? renderMobileForm() : renderUploadVideoForm()
          )}
        </div>


        {/* Footer */}
        {step === 2 && (
          <div className="p-8 bg-white border-t border-slate-100 px-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">SafeGuard Protection</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3.5 text-slate-500 font-bold text-sm hover:text-slate-900 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  if (pairingStatus === 'paired') {
                    onClose();
                    window.location.reload();
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all font-bold text-sm shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (pairingStatus === 'paired' ? 'Xong' : 'Hoàn tất đăng ký')}
                {!isSubmitting && <CheckCircle2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddDeviceModal
