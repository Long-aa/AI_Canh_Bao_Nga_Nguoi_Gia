import React from 'react'
import { 
  X, 
  AlertCircle, 
  Trash2, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  profileName: string
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, profileName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Trash2 className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Xóa hồ sơ?</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Bạn có chắc chắn muốn xóa hồ sơ của <span className="text-slate-900 font-black">"{profileName}"</span>? 
            Hành động này không thể hoàn tác và toàn bộ dữ liệu lịch sử sẽ bị gỡ bỏ.
          </p>

          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-tight">
              Lưu ý: Dữ liệu giám sát AI sẽ ngừng ngay lập tức cho cá nhân này.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            Xác nhận xóa hồ sơ
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 border border-slate-200 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
