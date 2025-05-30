// dashboard/src/App.jsx
import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Stats from './pages/Stats'
import Commands from './pages/Commands'
import Settings from './pages/Settings'
import './styles/App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [botStats, setBotStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBotStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchBotStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBotStats = async () => {
    try {
      setError(null)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stats`, {
        credentials: 'include' // Include cookies for authentication
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated, handled by ProtectedRoute
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setBotStats(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch bot stats:', error)
      setError(error.message)
      
      // Fallback to mock data if API fails
      setBotStats({
        guilds: 0,
        users: 0,
        commands: 0,
        uptime: '0m',
        ping: 0,
        memory: 0,
        lastRestart: new Date().toISOString()
      })
      setLoading(false)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={botStats} loading={loading} error={error} onRefresh={fetchBotStats} />
      case 'stats':
        return <Stats />
      case 'commands':
        return <Commands />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard stats={botStats} loading={loading} error={error} onRefresh={fetchBotStats} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 m-4 flex items-center justify-between text-red-400">
            <span>⚠️ API Connection Issue: {error}</span>
            <button 
              onClick={fetchBotStats} 
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App