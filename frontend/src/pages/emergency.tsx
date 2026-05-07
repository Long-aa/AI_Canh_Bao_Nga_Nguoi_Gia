import React from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { Phone, Users, MapPin, Clock, AlertTriangle } from 'lucide-react'

const Emergency: React.FC = () => {
  return (
    <>
      <Head>
        <title>Cảnh báo khẩn cấp - SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - AI Simulation */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Mô phỏng AI (Edge Computed)</h2>
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                CẢNH BÁO TÉ NGÃ
              </div>
            </div>
            
            {/* Video Frame */}
            <div className="relative bg-black aspect-video">
              {/* Simulated video content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Person skeleton representation */}
                  <div className="w-32 h-48 border-2 border-green-400 rounded">
                    <div className="absolute top-2 left-2 text-green-400 text-xs">
                      Tọa độ Z &lt; 0.2m
                    </div>
                  </div>
                  {/* Bounding box */}
                  <div className="absolute inset-0 border-2 border-red-500 -m-2">
                    <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1">
                      Person: 95%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timer overlay */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                T+00:02:45
              </div>
              
              {/* Video controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-4">
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4v12l10-6z"/>
                  </svg>
                </button>
                <div className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                  00:45 / 02:30
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Incident Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết sự cố</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ĐỐI TƯỢNG GIÁM SÁT</p>
                    <p className="font-medium text-gray-900">Nguyễn Văn An (Ông)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">VỊ TRÍ PHÁT HIỆN</p>
                    <p className="font-medium text-gray-900">Phòng Khách - Căn hộ 12A</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">THỜI ĐIỂM XẢY RA</p>
                    <p className="font-medium text-gray-900">14:22:05 - 24/10/2023</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">MỨC ĐỘ TIN CẬY CỦA AI</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1">95%</p>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hành động khẩn cấp</h2>
              
              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Gọi cấp cứu 115
                </button>
                
                <button className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  Đã liên hệ người nhà
                </button>
                
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Đánh dấu báo động giả
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
