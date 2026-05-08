import React from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { 
  Monitor, 
  AlertTriangle, 
  Activity, 
  Wifi, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme()
  const chartData = [
    { day: 'T2', alerts: 12, safe: 88 },
    { day: 'T3', alerts: 19, safe: 81 },
    { day: 'T4', alerts: 8, safe: 92 },
    { day: 'T5', alerts: 15, safe: 85 },
    { day: 'T6', alerts: 22, safe: 78 },
    { day: 'T7', alerts: 18, safe: 82 },
    { day: 'CN', alerts: 24, safe: 76 },
  ]

  const recentAlerts = [
    {
      time: '08:42 AM',
      location: 'Phòng 302, Khu A',
      person: 'Nguyễn Văn A',
      risk: 'Khẩn cấp',
      riskColor: 'bg-red-500',
      status: 'Đang xử lý'
    },
    {
      time: '08:15 AM',
      location: 'Hành lang Tầng 2',
      person: 'Trần Thị B',
      risk: 'Cảnh báo',
      riskColor: 'bg-amber-500',
      status: 'Đã thông báo'
    },
    {
      time: '07:30 AM',
      location: 'Phòng Sinh hoạt',
      person: 'Lê Văn C',
      risk: 'Theo dõi',
      riskColor: 'bg-blue-500',
      status: 'Đã ổn định'
    }
  ]

  const stats = [
    {
      title: 'Thiết bị hoạt động',
      value: '142',
      change: '+4 mới',
      icon: Monitor,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Cảnh báo hôm nay',
      value: '24',
      change: '+12% so với hôm qua',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Phát hiện té ngã',
      value: '03',
      change: 'Đã xử lý xong',
      icon: Activity,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Độ ổn định hệ thống',
      value: '99.9%',
      change: 'Tối ưu',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ]

  return (
    <>
      <Head>
        <title>Tổng quan | SafeGuard AI Dashboard</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header with Welcome Message */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Chào buổi sáng, Quản trị viên</h1>
              <div className="flex items-center gap-2 mt-1.5 text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Cập nhật lần cuối: 24/10/2023 - 08:45 AM</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 ml-2 animate-pulse">
                  REAL-TIME
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-semibold text-sm">
                Tải báo cáo
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-blue-600/20">
                <Zap className="w-4 h-4 fill-current" />
                Quét nhanh
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className={`${stat.bg} dark:bg-opacity-10 ${stat.color} p-3.5 rounded-2xl transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      Live
                    </div>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{stat.title}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.change}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Phân tích tần suất cảnh báo</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Dữ liệu tổng hợp trong 7 ngày gần nhất</p>
                </div>
                <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20">
                  <option>7 ngày qua</option>
                  <option>30 ngày qua</option>
                </select>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600}}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      itemStyle={{ color: isDarkMode ? '#3B82F6' : '#2563eb' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="alerts" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAlerts)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Status Section */}
            <div className="bg-slate-900 dark:bg-slate-900 dark:border dark:border-slate-800 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Trạng thái bảo mật
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm font-medium">Uptime hệ thống</span>
                    <span className="text-blue-400 font-bold">99.98%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[99.98%]"></div>
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-sm font-medium">Băng thông mạng</span>
                    <span className="text-blue-400 font-bold">120 Mbps</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[75%]"></div>
                  </div>
                </div>

                <div className="mt-10 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg">
                  <p className="text-white/80 text-sm font-medium">Thông tin khẩn cấp</p>
                  <h3 className="text-xl font-bold mt-1 text-white">Cần hỗ trợ?</h3>
                  <button className="mt-4 w-full bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all text-sm">
                    Gọi hỗ trợ kỹ thuật
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thông báo khẩn cấp mới nhất</h2>
              <button className="text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-1 hover:underline">
                Xem tất cả lịch sử <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Người dùng</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vị trí</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mức độ</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {recentAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {alert.time}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-slate-900 dark:text-white font-bold">{alert.person}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {alert.location}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${alert.riskColor}`}>
                          {alert.risk}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${alert.status === 'Đang xử lý' ? 'bg-red-500 animate-ping' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{alert.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button className="bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-700 dark:text-slate-300 p-2 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Dashboard
