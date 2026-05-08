import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import AddCameraModal from '../components/AddCameraModal'
import { Camera, Bell, Database, Shield, Wifi, User as UserIcon } from 'lucide-react'

const Settings: React.FC = () => {
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    cameras: [
      { id: 1, name: 'Camera Phòng khách', status: 'online', location: 'Phòng khách' },
      { id: 2, name: 'Camera Phòng ngủ', status: 'online', location: 'Phòng ngủ' },
      { id: 3, name: 'Camera Nhà bếp', status: 'offline', location: 'Nhà bếp' }
    ],
    system: {
      alertThreshold: 0.7,
      recordingEnabled: true,
      dataRetention: 30
    }
  })

  const handleNotificationChange = (type: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }))
  }

  const handleSystemChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }))
  }

  return (
    <>
      <Head>
        <title>Cài đặt - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Cài đặt hệ thống</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Tùy chỉnh cấu hình giám sát, thông báo và bảo mật</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-2.5 rounded-xl">
                    <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hệ thống Camera</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {settings.cameras.map((camera) => (
                    <div key={camera.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          camera.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{camera.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{camera.location}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        camera.status === 'online' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {camera.status}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setIsAddCameraOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    + Kết nối Camera mới
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-500/10 p-2.5 rounded-xl">
                    <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trung tâm Thông báo</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Email</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gửi báo cáo và cảnh báo qua email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={() => handleNotificationChange('email')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">SMS / Zalo</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gửi tin nhắn trực tiếp khi có sự cố</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.sms}
                        onChange={() => handleNotificationChange('sms')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Push Notification</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Thông báo đẩy trên trình duyệt và điện thoại</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={() => handleNotificationChange('push')}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-500/10 p-2.5 rounded-xl">
                    <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tham số Hệ thống</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Ngưỡng cảnh báo té ngã
                      </label>
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-black text-sm">
                        {(settings.system.alertThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={settings.system.alertThreshold}
                      onChange={(e) => handleSystemChange('alertThreshold', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-slate-400 font-bold">Nhạy bén</span>
                      <span className="text-[10px] text-slate-400 font-bold">Chính xác cao</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Thời gian lưu trữ dữ liệu
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.system.dataRetention}
                        onChange={(e) => handleSystemChange('dataRetention', parseInt(e.target.value))}
                        className="w-24 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 outline-none transition-all text-sm font-bold dark:text-white"
                      />
                      <span className="text-slate-500 dark:text-slate-400 font-medium">ngày (Tự động xóa sau thời gian này)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Ghi hình liên tục</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Lưu trữ video 24/7 khi có sự kiện</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.recordingEnabled}
                        onChange={(e) => handleSystemChange('recordingEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-500/10 p-2.5 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bảo mật & Tài khoản</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all hover:border-blue-200 dark:hover:border-blue-900 group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white">Mật khẩu</span>
                      <button className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">
                        Đổi mật khẩu
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lần thay đổi cuối: 30 ngày trước</p>
                  </div>
                  
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all hover:border-blue-200 dark:hover:border-blue-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white">Xác thực 2 lớp (2FA)</span>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/10">
                        Thiết lập
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tăng cường bảo mật cho tài khoản của bạn</p>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all hover:border-blue-200 dark:hover:border-blue-900">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">Email Quản trị</span>
                      </div>
                      <button className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">
                        Thay đổi
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">admin@safeguard.ai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AddCameraModal 
          isOpen={isAddCameraOpen}
          onClose={() => setIsAddCameraOpen(false)}
        />
      </Layout>
    </>
  )
}

export default Settings
