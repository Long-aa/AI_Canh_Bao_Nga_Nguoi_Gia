import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import AddProfileModal from '../components/AddProfileModal'
import EditProfileModal from '../components/EditProfileModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { 
  Users, 
  Plus, 
  Phone, 
  Calendar, 
  Home, 
  Edit, 
  Trash2, 
  Search, 
  Heart,
  Clock
} from 'lucide-react'

const Profiles: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)

  const [profiles, setProfiles] = useState([
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
  ])

  const handleEditClick = (profile: any) => {
    setSelectedProfile(profile)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (profile: any) => {
    setSelectedProfile(profile)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    setProfiles(profiles.filter(p => p.id !== selectedProfile.id))
    setIsDeleteModalOpen(false)
    setSelectedProfile(null)
  }

  return (
    <>
      <Head>
        <title>Quản lý hồ sơ | SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hồ sơ người dùng</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Quản lý và giám sát thông tin chi tiết từng cá nhân</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên, phòng..."
                  className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm w-64 dark:text-slate-200"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
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
              <div key={profile.id} className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white dark:border-slate-900 rounded-full ${profile.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => handleEditClick(profile)}
                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(profile)}
                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{profile.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <Home className="w-4 h-4" />
                      <span>{profile.room}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Tuổi</div>
                      <div className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        {profile.age}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Sức khỏe</div>
                      <div className={`font-bold flex items-center gap-2 ${profile.health === 'Ổn định' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        <Heart className="w-4 h-4" />
                        {profile.health}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between p-4 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white border border-transparent dark:border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Liên hệ khẩn cấp</span>
                      <span className="text-sm font-bold tracking-tight">{profile.emergencyContact}</span>
                    </div>
                    <button className="w-10 h-10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Cập nhật {profile.lastUpdate}
                  </span>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${profile.status === 'active' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
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
          </div>
        </div>

        <AddProfileModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />

        <EditProfileModal 
          isOpen={isEditModalOpen}
          profile={selectedProfile}
          onClose={() => { setIsEditModalOpen(false); setSelectedProfile(null); }}
        />

        <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          profileName={selectedProfile?.name}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedProfile(null); }}
          onConfirm={handleDeleteConfirm}
        />
      </Layout>
    </>
  )
}

export default Profiles
