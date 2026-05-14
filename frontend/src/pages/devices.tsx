import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import AddDeviceModal from '../components/AddDeviceModal'
import DeviceLiveViewModal from '../components/DeviceLiveViewModal'
import { 
  Search, 
  RefreshCw, 
  Edit,
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Thermometer, 
  Activity, 
  Plus, 
  MoreHorizontal,
  Settings,
  HardDrive,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { getDevices, deleteDevice } from '../services/api'
import EditDeviceModal from '../components/EditDeviceModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const Devices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<any>(null)
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false)
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const fetchDevices = async () => {
    try {
      const data = await getDevices()
      setDevices(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching devices:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const stats = [
    { label: 'Tổng thiết bị', value: devices.length.toString(), icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Trực tuyến', value: devices.filter(d => d.status === 'online').length.toString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ngoại tuyến', value: devices.filter(d => d.status === 'offline').length.toString(), icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-50' }
  ]

  const filteredDevices = devices.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCpuColor = (cpu: number) => {
    if (cpu >= 80) return 'bg-red-500 shadow-red-500/50'
    if (cpu >= 60) return 'bg-amber-500 shadow-amber-500/50'
    return 'bg-blue-500 shadow-blue-500/50'
  }

  const getTempColor = (temp: number) => {
    if (temp >= 60) return 'text-red-600 bg-red-50'
    if (temp >= 50) return 'text-amber-600 bg-amber-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const handleRowClick = (device: any) => {
    setSelectedDevice(device)
    setIsLiveModalOpen(true)
  }

  const handleEditClick = (device: any) => {
    setSelectedDevice(device)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (device: any) => {
    setSelectedDevice(device)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDevice) return
    try {
      await deleteDevice(selectedDevice.id)
      setDevices(devices.filter(d => d.id !== selectedDevice.id))
      setIsDeleteModalOpen(false)
      setSelectedDevice(null)
    } catch (error) {
      console.error("Error deleting device:", error)
    }
  }

  return (
    <>
      <Head>
        <title>Thiết bị Edge | SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Cấu hình thiết bị</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Giám sát hiệu năng và trạng thái các thiết bị biên (Edge)</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all font-bold text-sm shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20"
              >
                <Plus className="w-5 h-5" />
                <span>Đăng ký mới</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm mã thiết bị, vị trí lắp đặt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 outline-none transition-all font-medium text-sm dark:text-slate-200"
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-colors">
                  <div className={`${stat.bg} dark:bg-opacity-10 ${stat.color} p-5 rounded-2xl`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stat.value}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Devices Grid/Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">ID Thiết bị</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Vị trí & Model</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Trạng thái</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Hiệu năng CPU</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Nhiệt độ</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredDevices.map((device) => (
                    <tr 
                      key={device.id} 
                      onClick={() => handleRowClick(device)}
                      className="transition-colors group hover:bg-blue-50/50 dark:hover:bg-blue-500/5 cursor-pointer"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">{device.id}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div>
                          <div className="text-slate-900 dark:text-slate-200 font-bold text-sm flex items-center gap-2">
                             {device.location}
                             {device.status === 'online' && <ExternalLink className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                          <div className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-1">{device.model}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          device.status === 'online' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
                          {device.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {device.status === 'online' ? (
                          <div className="space-y-1.5 w-48">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Load</span>
                              <span>{device.cpu}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 shadow-sm ${getCpuColor(device.cpu)}`}
                                style={{ width: `${device.cpu}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-medium text-xs">--</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {device.status === 'online' ? (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${
                            device.temperature >= 60 ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' : 
                            device.temperature >= 50 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' : 
                            'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                          }`}>
                            <Thermometer className="w-4 h-4" />
                            {device.temperature}°C
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-medium text-xs">--</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditClick(device); }}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(device); }}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-400">
                Hiển thị <span className="text-slate-900 dark:text-white font-bold">{filteredDevices.length > 0 ? 1 : 0} - {filteredDevices.length}</span> của <span className="text-slate-900 dark:text-white font-bold">{devices.length}</span> thiết bị
              </p>
              <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-600/10">1</button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">2</button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">3</button>
                <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <AddDeviceModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />

        <DeviceLiveViewModal 
          device={selectedDevice}
          isOpen={isLiveModalOpen}
          onClose={() => setIsLiveModalOpen(false)}
        />

        <EditDeviceModal 
          isOpen={isEditModalOpen}
          device={selectedDevice}
          onClose={() => { setIsEditModalOpen(false); setSelectedDevice(null); }}
        />

        <DeleteConfirmModal 
          isOpen={isDeleteModalOpen}
          profileName={selectedDevice?.id}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedDevice(null); }}
          onConfirm={handleDeleteConfirm}
        />
      </Layout>
    </>
  )
}

export default Devices
