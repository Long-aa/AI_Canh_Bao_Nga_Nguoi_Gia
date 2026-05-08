import React, { useState } from 'react'
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
  CheckCircle2
} from 'lucide-react'

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
}

type DeviceType = 'ip_camera' | 'webcam' | 'mobile'

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const [activeType, setActiveType] = useState<DeviceType>('ip_camera')
  const [step, setStep] = useState(1)

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button 
        onClick={() => { setActiveType('ip_camera'); setStep(2); }}
        className={`flex flex-col items-center p-8 rounded-[32px] border-2 transition-all group ${activeType === 'ip_camera' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'ip_camera' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Camera className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Camera IP</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Kết nối với các hãng camera (Hikvision, Dahua, KBVision...)</p>
      </button>

      <button 
        onClick={() => { setActiveType('webcam'); setStep(2); }}
        className={`flex flex-col items-center p-8 rounded-[32px] border-2 transition-all group ${activeType === 'webcam' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'webcam' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Monitor className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Máy tính (Webcam)</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Sử dụng camera tích hợp hoặc USB webcam của máy tính</p>
      </button>

      <button 
        onClick={() => { setActiveType('mobile'); setStep(2); }}
        className={`flex flex-col items-center p-8 rounded-[32px] border-2 transition-all group ${activeType === 'mobile' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 bg-white shadow-sm hover:shadow-md'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeType === 'mobile' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          <Smartphone className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Điện thoại</h3>
        <p className="text-sm text-slate-500 text-center font-medium">Kết nối với điện thoại Android hoặc iOS qua ứng dụng</p>
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
          <input type="text" placeholder="Ví dụ: Camera Phòng Khách" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ IP / Domain</label>
          <input type="text" placeholder="192.168.1.10 hoặc mycam.ddns.net" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Tài khoản</label>
          <input type="text" placeholder="admin" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
          <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Cổng (RTSP Port)</label>
          <input type="number" defaultValue={554} className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Kênh (Channel)</label>
          <select className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium appearance-none">
            <option>Channel 1</option>
            <option>Channel 2</option>
            <option>Channel 3</option>
            <option>Channel 4</option>
          </select>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Camera className="w-16 h-16 text-slate-700 group-hover:text-slate-400 transition-colors z-0" />
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
            Xem thử Camera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Tên camera</label>
          <input type="text" placeholder="Ví dụ: Webcam Laptop" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Chọn nguồn Camera</label>
          <select className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium appearance-none">
            <option>Integrated Camera (04f2:b6d9)</option>
            <option>OBS Virtual Camera</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderMobileForm = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="shrink-0 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
             {/* Simulated QR Code */}
             <div className="grid grid-cols-10 grid-rows-10 w-full h-full p-2 gap-px opacity-80">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className={`${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'} rounded-[1px]`} />
                ))}
             </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Quét mã để kết nối</p>
        </div>
        <div className="space-y-6">
          <h4 className="text-xl font-extrabold text-slate-900">Kết nối điện thoại làm Camera AI</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">1</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Tải ứng dụng SafeGuard Mobile</p>
                <p className="text-xs text-slate-500 font-medium">Có sẵn trên App Store (iOS) và Play Store (Android)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">2</div>
              <div>
                <p className="text-sm font-bold text-slate-800">Mở ứng dụng và chọn "Kết nối Edge"</p>
                <p className="text-xs text-slate-500 font-medium">Đảm bảo điện thoại và máy tính cùng mạng Wifi</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">3</div>
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
                onClick={() => setStep(1)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng ký thiết bị mới</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                {step === 1 ? 'Chọn loại thiết bị' : activeType === 'ip_camera' ? 'Cấu hình Camera IP' : activeType === 'webcam' ? 'Cấu hình Webcam' : 'Kết nối điện thoại'}
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
            activeType === 'webcam' ? renderWebcamForm() : renderMobileForm()
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
              <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all font-bold text-sm shadow-xl shadow-blue-600/20">
                {activeType === 'mobile' ? 'Xong' : 'Hoàn tất đăng ký'}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddDeviceModal
