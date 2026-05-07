import React, { useState } from 'react'
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
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, badge: '3' },
    { name: 'Profiles', href: '/profiles', icon: Users },
    { name: 'Devices', href: '/devices', icon: Monitor },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    return router.pathname === href
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">SafeGuard AI</h1>
              <p className="text-xs text-gray-500">Precision Monitoring</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href) 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* SOS Button */}
          <div className="p-4 border-t">
            <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Quick SOS
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <Bell className="w-6 h-6" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <HelpCircle className="w-6 h-6" />
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                  Emergency Call
                </button>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
