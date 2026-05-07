import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Search, RefreshCw, Edit, ChevronLeft, ChevronRight } from 'lucide-react'

const Devices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const devices = [
    {
      id: 'EDG-001',
      location: 'Phòng khách - Khu A',
      status: 'online',
      cpu: 45,
      temperature: 42
    },
    {
      id: 'EDG-002',
      location: 'Phòng ngủ 2 - Khu B',
      status: 'offline',
      cpu: 0,
      temperature: 0
    },
    {
      id: 'EDG-003',
      location: 'Hành lang tầng 1',
      status: 'online',
      cpu: 88,
      temperature: 65
    },
    {
      id: 'EDG-004',
      location: 'Sân vườn sau',
      status: 'online',
      cpu: 22,
      temperature: 38
    }
  ]

  const stats = [
    { label: 'TỔNG THIẾT BỊ', value: '124', color: 'text-blue-600' },
    { label: 'ĐANG HOẠT ĐỘNG (ONLINE)', value: '118', color: 'text-green-600' },
    { label: 'MẤT KẾT NỐI (OFFLINE)', value: '6', color: 'text-red-600' }
  ]

  const getCpuColor = (cpu: number) => {
    if (cpu >= 80) return 'bg-red-500'
    if (cpu >= 60) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getTempColor = (temp: number) => {
    if (temp >= 60) return 'text-red-600'
    if (temp >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <>
      <Head>
        <title>Quản lý thiết bị - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thiết bị phần cứng</h1>
            <p className="text-gray-500 text-sm mt-1">
              Giám sát và điều khiển các thiết bị Edge (Edge Devices) theo thời gian thực.
            </p>
          </div>

          {/* Search and Add Button */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm thiết bị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Thêm thiết bị
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Devices Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID THIẾT BỊ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VỊ TRÍ LẮP ĐẶT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TRẠNG THÁI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TẢI CPU (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NHIỆT ĐỘ (°C)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {device.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {device.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-gray-900 capitalize">
                            {device.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device.status === 'online' ? (
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getCpuColor(device.cpu)}`}
                                style={{ width: `${device.cpu}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">{device.cpu}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device.status === 'online' ? (
                          <span className={`text-sm font-medium ${getTempColor(device.temperature)}`}>
                            {device.temperature}°C
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-- °C</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Trước
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> trong số{' '}
                    <span className="font-medium">124</span> thiết bị
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      3
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      31
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Devices
