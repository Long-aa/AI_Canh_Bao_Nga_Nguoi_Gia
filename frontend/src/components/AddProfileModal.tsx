import React, { useState, useCallback } from 'react'
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  User, 
  Calendar, 
  Home, 
  Phone, 
  Stethoscope,
  Info,
  ShieldCheck
} from 'lucide-react'

interface AddProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [isScanned, setIsScanned] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    room: '',
    phone: '',
    health: 'Ổn định',
    notes: ''
  })

  const simulateScanning = useCallback(() => {
    setIsScanning(true)
    setScanProgress(0)
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setIsScanned(true)
          // Auto-fill form with simulated data
          setFormData({
            name: 'Lê Hoàng Nam',
            age: '78',
            room: 'Phòng 402 - Khu C',
            phone: '0934 567 890',
            health: 'Cần theo dõi',
            notes: 'Tiền sử huyết áp cao, cần kiểm tra định kỳ mỗi 4 giờ.'
          })
          return 100
        }
        return prev + 5
      })
    }, 100)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-white">
        {/* Left Sidebar: AI Upload */}
        <div className="w-full md:w-[380px] bg-slate-50 p-10 flex flex-col border-r border-slate-100">
          <div className="mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Smart Scan</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Tự động điền bằng hồ sơ PDF</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {!isScanning && !isScanned ? (
              <div 
                onClick={simulateScanning}
                className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-sm font-black text-slate-900 mb-1">Tải lên hồ sơ PDF</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Kéo thả hoặc nhấn để chọn</p>
              </div>
            ) : isScanning ? (
              <div className="space-y-6 text-center">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div 
                    className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
                    style={{ clipPath: `polygon(50% 50%, -50% -50%, ${scanProgress}% -50%)` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">AI đang quét tài liệu...</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{scanProgress}% Hoàn tất</p>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-emerald-900 mb-1">Quét thành công!</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Dữ liệu đã được tự động điền</p>
                <button 
                  onClick={() => { setIsScanned(false); setScanProgress(0); }}
                  className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Tải tệp khác
                </button>
              </div>
            )}
          </div>

          <div className="mt-10 p-4 bg-white rounded-2xl border border-slate-100 flex gap-4">
             <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
             <p className="text-[10px] font-medium text-slate-500 leading-relaxed">Dữ liệu y tế được mã hóa bảo mật theo tiêu chuẩn HIPAA và chỉ lưu trữ nội bộ.</p>
          </div>
        </div>

        {/* Right Content: Form */}
        <div className="flex-1 p-10 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thông tin hồ sơ</h2>
              <p className="text-slate-500 text-sm font-medium">Nhập tay hoặc kiểm tra lại thông tin sau khi quét</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ví dụ: Nguyễn Văn An" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tuổi</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="75" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Số phòng</label>
                <div className="relative group">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="Phòng 302" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Số điện thoại khẩn cấp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0912 345 678" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Trạng thái sức khỏe</label>
                <div className="relative group">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select 
                    value={formData.health}
                    onChange={(e) => setFormData({...formData, health: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900 appearance-none"
                  >
                    <option>Ổn định</option>
                    <option>Cần chú ý</option>
                    <option>Cần theo dõi</option>
                    <option>Nguy cơ cao</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ghi chú bệnh lý / Yêu cầu đặc biệt</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Nhập thông tin bệnh lý, dị ứng hoặc các yêu cầu chăm sóc đặc biệt..." 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900 resize-none"
                ></textarea>
              </div>
            </div>
          </form>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-slate-500 font-bold hover:text-slate-900 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={onClose}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3"
            >
              Lưu hồ sơ người dùng
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProfileModal
