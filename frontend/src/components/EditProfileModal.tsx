import React, { useState, useEffect } from 'react'
import { 
  X, 
  CheckCircle2, 
  User, 
  Calendar, 
  Home, 
  Phone, 
  Stethoscope,
  Save,
  Image as ImageIcon,
  Camera,
  Loader2
} from 'lucide-react'
import { updateElderlyProfile } from '../services/api'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    room: '',
    phone: '',
    emergency_contact: '',
    gender: 'Nam',
    health: 'Ổn định',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        room: profile.room || '',
        phone: profile.emergency_phone || '',
        emergency_contact: profile.emergency_contact || '',
        gender: profile.gender || 'Nam',
        health: profile.health || 'Ổn định',
        notes: profile.medical_notes || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateElderlyProfile(profile.id, {
        name: formData.name,
        age: parseInt(formData.age),
        room: formData.room,
        emergency_phone: formData.phone,
        emergency_contact: formData.emergency_contact,
        gender: formData.gender,
        medical_notes: formData.notes,
        health: formData.health
      })
      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
        {/* Header */}
        <div className="relative h-48 bg-slate-900 overflow-hidden">
           <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
              <div className="grid grid-cols-8 grid-rows-4 w-full h-full opacity-30">
                 {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/10"></div>
                 ))}
              </div>
           </div>
           
           <div className="relative h-full px-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="relative group">
                    <div className="w-24 h-24 bg-slate-800 rounded-3xl border-4 border-white/10 flex items-center justify-center overflow-hidden">
                       <User className="w-12 h-12 text-slate-500" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-500 transition-all">
                       <Camera className="w-5 h-5" />
                    </button>
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Sửa hồ sơ</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Cập nhật thông tin cho {profile.name}</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 text-white hover:bg-white/20 rounded-2xl transition-all border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>

        {/* Form Content */}
        <div className="p-10">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nguyễn Văn An" 
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sức khỏe</label>
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
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cập nhật hồ sơ'}
              {!isSubmitting && <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal
