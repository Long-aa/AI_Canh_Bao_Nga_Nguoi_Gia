import React, { useState, useEffect } from 'react'
import { 
  X, 
  CheckCircle2, 
  Cpu, 
  Settings, 
  MapPin, 
  Activity,
  Save,
  Loader2
} from 'lucide-react'
import { updateDevice } from '../services/api'

interface EditDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  device: any
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ isOpen, onClose, device }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    model: '',
    status: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        location: device.location || '',
        model: device.model || '',
        status: device.status || 'offline'
      })
    }
  }, [device])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateDevice(device.id, {
        device_id: device.id,
        name: formData.name,
        location: formData.location,
        model: formData.model,
        status: formData.status
      })
      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Error updating device:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !device) return null

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
           </div>
           
           <div className="relative h-full px-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 bg-slate-800 rounded-3xl border-4 border-white/10 flex items-center justify-center">
                    <Cpu className="w-12 h-12 text-blue-400" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Sửa thiết bị</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Cập nhật cấu hình cho {device.id}</p>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên thiết bị</label>
                <div className="relative group">
                   <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                   <input 
                     type="text" 
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vị trí</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Model</label>
                <input 
                  type="text" 
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900" 
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Trạng thái</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 outline-none transition-all font-bold text-slate-900 appearance-none"
                >
                  <option value="online">Trực tuyến (Online)</option>
                  <option value="offline">Ngoại tuyến (Offline)</option>
                </select>
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
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cập nhật thiết bị'}
              {!isSubmitting && <Save className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditDeviceModal
