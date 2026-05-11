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
  ShieldCheck,
  Video,
  Film
} from 'lucide-react'
import { createElderlyProfile } from '../services/api'

interface AddProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddProfileModal: React.FC<AddProfileModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [isScanned, setIsScanned] = useState(false)
  const [isDocScanning, setIsDocScanning] = useState(false)
  const [docScanProgress, setDocScanProgress] = useState(0)
  const [isDocScanned, setIsDocScanned] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    room: '',
    phone: '',
    gender: 'Nam',
    emergency_contact: '',
    health: 'Ổn định',
    notes: ''
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setVideoFile(file)
      simulateScanning()
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const data = new FormData()
      data.append('name', formData.name || 'Người dùng mới')
      data.append('age', formData.age || '60')
      data.append('room', formData.room || 'Phòng trống')
      data.append('emergency_phone', formData.phone || '000000000')
      data.append('emergency_contact', formData.emergency_contact || 'Người thân')
      data.append('gender', formData.gender)
      data.append('medical_notes', formData.notes)
      
      if (videoFile) {
        data.append('video', videoFile)
      }
      
      if (documentFile) {
        data.append('document', documentFile)
      }
      
      await createElderlyProfile(data)
      onClose()
      window.location.reload() // Refresh to see new data
    } catch (error) {
      console.error("Error creating profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocScan = useCallback(() => {
    if (!documentFile) return
    
    setIsDocScanning(true)
    setDocScanProgress(0)
    
    const interval = setInterval(() => {
      setDocScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDocScanning(false)
          setIsDocScanned(true)
          // Auto-fill form with simulated data from document
          setFormData({
            name: 'Nguyễn Văn Hùng',
            age: '82',
            room: 'Phòng 205 - Khu A',
            phone: '0912 987 654',
            gender: 'Nam',
            emergency_contact: 'Nguyễn Thị Hoa (Con gái)',
            health: 'Cần chú ý',
            notes: 'Bệnh tim mạch, cao huyết áp. Cần uống thuốc sau ăn sáng.'
          })
          return 100
        }
        return prev + 10
      })
    }, 150)
  }, [documentFile])

  const simulateScanning = useCallback(() => {
    setIsScanning(true)
    setScanProgress(0)
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setIsScanned(true)
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
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Face Enrollment</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Video nhận diện khuôn mặt</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {!isScanning && !isScanned ? (
              <div className="relative">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="group border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center mb-4 transition-all">
                    <Film className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-1">Tải lên Video mẫu</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Để AI học nhận diện khuôn mặt</p>
                </div>
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
                  <p className="text-lg font-black text-slate-900">AI đang xử lý video...</p>
                  <p className="text-sm font-bold text-indigo-600 mt-1">{scanProgress}% Hoàn tất</p>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300" 
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-emerald-900 mb-1">Xử lý thành công!</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Đã trích xuất đặc trưng khuôn mặt</p>
                <button 
                  onClick={() => { setIsScanned(false); setScanProgress(0); }}
                  className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Tải tệp khác
                </button>
              </div>
            )}

            {/* Document Upload Section */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tài liệu hồ sơ (PDF, DOC)</p>
                {documentFile && !isDocScanning && !isDocScanned && (
                  <button 
                    onClick={handleDocScan}
                    className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Quét AI
                  </button>
                )}
              </div>
              
              <div className="relative">
                {!isDocScanning ? (
                  <>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleDocumentChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${isDocScanned ? 'border-emerald-500 bg-emerald-50/30' : documentFile ? 'border-indigo-400 bg-indigo-50/10' : 'border-slate-200 bg-white hover:border-indigo-400'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDocScanned ? 'bg-emerald-100 text-emerald-600' : documentFile ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {isDocScanned ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {documentFile ? documentFile.name : 'Tải lên tài liệu y tế'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {isDocScanned ? 'Đã quét dữ liệu' : documentFile ? `${(documentFile.size / 1024).toFixed(1)} KB` : 'Nhấn để chọn tệp'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 animate-pulse">
                    <div className="flex items-center gap-4 mb-3">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      <p className="text-xs font-black text-indigo-900">AI đang phân tích tài liệu...</p>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-300" 
                        style={{ width: `${docScanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Người liên hệ</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    placeholder="Tên người thân" 
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Số điện thoại người liên hệ</label>
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu hồ sơ người dùng'}
              {!isSubmitting && <CheckCircle2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProfileModal
