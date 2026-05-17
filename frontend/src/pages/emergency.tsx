import React, { useEffect, useState, useRef, useCallback } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import {
  Phone, Users, MapPin, Clock, AlertTriangle, CheckCircle, XCircle,
  Video, RefreshCw, ChevronRight, Play, Pause, Download, Shield,
  Camera, Activity, Bell, Filter, Wifi
} from 'lucide-react'
import { getFallClips, getAlerts, resolveAlert, markFalseAlarm } from '../services/api'

const BACKEND_URL = 'https://unmade-backed-willed.ngrok-free.dev'
const WS_URL = BACKEND_URL.replace('https://', 'wss://')


// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (iso: string) => {
  try { return new Date(iso).toLocaleString('vi-VN') } catch { return iso }
}
const confidencePct = (c: number) => Math.round((c || 0) * 100)

// ── Video Clip Player ─────────────────────────────────────────────────────────
const ClipPlayer: React.FC<{ alert: any; onClose: () => void }> = ({ alert, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggle = () => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false) }
    else { videoRef.current.play(); setIsPlaying(true) }
  }

  const videoSrc = alert.video_url
    ? (alert.video_url.startsWith('http') ? alert.video_url : `${BACKEND_URL}${alert.video_url}`)
    : null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Clip té ngã #{alert.id}</p>
              <p className="text-slate-400 text-xs">{alert.location} • {formatTime(alert.timestamp)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Video */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {videoSrc ? (
            <>
              <video ref={videoRef} src={videoSrc} className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
              <button onClick={toggle}
                className="absolute inset-0 flex items-center justify-center group">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white fill-white ml-1" />}
                </div>
              </button>
              {/* Confidence badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-600/80 backdrop-blur-md rounded-lg text-xs font-black text-white uppercase tracking-widest">
                Fall {confidencePct(alert.confidence)}%
              </div>
            </>
          ) : (
            <div className="text-center">
              <Video className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">Đoạn clip chưa có / đang xử lý</p>
              <p className="text-slate-600 text-xs mt-1">Video được ghi lại 15 giây quanh thời điểm ngã</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10">
          {videoSrc && (
            <a href={videoSrc} download target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-xs font-bold transition-all">
              <Download className="w-4 h-4" /> Tải xuống
            </a>
          )}
          <div className="ml-auto flex gap-2">
            <p className="text-slate-400 text-xs self-center">Camera: <span className="text-white font-bold">{alert.camera_id}</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Alert Card ────────────────────────────────────────────────────────────────
const AlertCard: React.FC<{
  alert: any
  isLatest?: boolean
  onResolve: (id: number) => void
  onFalseAlarm: (id: number) => void
  onViewClip: (alert: any) => void
}> = ({ alert, isLatest, onResolve, onFalseAlarm, onViewClip }) => {
  const isPending = alert.status === 'pending'
  const isFall = alert.alert_type === 'fall_detected'

  return (
    <div className={`rounded-3xl border overflow-hidden transition-all ${
      isLatest && isPending
        ? 'border-red-500/50 bg-red-950/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
    }`}>
      {/* Top bar */}
      <div className={`flex items-center justify-between px-5 py-3 ${isLatest && isPending ? 'bg-red-600/20' : 'bg-white/5'}`}>
        <div className="flex items-center gap-2">
          {isFall ? (
            <AlertTriangle className={`w-4 h-4 ${isLatest && isPending ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
          ) : (
            <Bell className="w-4 h-4 text-blue-400" />
          )}
          <span className={`text-xs font-black uppercase tracking-widest ${isLatest && isPending ? 'text-red-300' : 'text-slate-400'}`}>
            {isFall ? 'TÉ NGÃ' : 'CẢNH BÁO'} #{alert.id}
          </span>
          {isLatest && isPending && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase animate-pulse">MỚI</span>
          )}
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          alert.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
          alert.status === 'processed' ? 'bg-slate-500/10 text-slate-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {alert.statusLabel || alert.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-white font-bold truncate">{alert.location || 'Không rõ'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-300 truncate">{alert.person || 'Không xác định'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-400 text-xs">{formatTime(alert.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-400 text-xs font-mono">{alert.camera_id}</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex flex-col justify-center space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Độ tin cậy AI</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">{confidencePct(alert.confidence)}</span>
            <span className="text-slate-400 text-sm mb-1">%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700"
              style={{ width: `${confidencePct(alert.confidence)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-5">
        <button
          onClick={() => onViewClip(alert)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 text-xs font-bold transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {alert.video_url ? 'Xem clip' : 'Không có clip'}
        </button>

        {isPending && (
          <>
            <button
              onClick={() => onResolve(alert.id)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-bold transition-all ml-auto"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Đã xử lý
            </button>
            <button
              onClick={() => onFalseAlarm(alert.id)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-xl border border-slate-500/20 text-xs font-bold transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Báo động giả
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Emergency: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [selectedClip, setSelectedClip] = useState<any>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const fetchAlerts = useCallback(async () => {
    try {
      let data: any[]
      try {
        data = await getFallClips(50)
      } catch {
        // Fallback nếu backend chưa có endpoint fall-clips
        data = await getAlerts(50, 'fall_detected')
      }
      setAlerts(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching fall clips:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket for real-time updates
  useEffect(() => {
    fetchAlerts()

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws`)
      wsRef.current = ws

      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connect, 3000) // Auto reconnect
      }
      ws.onerror = () => setWsConnected(false)
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'fall_alert') {
            const newAlert = payload.data
            setAlerts(prev => [newAlert, ...prev])
            setLastUpdate(new Date())
          } else if (payload.type === 'alert_resolved') {
            setAlerts(prev =>
              prev.map(a => a.id === payload.data.id
                ? { ...a, status: 'resolved', statusLabel: 'Đã giải quyết' }
                : a
              )
            )
          }
        } catch {}
      }
    }

    connect()
    return () => { wsRef.current?.close() }
  }, [fetchAlerts])

  const handleResolve = async (id: number) => {
    try {
      await resolveAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved', statusLabel: 'Đã giải quyết' } : a))
    } catch (err) { console.error(err) }
  }

  const handleFalseAlarm = async (id: number) => {
    try {
      await markFalseAlarm(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'processed', statusLabel: 'Báo động giả' } : a))
    } catch (err) { console.error(err) }
  }

  const filtered = alerts.filter(a => {
    if (filter === 'pending') return a.status === 'pending'
    if (filter === 'resolved') return a.status === 'resolved' || a.status === 'processed'
    return true
  })

  const pendingCount = alerts.filter(a => a.status === 'pending').length
  const latestAlert = alerts[0]

  return (
    <>
      <Head>
        <title>Cảnh báo khẩn cấp | SafeGuard AI</title>
      </Head>

      <Layout>
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Cảnh báo khẩn cấp</h1>
                {pendingCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-black animate-pulse">
                    {pendingCount} chưa xử lý
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Theo dõi và xử lý sự cố té ngã theo thời gian thực
                </p>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${wsConnected ? 'text-emerald-500' : 'text-red-400'}`}>
                  <Wifi className="w-3.5 h-3.5" />
                  {wsConnected ? 'Live' : 'Mất kết nối'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-xs text-slate-400">
                  Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
                </span>
              )}
              <button
                onClick={() => { setLoading(true); fetchAlerts() }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng sự cố', value: alerts.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Chưa xử lý', value: pendingCount, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
              { label: 'Đã giải quyết', value: alerts.filter(a => a.status === 'resolved').length, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Có clip video', value: alerts.filter(a => a.video_url).length, icon: Video, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
                <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{s.value}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Latest Alert Banner ── */}
          {latestAlert && latestAlert.status === 'pending' && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)] p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-black uppercase tracking-widest">CẢNH BÁO MỚI NHẤT</span>
                    </div>
                    <h2 className="text-xl font-black text-white">Phát hiện TÉ NGÃ — Độ tin cậy {confidencePct(latestAlert.confidence)}%</h2>
                    <p className="text-red-300 text-sm font-medium">{latestAlert.location} • {formatTime(latestAlert.timestamp)}</p>
                  </div>
                </div>
                <div className="ml-auto flex gap-3 shrink-0">
                  <button onClick={() => setSelectedClip(latestAlert)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 font-bold text-sm transition-all">
                    <Play className="w-4 h-4 fill-current" /> Xem clip
                  </button>
                  <button onClick={() => handleResolve(latestAlert.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-4 h-4" /> Đã xử lý
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Emergency Actions ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="tel:115"
              className="flex items-center justify-center gap-3 py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all group">
              <Phone className="w-5 h-5 group-hover:animate-bounce" /> Gọi cấp cứu 115
            </a>
            <button className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg transition-all">
              <Users className="w-5 h-5" /> Báo người nhà
            </button>
            <button className="flex items-center justify-center gap-3 py-4 px-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <Shield className="w-5 h-5" /> Gửi báo cáo
            </button>
          </div>

          {/* ── Alert list ── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-4 border-b border-slate-100 dark:border-slate-800">
              <Filter className="w-4 h-4 text-slate-400 mr-2" />
              {(['all', 'pending', 'resolved'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? 'bg-slate-900 dark:bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}>
                  {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chưa xử lý' : 'Đã xử lý'}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400">{filtered.length} sự cố</span>
            </div>

            {/* Cards grid */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw className="w-10 h-10 text-slate-400 animate-spin" />
                  <p className="text-slate-400 font-bold text-sm">Đang tải dữ liệu cảnh báo...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Shield className="w-16 h-16 text-slate-700" />
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                    {filter === 'pending' ? 'Không có sự cố nào đang chờ xử lý' : 'Chưa có sự cố nào được ghi nhận'}
                  </p>
                  <p className="text-slate-600 text-xs">Camera AI sẽ tự động phát hiện và báo cáo tại đây</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((alert, idx) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      isLatest={idx === 0 && filter === 'all'}
                      onResolve={handleResolve}
                      onFalseAlarm={handleFalseAlarm}
                      onViewClip={setSelectedClip}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>

      {/* Clip viewer modal */}
      {selectedClip && (
        <ClipPlayer alert={selectedClip} onClose={() => setSelectedClip(null)} />
      )}
    </>
  )
}

export default Emergency
