// dashboard/src/components/Navbar.jsx
import { Home, BarChart3, Terminal, Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, logout, getAvatarUrl, getDisplayName } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    setProfileDropdownOpen(false)
    await logout()
  }

  return (
    <nav className="w-64 bg-surface border-r border-border p-6 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 pb-6 border-b border-border mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-xl">
          🤖
        </div>
        <h1 className="text-xl font-semibold text-white">Discord Bot</h1>
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-text-muted hover:bg-surface-light hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* User Profile Section */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light transition-all group"
          >
            <div className="relative">
              <img
                src={getAvatarUrl(user, 64)}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-border group-hover:border-primary transition-colors"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-surface rounded-full"></div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium text-sm truncate">
                {getDisplayName(user)}
              </p>
              <p className="text-text-muted text-xs truncate">
                @{user?.username || 'unknown'}
              </p>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-text-muted transition-transform ${
                profileDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(user, 64)}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full border-2 border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {getDisplayName(user)}
                    </p>
                    <p className="text-text-muted text-xs truncate">
                      {user?.email || `@${user?.username}`}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-xs font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    setCurrentPage('settings')
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-white transition-all"
                >
                  <User size={16} />
                  <span className="text-sm">Account Settings</span>
                </button>
                
                <div className="border-t border-border my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="bg-surface-light border border-border rounded-lg p-3">
            <div className="text-lg font-bold text-primary">{user?.guilds?.length || 0}</div>
            <div className="text-xs text-text-muted">Servers</div>
          </div>
          <div className="bg-surface-light border border-border rounded-lg p-3">
            <div className="text-lg font-bold text-secondary">Admin</div>
            <div className="text-xs text-text-muted">Role</div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar