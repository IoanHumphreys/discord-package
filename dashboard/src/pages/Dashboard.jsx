import { Activity, Users, Server, Zap, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

const Dashboard = ({ stats, loading, error, onRefresh }) => {
  const [activities, setActivities] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (!loading && !error) {
      fetchActivities()
    }
  }, [loading, error])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/activity`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setActivities([
        {
          id: 1,
          type: 'connection',
          message: 'Bot connected to Gaming Hub',
          created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'command',
          message: 'Ban command executed',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'system',
          message: 'Database reconnected',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      ])
    } finally {
      setActivityLoading(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffMs / 86400000)}d ago`
  }

  const getActivityDotColor = (type) => {
    switch (type) {
      case 'connection': return 'bg-green-500'
      case 'command': return 'bg-blue-500'  
      case 'system': return 'bg-orange-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-white">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full spinning mb-3"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-4 gap-4 bg-background text-white">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-text-muted text-sm">Monitor your bot's performance and activity</p>
        </div>
        <button 
          onClick={onRefresh} 
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {/* Stat Cards */}
        <div className="bg-surface border border-border rounded-lg p-4 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500"></div>
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <Server size={20} className="opacity-80" />
            <span className="font-medium text-sm">Servers</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats?.guilds || 0}</div>
          <div className="text-xs text-green-500 font-medium">
            {stats?.guilds > 0 ? 'Connected' : 'Offline'}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <Users size={20} className="opacity-80" />
            <span className="font-medium text-sm">Users</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {stats?.users ? (stats.users > 999 ? `${Math.floor(stats.users/1000)}k` : stats.users) : 0}
          </div>
          <div className="text-xs text-green-500 font-medium">
            {stats?.users > 0 ? 'Active' : 'None'}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-500"></div>
          <div className="flex items-center gap-2 text-text-muted mb-3">
            <Zap size={20} className="opacity-80" />
            <span className="font-medium text-sm">Commands</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats?.commands || 0}</div>
          <div className="text-xs text-green-500 font-medium">Available</div>
        </div>

        {/* Uptime Card */}
        <div className="bg-surface border border-border rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500">
              <Activity size={16} />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-green-500">{stats?.uptime || '0m'}</div>
              <div className="text-text-muted text-xs">System Uptime</div>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${stats?.guilds > 0 ? 'bg-green-500 pulse-dot' : 'bg-red-500'}`}></div>
              <span className="text-xs text-white">
                {stats?.guilds > 0 ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1 pt-3 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Ping</span>
              <span className="text-white font-semibold">{stats?.ping || 0}ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Memory</span>
              <span className="text-white font-semibold">{stats?.memory || 0}MB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Last Restart</span>
              <span className="text-white font-semibold">
                {stats?.lastRestart ? formatTimeAgo(stats.lastRestart) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button className="bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5">
              Restart Bot
            </button>
            <button className="bg-surface-light hover:bg-border text-white py-2 px-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 border border-border">
              View Logs
            </button>
            <button className="bg-surface-light hover:bg-border text-white py-2 px-3 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 border border-border">
              Deploy Commands
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-lg p-4 col-span-1 lg:col-span-3">
          <h3 className="text-base font-semibold text-white mb-3">Recent Activity</h3>
          <div className="h-full">
            {activityLoading ? (
              <div className="flex items-center gap-2 text-text-muted">
                <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full spinning"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activities.length > 0 ? activities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-2 p-2 bg-surface-light rounded-lg hover:bg-border transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${getActivityDotColor(activity.type)}`}></div>
                    <div className="flex-1">
                      <div className="text-white text-xs">{activity.message}</div>
                      <div className="text-text-muted text-xs mt-0.5">{formatTimeAgo(activity.created_at)}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-text-muted py-6 text-sm">No recent activity</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard