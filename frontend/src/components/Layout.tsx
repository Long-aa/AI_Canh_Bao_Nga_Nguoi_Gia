import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  Settings, 
  Monitor,
  Bell,
  HelpCircle,
  Phone,
  User,
  Search,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Shield,
  Moon,
  Sun
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../context/ThemeContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()
  const router = useRouter()

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cảnh báo', href: '/emergency', icon: AlertTriangle, badge: '3' },
    { name: 'Người dùng', href: '/profiles', icon: Users },
    { name: 'Thiết bị', href: '/devices', icon: Monitor },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    return router.pathname === href
  }

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''} bg-[#f8fafc] dark:bg-slate-950 flex`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-300 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 transition-opacity duration-300">
                <h1 className="text-lg font-bold text-white tracking-tight leading-tight">SafeGuard AI</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrator</p>
              </div>
            )}
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group
                    ${active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  {!isCollapsed && (
                    <span className="ml-3 flex-1">{item.name}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section at Bottom */}
          <div className="p-4 border-t border-slate-800/50 space-y-2">
            <button 
              onClick={handleLogout}
              className={`
                w-full flex items-center px-3 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group
              `}
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400" />
              {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
            </button>
            
            {!isCollapsed && (
              <div className="mt-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    AD
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <p className="text-sm font-bold text-white">Quản trị viên</p>
                    <p className="text-xs text-slate-500">admin@safeguard.ai</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
          <div className="h-full px-4 sm:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>

              <div className="hidden md:flex relative group w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thông tin..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-blue-200 dark:focus:border-blue-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                )}
              </button>

              <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group">
                <Bell className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </button>
              
              <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block"></div>
              
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all font-bold text-sm">
                <Phone className="w-4 h-4 fill-current" />
                Emergency
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
