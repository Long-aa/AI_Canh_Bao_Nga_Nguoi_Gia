import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Phone, Users, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { getAlerts } from '../services/api'

const Emergency: React.FC = () => {
  const [latestAlert, setLatestAlert] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const alerts = await getAlerts(1)
        if (alerts.length > 0) {
          setLatestAlert(alerts[0])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching latest alert:", error)
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  return (
    <>
      <Head>
        <title>Cảnh báo khẩn cấp - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - AI Simulation */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mô phỏng AI (Edge Computed)</h2>
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center shadow-lg shadow-red-600/20">
                <AlertTriangle className="w-4 h-4 mr-2" />
                CẢNH BÁO TÉ NGÃ
              </div>
            </div>
            
            {/* Video Frame */}
            <div className="relative bg-slate-950 aspect-video group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-48 border-2 border-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <div className="absolute top-2 left-2 text-emerald-400 text-[10px] font-bold">
                      Pose Detected
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-red-500 -m-3 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <div className="absolute -top-7 left-0 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-t-lg">
                      FALL: {latestAlert?.confidence ? (latestAlert.confidence * 100).toFixed(0) : "95"}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-mono border border-white/10 shadow-xl">
                LIVE
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Chi tiết sự cố</h2>
              
              <div className="space-y-6">
                <div className="flex items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl mr-4">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1">ĐỐI TƯỢNG GIÁM SÁT</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{latestAlert?.person || "Nguyễn Văn An"}</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl mr-4">
                    <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1">VỊ TRÍ PHÁT HIỆN</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{latestAlert?.location || "Phòng Khách"}</p>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="bg-indigo-100 dark:bg-indigo-500/10 p-3 rounded-xl mr-4">
                    <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1">THỜI ĐIỂM XẢY RA</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {latestAlert?.timestamp ? new Date(latestAlert.timestamp).toLocaleString('vi-VN') : "Vừa xong"}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">MỨC ĐỘ TIN CẬY CỦA AI</p>
                    <span className="text-emerald-500 font-black text-sm">{(latestAlert?.confidence * 100 || 95).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                      style={{ width: `${(latestAlert?.confidence * 100 || 95)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Hành động khẩn cấp</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="col-span-1 sm:col-span-2 bg-red-600 text-white py-4 px-6 rounded-2xl hover:bg-red-700 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center shadow-lg shadow-red-600/20 group">
                  <Phone className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                  Gọi cấp cứu 115
                </button>
                
                <button className="bg-slate-900 dark:bg-blue-600 text-white py-4 px-6 rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all font-bold text-sm flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-blue-600/20 group">
                  <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Báo người nhà
                </button>
                
                <button className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-4 px-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-sm flex items-center justify-center">
                  Báo động giả
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Emergency
