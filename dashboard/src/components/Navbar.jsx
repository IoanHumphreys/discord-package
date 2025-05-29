import { Home, BarChart3, Terminal, Settings } from 'lucide-react'

const Navbar = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="w-64 bg-surface border-r border-border p-8 flex flex-col gap-8">
      {/* Brand */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-xl">
          🤖
        </div>
        <h1 className="text-xl font-semibold text-white">Discord Bot</h1>
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-text-muted hover:bg-surface-light hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar