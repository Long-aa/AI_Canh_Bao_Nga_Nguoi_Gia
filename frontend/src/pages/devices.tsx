import React, { useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
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
  HardDrive
} from 'lucide-react'

const Devices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const devices = [
    {
      id: 'EDG-001',
      location: 'Phòng khách - Khu A',
      status: 'online',
      cpu: 45,
      temperature: 42,
      uptime: '12d 4h',
      model: 'NVIDIA Jetson Nano'
    },
    {
      id: 'EDG-002',
      location: 'Phòng ngủ 2 - Khu B',
      status: 'offline',
      cpu: 0,
      temperature: 0,
      uptime: '0s',
      model: 'Raspberry Pi 4'
    },
    {
      id: 'EDG-003',
      location: 'Hành lang tầng 1',
      status: 'online',
      cpu: 88,
      temperature: 65,
      uptime: '45d 12h',
      model: 'NVIDIA Jetson Orin'
    },
    {
      id: 'EDG-004',
      location: 'Sân vườn sau',
      status: 'online',
      cpu: 22,
      temperature: 38,
      uptime: '2d 18h',
      model: 'Jetson Xavier NX'
    }
  ]

  const stats = [
    { label: 'Tổng thiết bị', value: '124', icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Trực tuyến', value: '118', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ngoại tuyến', value: '6', icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-50' }
  ]

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

  return (
    <>
      <Head>
        <title>Thiết bị Edge | SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cấu hình thiết bị</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Giám sát hiệu năng và trạng thái các thiết bị biên (Edge)</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-900/10">
                <Plus className="w-5 h-5" />
                <span>Đăng ký mới</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm mã thiết bị, vị trí lắp đặt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-200 outline-none transition-all font-medium text-sm"
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
                  <div className={`${stat.bg} ${stat.color} p-5 rounded-2xl`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-slate-900 leading-none">{stat.value}</h3>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Devices Grid/Table */}
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Thiết bị</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vị trí & Model</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hiệu năng CPU</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nhiệt độ</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {devices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-slate-900 font-black text-sm tracking-tight">{device.id}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div>
                          <div className="text-slate-900 font-bold text-sm">{device.location}</div>
                          <div className="text-slate-400 text-xs font-medium mt-1">{device.model}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          device.status === 'online' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
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
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 shadow-sm ${getCpuColor(device.cpu)}`}
                                style={{ width: `${device.cpu}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium text-xs">--</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {device.status === 'online' ? (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${getTempColor(device.temperature)}`}>
                            <Thermometer className="w-4 h-4" />
                            {device.temperature}°C
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium text-xs">--</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
              <p className="text-sm font-medium text-slate-400">
                Hiển thị <span className="text-slate-900 font-bold">1 - 4</span> của <span className="text-slate-900 font-bold">124</span> thiết bị
              </p>
              <div className="flex gap-2">
                <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-600/10">1</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all">2</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all">3</button>
                <button className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Devices
