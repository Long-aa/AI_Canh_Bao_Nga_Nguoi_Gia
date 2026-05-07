import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Camera, Bell, Database, Shield, Wifi, User as UserIcon } from 'lucide-react'

const Settings: React.FC = () => {
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
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Camera</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {settings.cameras.map((camera) => (
                    <div key={camera.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{camera.name}</p>
                        <p className="text-sm text-gray-500">{camera.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-gray-600">
                          {camera.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Thông báo</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Email</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">SMS</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Push Notification</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Hệ thống</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngưỡng cảnh báo ({(settings.system.alertThreshold * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.system.alertThreshold}
                      onChange={(e) => handleSystemChange('alertThreshold', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lưu trữ dữ liệu (ngày)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.system.dataRetention}
                      onChange={(e) => handleSystemChange('dataRetention', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-gray-700">Ghi hình</span>
                    <input
                      type="checkbox"
                      checked={settings.system.recordingEnabled}
                      onChange={(e) => handleSystemChange('recordingEnabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Bảo mật</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Mật khẩu</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Đổi mật khẩu
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Lần thay đổi cuối: 30 ngày trước</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Two-Factor Authentication</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Thiết lập
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Chưa thiết lập</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">Tài khoản</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Chỉnh sửa
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">admin@safeguard.ai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Settings
