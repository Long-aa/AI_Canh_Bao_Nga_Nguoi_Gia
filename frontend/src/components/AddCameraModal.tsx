import React, { useState } from 'react'
import { 
  X, 
  Camera, 
  Monitor, 
  Smartphone, 
  Globe, 
  Cpu, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react'

interface AddCameraModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  if (!isOpen) return null

  const cameraTypes = [
    { 
      id: 'brand', 
      title: 'Camera An ninh (IP/ONVIF)', 
      desc: 'Kết nối Hikvision, Dahua, Ezviz, UNV...', 
      icon: Camera,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      id: 'webcam', 
      title: 'Camera Máy tính (Webcam)', 
      desc: 'Sử dụng camera tích hợp hoặc USB', 
      icon: Monitor,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      id: 'phone', 
      title: 'Điện thoại (Android/iOS)', 
      desc: 'Biến điện thoại thành camera giám sát', 
      icon: Smartphone,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    { 
      id: 'rtsp', 
      title: 'Luồng RTSP/HTTP', 
      desc: 'Kết nối qua địa chỉ URL trực tiếp', 
      icon: Globe,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    }
  ]

  const handleTypeSelect = (id: string) => {
    setSelectedType(id)
    setStep(2)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kết nối Camera mới</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Chọn phương thức kết nối phù hợp với thiết bị của bạn</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameraTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="flex flex-col p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-3xl text-left hover:border-blue-500 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                  >
                    <div className={`${type.bg} ${type.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{type.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{type.desc}</p>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Tiếp tục <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-bold flex items-center"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Quay lại
                </button>
                <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-blue-600"></div>
                </div>
              </div>

              {selectedType === 'brand' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tên Camera</label>
                      <input 
                        type="text" 
                        placeholder="VD: Camera Sân trước"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Hãng sản xuất</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all dark:text-white font-medium appearance-none">
                        <option>Hikvision</option>
                        <option>Dahua</option>
                        <option>Ezviz</option>
                        <option>Imou</option>
                        <option>Khác (ONVIF)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Địa chỉ IP / URL</label>
                    <input 
                      type="text" 
                      placeholder="192.168.1.100 hoặc rtsp://..."
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button className="py-4 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                      Quét trong mạng
                    </button>
                    <button className="py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Kết nối ngay
                    </button>
                  </div>
                </div>
              )}

              {selectedType === 'webcam' && (
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Monitor className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Đang tìm kiếm thiết bị...</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">Vui lòng cho phép quyền truy cập camera trên trình duyệt để tiếp tục</p>
                  </div>
                  <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                    Cấp quyền & Kết nối
                  </button>
                </div>
              )}

              {selectedType === 'phone' && (
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                      <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Hướng dẫn nhanh</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Tải ứng dụng SafeGuard Cam trên App Store hoặc Google Play, sau đó quét mã QR bên dưới để bắt đầu luồng dữ liệu.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center py-4">
                    <div className="w-48 h-48 bg-white p-4 rounded-3xl border-4 border-slate-50 dark:border-slate-800 shadow-xl mb-4">
                      {/* Placeholder for QR Code */}
                      <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-2 opacity-20">
                           <div className="w-4 h-4 bg-white"></div>
                           <div className="w-4 h-4 bg-white"></div>
                           <div className="w-4 h-4 bg-white"></div>
                           <div className="w-4 h-4 bg-white"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      Chờ quét mã...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Mã hóa đầu cuối
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Tự động nhận diện AI
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCameraModal
