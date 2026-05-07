import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { 
  Users, 
  Plus, 
  Phone, 
  Calendar, 
  Home, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  UserCheck,
  UserMinus,
  Heart,
  Clock,
  X
} from 'lucide-react'

const Profiles: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false)

  const profiles = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      age: 75,
      room: 'Phòng 302',
      emergencyContact: '0912 345 678',
      status: 'active',
      health: 'Ổn định',
      lastUpdate: '10 phút trước'
    },
    {
      id: 2,
      name: 'Trần Thị Bích',
      age: 68,
      room: 'Phòng 105',
      emergencyContact: '0987 654 321',
      status: 'active',
      health: 'Cần chú ý',
      lastUpdate: '2 giờ trước'
    },
    {
      id: 3,
      name: 'Lê Văn Chính',
      age: 82,
      room: 'Phòng 201',
      emergencyContact: '0911 222 333',
      status: 'inactive',
      health: 'Ổn định',
      lastUpdate: '1 ngày trước'
    }
  ]

  return (
    <>
      <Head>
        <title>Quản lý hồ sơ | SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hồ sơ người dùng</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Quản lý và giám sát thông tin chi tiết từng cá nhân</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên, phòng..."
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm w-64"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm hồ sơ</span>
              </button>
            </div>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {profiles.map((profile) => (
              <div key={profile.id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <Users className="w-10 h-10 text-slate-400" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${profile.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{profile.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Home className="w-4 h-4" />
                      <span>{profile.room}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tuổi</div>
                      <div className="text-slate-900 font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {profile.age}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sức khỏe</div>
                      <div className={`font-bold flex items-center gap-2 ${profile.health === 'Ổn định' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        <Heart className="w-4 h-4" />
                        {profile.health}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Liên hệ khẩn cấp</span>
                      <span className="text-sm font-bold tracking-tight">{profile.emergencyContact}</span>
                    </div>
                    <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Cập nhật {profile.lastUpdate}
                  </span>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${profile.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {profile.status === 'active' ? (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Monitoring
                      </>
                    ) : 'Offline'}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Add Card */}
            <button 
              onClick={() => setShowAddForm(true)}
              className="group border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-bold group-hover:text-blue-600 transition-colors">Thêm hồ sơ mới</p>
            </button>
          </div>

          {/* Add Profile Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-[32px] p-10 w-full max-w-xl shadow-2xl transform animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Thêm hồ sơ</h2>
                    <p className="text-slate-500 font-medium text-sm">Điền thông tin chi tiết để bắt đầu giám sát</p>
                  </div>
                  <button onClick={() => setShowAddForm(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Họ và tên</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Tuổi</label>
                    <input
                      type="number"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                      placeholder="70"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Số phòng</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                      placeholder="Phòng 101"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Liên hệ khẩn cấp</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-medium"
                      placeholder="09xx xxx xxx"
                    />
                  </div>

                  <div className="col-span-2 flex gap-4 mt-4">
                    <button
                      onClick={() => setShowAddForm(false)}
                      type="button"
                      className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      type="button"
                      className="flex-2 px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all"
                    >
                      Tạo hồ sơ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}

export default Profiles
