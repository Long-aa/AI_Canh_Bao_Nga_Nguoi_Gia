import React from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Monitor, AlertTriangle, Activity, Wifi, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard: React.FC = () => {
  // Sample data for the chart
  const chartData = [
    { day: 'T2', alerts: 12 },
    { day: 'T3', alerts: 19 },
    { day: 'T4', alerts: 8 },
    { day: 'T5', alerts: 15 },
    { day: 'T6', alerts: 22 },
    { day: 'T7', alerts: 18 },
    { day: 'CN', alerts: 24 },
  ]

  const recentAlerts = [
    {
      time: '08:42 AM',
      location: 'Phòng 302, Khu A',
      risk: 'Cao',
      riskColor: 'bg-red-100 text-red-800'
    },
    {
      time: '08:15 AM',
      location: 'Hành lang Tầng 2',
      risk: 'Trung bình',
      riskColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      time: '07:30 AM',
      location: 'Phòng Sinh hoạt chung',
      risk: 'Thấp',
      riskColor: 'bg-green-100 text-green-800'
    }
  ]

  const stats = [
    {
      title: 'Tổng số thiết bị đang hoạt động',
      value: '142',
      status: 'Bình thường',
      statusColor: 'bg-green-100 text-green-800',
      icon: Monitor,
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Cảnh báo hôm nay',
      value: '24',
      change: '+12% vs h.qua',
      statusColor: 'bg-blue-100 text-blue-800',
      icon: AlertTriangle,
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Số ca té ngã',
      value: '3',
      status: 'Cần xử lý',
      statusColor: 'bg-red-100 text-red-800',
      icon: Activity,
      iconBg: 'bg-red-500'
    },
    {
      title: 'Tình trạng hệ thống mạng',
      value: '99.9%',
      status: 'Ổn định',
      statusColor: 'bg-green-100 text-green-800',
      icon: Wifi,
      iconBg: 'bg-green-500'
    }
  ]

  return (
    <>
      <Head>
        <title>Tổng quan - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
            <p className="text-gray-500 text-sm mt-1">Cập nhật lúc: 08:45 AM, 24 Thg 10, 2023</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.iconBg} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stat.statusColor}`}>
                        {stat.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
                  {stat.change && (
                    <p className="text-blue-600 text-sm mt-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tần suất cảnh báo trong tuần</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="alerts" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Cảnh báo khẩn cấp gần đây nhất</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vị trí/Phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mức độ rủi ro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${alert.riskColor}`}>
                          {alert.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                          Xem chi tiết
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
