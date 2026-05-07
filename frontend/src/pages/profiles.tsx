import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Users, Plus, Phone, Calendar, Home, Edit, Trash2 } from 'lucide-react'

const Profiles: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false)

  const profiles = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      age: 75,
      room: 'Phòng 302',
      emergencyContact: '0912345678',
      status: 'active'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      age: 68,
      room: 'Phòng 105',
      emergencyContact: '0987654321',
      status: 'active'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      age: 82,
      room: 'Phòng 201',
      emergencyContact: '0911222333',
      status: 'inactive'
    }
  ]

  return (
    <>
      <Head>
        <title>Hồ sơ người già - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ người già</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm hồ sơ</span>
            </button>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{profile.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{profile.age} tuổi</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="w-4 h-4 mr-2" />
                      <span>{profile.room}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{profile.emergencyContact}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Trạng thái monitoring</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.status === 'active' ? 'Đang theo dõi' : 'Ngừng theo dõi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Profile Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Thêm hồ sơ mới</h2>
                
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tuổi
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tuổi"
                      onChange={(e) => e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập số phòng"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Liên hệ khẩn cấp
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú y tế
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Nhập ghi chú y tế (nếu có)"
                      onChange={(e) => e.target.value}
                    />
                  </div>
                </form>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}

export default Profiles
